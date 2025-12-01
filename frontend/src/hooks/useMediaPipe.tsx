/**
 * useMediaPipe Hook
 * Sets up camera, initializes MediaPipe Pose, and provides real-time landmarks
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Pose, Results } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { LandmarksArray } from '../../../src/types/movement';
import { smoothLandmarks } from '../../../src/utils/mediapipeHelpers';
import { drawSkeletonOverlay, resetAnimationState } from '../../../src/utils/skeletonRenderer';

// ============================================================================
// Configuration
// ============================================================================

const MEDIAPIPE_CONFIG = {
  modelComplexity: 1, // 0=lite, 1=full, 2=heavy
  smoothLandmarks: true,
  enableSegmentation: false, // Disable for performance
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7,
};

const FRAME_THROTTLE_FPS = 10; // Process 10 frames per second (TUNABLE: 5-30)
const SMOOTHING_ALPHA = 0.5; // Exponential smoothing factor (TUNABLE: 0.3-0.7)
const MIN_FPS_THRESHOLD = 25; // Warn if FPS drops below this
const MAX_RENDER_TIME_MS = 16; // Skip frames if rendering takes longer than this (60 FPS = 16.67ms)
const PERFORMANCE_LOG_INTERVAL_MS = 5000; // Log performance metrics every 5 seconds

// ============================================================================
// Types
// ============================================================================

interface UseMediaPipeOptions {
  onResults?: (landmarks: LandmarksArray, timestamp: number) => void;
  enableSmoothing?: boolean;
  throttleFps?: number;
  useWebWorker?: boolean; // Future: offload to Web Worker
}

interface UseMediaPipeReturn {
  landmarks: LandmarksArray | null;
  isLoading: boolean;
  isActive: boolean;
  error: string | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  sendToServer: () => Promise<void>;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useMediaPipe(options: UseMediaPipeOptions = {}): UseMediaPipeReturn {
  const {
    onResults,
    enableSmoothing = true,
    throttleFps = FRAME_THROTTLE_FPS,
    useWebWorker = false,
  } = options;

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseRef = useRef<Pose | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const previousLandmarksRef = useRef<LandmarksArray | null>(null);
  const lastProcessedTimeRef = useRef<number>(0);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Performance monitoring refs
  const frameTimesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef<number>(0);
  const lastRenderTimeRef = useRef<number>(0);
  const renderTimesRef = useRef<number[]>([]);
  const lastPerformanceLogRef = useRef<number>(0);
  const skippedFramesRef = useRef<number>(0);

  // State
  const [landmarks, setLandmarks] = useState<LandmarksArray | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // MediaPipe Initialization
  // ============================================================================

  const initializeMediaPipe = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Create Pose instance
      const pose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        },
      });

      // Configure Pose
      pose.setOptions(MEDIAPIPE_CONFIG);

      // Set up results callback
      pose.onResults((results: Results) => {
        handlePoseResults(results);
      });

      poseRef.current = pose;
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize MediaPipe';
      setError(errorMessage);
      setIsLoading(false);
      console.error('MediaPipe initialization error:', err);
    }
  }, []);

  // ============================================================================
  // Camera Setup
  // ============================================================================

  const startCamera = useCallback(async () => {
    if (!videoRef.current || !poseRef.current) {
      setError('Video element or Pose not initialized');
      return;
    }

    try {
      setError(null);

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
      });

      videoRef.current.srcObject = stream;

      // Wait for video to be ready
      await new Promise<void>((resolve) => {
        if (videoRef.current) {
          videoRef.current.onloadedmetadata = () => resolve();
        }
      });

      // Create Camera instance
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current && poseRef.current) {
            // Throttle frame processing
            const now = Date.now();
            const timeSinceLastProcess = now - lastProcessedTimeRef.current;
            const minInterval = 1000 / throttleFps;

            if (timeSinceLastProcess >= minInterval) {
              await poseRef.current.send({ image: videoRef.current });
              lastProcessedTimeRef.current = now;
            }
          }
        },
        width: 1280,
        height: 720,
      });

      cameraRef.current = camera;
      await camera.start();
      setIsActive(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start camera';
      setError(errorMessage);
      console.error('Camera start error:', err);
    }
  }, [throttleFps]);

  // ============================================================================
  // Camera Stop
  // ============================================================================

  const stopCamera = useCallback(() => {
    // Stop camera
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }

    // Stop video stream
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    setIsActive(false);
    setLandmarks(null);
    previousLandmarksRef.current = null;

    // Reset performance metrics
    frameTimesRef.current = [];
    renderTimesRef.current = [];
    skippedFramesRef.current = 0;
    lastFrameTimeRef.current = 0;
    lastRenderTimeRef.current = 0;
    lastPerformanceLogRef.current = 0;

    // Reset animation state for fade-in effects
    resetAnimationState();
  }, []);

  // ============================================================================
  // Performance Monitoring
  // ============================================================================

  /**
   * Calculate current FPS based on recent frame times
   */
  const calculateFPS = useCallback((): number => {
    if (frameTimesRef.current.length < 2) return 0;

    const recentFrames = frameTimesRef.current.slice(-30); // Use last 30 frames
    const totalTime = recentFrames[recentFrames.length - 1] - recentFrames[0];
    const fps = ((recentFrames.length - 1) / totalTime) * 1000;

    return fps;
  }, []);

  /**
   * Calculate average render time
   */
  const calculateAvgRenderTime = useCallback((): number => {
    if (renderTimesRef.current.length === 0) return 0;

    const sum = renderTimesRef.current.reduce((acc, time) => acc + time, 0);
    return sum / renderTimesRef.current.length;
  }, []);

  /**
   * Log performance metrics to console
   */
  const logPerformanceMetrics = useCallback(() => {
    const now = Date.now();
    if (now - lastPerformanceLogRef.current < PERFORMANCE_LOG_INTERVAL_MS) {
      return;
    }

    const fps = calculateFPS();
    const avgRenderTime = calculateAvgRenderTime();
    const skippedFrames = skippedFramesRef.current;

    console.log('=== Performance Metrics ===');
    console.log(`FPS: ${fps.toFixed(2)}`);
    console.log(`Avg Render Time: ${avgRenderTime.toFixed(2)}ms`);
    console.log(`Skipped Frames: ${skippedFrames}`);
    console.log(`Frame Times (last 10): ${frameTimesRef.current.slice(-10).map(t => t.toFixed(0)).join(', ')}`);
    console.log(`Render Times (last 10): ${renderTimesRef.current.slice(-10).map(t => t.toFixed(2)).join(', ')}ms`);

    // Warn if FPS is below threshold
    if (fps > 0 && fps < MIN_FPS_THRESHOLD) {
      console.warn(`⚠️ FPS dropped below ${MIN_FPS_THRESHOLD}: ${fps.toFixed(2)} FPS`);
    }

    lastPerformanceLogRef.current = now;
    skippedFramesRef.current = 0; // Reset skipped frames counter
  }, [calculateFPS, calculateAvgRenderTime]);

  /**
   * Record frame timing
   */
  const recordFrameTiming = useCallback(() => {
    const now = performance.now();

    // Record frame time
    frameTimesRef.current.push(now);

    // Keep only last 60 frames (2 seconds at 30 FPS)
    if (frameTimesRef.current.length > 60) {
      frameTimesRef.current.shift();
    }

    lastFrameTimeRef.current = now;
  }, []);

  /**
   * Record render timing
   */
  const recordRenderTiming = useCallback((renderTime: number) => {
    renderTimesRef.current.push(renderTime);

    // Keep only last 60 render times
    if (renderTimesRef.current.length > 60) {
      renderTimesRef.current.shift();
    }
  }, []);

  // ============================================================================
  // Results Handler
  // ============================================================================

  const handlePoseResults = useCallback(
    (results: Results) => {
      try {
        // Validate results object
        if (!results || !results.poseLandmarks) {
          return;
        }

        // Handle incomplete landmarks array
        if (results.poseLandmarks.length !== 33) {
          console.warn(`Incomplete landmarks: ${results.poseLandmarks.length} (expected 33)`);
          return;
        }

        // Record frame timing
        recordFrameTiming();

        // Convert MediaPipe landmarks to our format with validation
        let currentLandmarks: LandmarksArray;
        try {
          currentLandmarks = results.poseLandmarks.map((lm) => ({
            x: typeof lm.x === 'number' && !isNaN(lm.x) ? lm.x : 0,
            y: typeof lm.y === 'number' && !isNaN(lm.y) ? lm.y : 0,
            z: typeof lm.z === 'number' && !isNaN(lm.z) ? lm.z : 0,
            visibility: typeof lm.visibility === 'number' && !isNaN(lm.visibility) ? lm.visibility : 1.0,
          })) as LandmarksArray;
        } catch (conversionError) {
          console.error('Error converting landmarks:', conversionError);
          return;
        }

        // Apply smoothing if enabled
        if (enableSmoothing && previousLandmarksRef.current) {
          try {
            currentLandmarks = smoothLandmarks(
              currentLandmarks,
              previousLandmarksRef.current,
              SMOOTHING_ALPHA
            );
          } catch (smoothingError) {
            console.error('Error smoothing landmarks:', smoothingError);
            // Continue with unsmoothed landmarks
          }
        }

        // Update state
        setLandmarks(currentLandmarks);
        previousLandmarksRef.current = currentLandmarks;

        // Draw on canvas with performance monitoring
        if (canvasRef.current) {
          try {
            const renderStartTime = performance.now();
            
            // Check if we should skip this frame due to slow rendering
            const timeSinceLastRender = renderStartTime - lastRenderTimeRef.current;
            const lastRenderTime = renderTimesRef.current[renderTimesRef.current.length - 1] || 0;
            
            if (lastRenderTime > MAX_RENDER_TIME_MS && timeSinceLastRender < MAX_RENDER_TIME_MS) {
              // Skip this frame to catch up
              skippedFramesRef.current++;
            } else {
              drawLandmarks(canvasRef.current, results);
              
              const renderEndTime = performance.now();
              const renderTime = renderEndTime - renderStartTime;
              recordRenderTiming(renderTime);
              lastRenderTimeRef.current = renderEndTime;
            }
          } catch (renderError) {
            console.error('Error during canvas rendering:', renderError);
            // Continue without rendering - video feed continues
          }
        }

        // Log performance metrics periodically
        try {
          logPerformanceMetrics();
        } catch (metricsError) {
          console.error('Error logging performance metrics:', metricsError);
        }

        // Call user callback
        if (onResults) {
          try {
            onResults(currentLandmarks, Date.now());
          } catch (callbackError) {
            console.error('Error in user callback:', callbackError);
          }
        }
      } catch (error) {
        console.error('Error in handlePoseResults:', error);
        // Don't throw - allow video feed to continue
      }
    },
    [enableSmoothing, onResults, recordFrameTiming, recordRenderTiming, logPerformanceMetrics]
  );

  // ============================================================================
  // Canvas Drawing
  // ============================================================================

  const drawLandmarks = (canvas: HTMLCanvasElement, results: Results) => {
    try {
      // Null check for canvas element
      if (!canvas) {
        console.error('Canvas element is null in drawLandmarks');
        return;
      }

      // Null check for video element
      if (!videoRef.current) {
        console.warn('Video element is not available');
        return;
      }

      const ctx = canvas.getContext('2d');
      
      // Null check for canvas context
      if (!ctx) {
        console.error('Failed to get 2D context from canvas');
        // Show user notification about degraded functionality
        if (!error) {
          setError('Overlay rendering unavailable - video feed continues');
        }
        return;
      }

      // Canvas dimensions are now managed by ResizeObserver
      // No need to manually set canvas size here

      // Validate results
      if (!results || !results.poseLandmarks) {
        // No landmarks detected - clear canvas and continue
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      // Handle incomplete landmarks array
      if (results.poseLandmarks.length !== 33) {
        console.warn(`Incomplete landmarks array: ${results.poseLandmarks.length} landmarks (expected 33)`);
        // Clear canvas and skip rendering
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      // Draw enhanced skeleton overlay with visibility filtering and color coding
      try {
        // Convert MediaPipe landmarks to our format
        const landmarks: LandmarksArray = results.poseLandmarks.map((lm) => ({
          x: lm.x,
          y: lm.y,
          z: lm.z,
          visibility: lm.visibility ?? 1.0,
        })) as LandmarksArray;

        // Draw skeleton overlay with enhanced styling
        // - Visibility-based filtering (only draw landmarks with visibility > 0.5)
        // - Color coding by body region (face=cyan, upper=green, lower=orange)
        // - Glow effects using canvas shadowBlur and shadowColor
        drawSkeletonOverlay(canvas, landmarks, {
          showConnections: true,
          showLandmarks: true,
          minVisibility: 0.5, // Only draw landmarks with visibility > 0.5
        });
      } catch (renderError) {
        console.error('Error rendering skeleton overlay:', renderError);
        // Clear canvas to prevent visual artifacts
        try {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        } catch (clearError) {
          console.error('Failed to clear canvas after render error:', clearError);
        }
      }
    } catch (error) {
      console.error('Error in drawLandmarks:', error);
      // Don't throw - allow video feed to continue
    }
  };

  // ============================================================================
  // Send to Server
  // ============================================================================

  const sendToServer = useCallback(async () => {
    if (!landmarks) {
      console.warn('No landmarks to send');
      return;
    }

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          landmarks,
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Analysis result:', result);
    } catch (err) {
      console.error('Failed to send landmarks to server:', err);
    }
  }, [landmarks]);

  // ============================================================================
  // Canvas Dimension Synchronization
  // ============================================================================

  /**
   * Synchronize canvas dimensions with video element
   * Uses ResizeObserver to detect video size changes
   * Debounces resize operations to prevent excessive updates
   */
  const syncCanvasDimensions = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Update canvas dimensions to match video
    if (video.videoWidth > 0 && video.videoHeight > 0) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
  }, []);

  /**
   * Debounced resize handler
   * Prevents excessive resize operations during window resize or orientation change
   */
  const debouncedResize = useCallback(() => {
    // Clear existing timeout
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }

    // Set new timeout (50ms debounce)
    resizeTimeoutRef.current = setTimeout(() => {
      syncCanvasDimensions();
    }, 50);
  }, [syncCanvasDimensions]);

  // ============================================================================
  // Lifecycle
  // ============================================================================

  useEffect(() => {
    initializeMediaPipe();

    return () => {
      stopCamera();
      if (poseRef.current) {
        poseRef.current.close();
      }
      // Clean up resize timeout
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [initializeMediaPipe, stopCamera]);

  /**
   * Set up ResizeObserver to watch video element
   * Automatically resizes canvas when video dimensions change
   */
  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    // Create ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
      debouncedResize();
    });

    // Observe video element
    resizeObserver.observe(video);

    // Also listen for window resize and orientation change
    window.addEventListener('resize', debouncedResize);
    window.addEventListener('orientationchange', debouncedResize);

    // Initial sync
    syncCanvasDimensions();

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', debouncedResize);
      window.removeEventListener('orientationchange', debouncedResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [debouncedResize, syncCanvasDimensions]);

  // ============================================================================
  // Return
  // ============================================================================

  return {
    landmarks,
    isLoading,
    isActive,
    error,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    sendToServer,
  };
}
