/**
 * Skeleton Renderer Utility
 * Functions for drawing MediaPipe pose landmarks with enhanced styling
 */

import { LandmarksArray, Landmark } from '../types/movement';

// ============================================================================
// Constants
// ============================================================================

/**
 * Patternstein color scheme for skeleton overlay
 */
export const PATTERNSTEIN_COLORS = {
  // Landmark colors by body region
  face: '#00d4ff',        // Cyan (face landmarks)
  upperBody: '#00ff88',   // Green (shoulders, arms, torso)
  lowerBody: '#ff9800',   // Orange (hips, legs, feet)
  
  // Connection colors
  connections: '#00d4ff', // Cyan with transparency
  
  // Glow effects
  glowColor: 'rgba(0, 212, 255, 0.5)',
  glowIntensity: 10,      // pixels
};

/**
 * Rendering configuration
 */
export const RENDER_CONFIG = {
  landmarkRadius: 6,      // pixels
  connectionWidth: 3,     // pixels
  glowBlur: 15,          // pixels (increased for more subtle glow)
  opacity: 0.9,          // 0-1
  minVisibility: 0.5,    // threshold for rendering
  fadeInDuration: 300,   // milliseconds for fade-in animation
  minConnectionWidth: 2, // minimum line width for low confidence
  maxConnectionWidth: 4, // maximum line width for high confidence
};

/**
 * MediaPipe Pose landmark connections
 * Defines which landmarks connect to form anatomically correct skeleton
 */
export const POSE_CONNECTIONS: [number, number][] = [
  // Face outline
  [0, 1], [1, 2], [2, 3], [3, 7],
  [0, 4], [4, 5], [5, 6], [6, 8],
  [9, 10],
  
  // Torso
  [11, 12], [11, 23], [12, 24], [23, 24],
  
  // Left arm
  [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19],
  
  // Right arm
  [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20],
  
  // Left leg
  [23, 25], [25, 27], [27, 29], [27, 31], [29, 31],
  
  // Right leg
  [24, 26], [26, 28], [28, 30], [28, 32], [30, 32],
];

/**
 * Body region definitions for color coding
 */
export const BODY_REGIONS = {
  face: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  upperBody: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
  lowerBody: [23, 24, 25, 26, 27, 28, 29, 30, 31, 32],
};

// ============================================================================
// Animation State
// ============================================================================

/**
 * Track when landmarks first appear for fade-in animation
 */
interface LandmarkAnimationState {
  firstSeenTime: number;
  opacity: number;
}

const landmarkAnimationState = new Map<number, LandmarkAnimationState>();

/**
 * Reset animation state (call when camera stops)
 */
export function resetAnimationState(): void {
  landmarkAnimationState.clear();
}

/**
 * Calculate opacity for fade-in animation
 */
function calculateFadeInOpacity(landmarkIndex: number): number {
  const now = Date.now();
  
  if (!landmarkAnimationState.has(landmarkIndex)) {
    // First time seeing this landmark
    landmarkAnimationState.set(landmarkIndex, {
      firstSeenTime: now,
      opacity: 0,
    });
  }
  
  const state = landmarkAnimationState.get(landmarkIndex)!;
  const elapsed = now - state.firstSeenTime;
  
  if (elapsed >= RENDER_CONFIG.fadeInDuration) {
    // Fade-in complete
    state.opacity = 1.0;
    return 1.0;
  }
  
  // Linear fade-in
  state.opacity = elapsed / RENDER_CONFIG.fadeInDuration;
  return state.opacity;
}

// ============================================================================
// Drawing Functions
// ============================================================================

/**
 * Get color for landmark based on body region
 */
export function getLandmarkColor(landmarkIndex: number): string {
  if (BODY_REGIONS.face.includes(landmarkIndex)) {
    return PATTERNSTEIN_COLORS.face;
  } else if (BODY_REGIONS.upperBody.includes(landmarkIndex)) {
    return PATTERNSTEIN_COLORS.upperBody;
  } else {
    return PATTERNSTEIN_COLORS.lowerBody;
  }
}

/**
 * Draw connections between landmarks with variable thickness based on confidence
 */
export function drawConnections(
  ctx: CanvasRenderingContext2D,
  landmarks: LandmarksArray,
  canvasWidth: number,
  canvasHeight: number,
  minVisibility: number = RENDER_CONFIG.minVisibility
): void {
  // Null check for canvas context
  if (!ctx) {
    console.error('Canvas context is null in drawConnections');
    return;
  }

  // Validate landmarks array
  if (!landmarks || !Array.isArray(landmarks) || landmarks.length !== 33) {
    console.warn('Invalid landmarks array in drawConnections:', landmarks?.length);
    return;
  }

  try {
    ctx.strokeStyle = PATTERNSTEIN_COLORS.connections;
    ctx.globalAlpha = 0.7; // Semi-transparent connections

    for (const [startIdx, endIdx] of POSE_CONNECTIONS) {
      // Validate indices are within bounds
      if (startIdx < 0 || startIdx >= landmarks.length || endIdx < 0 || endIdx >= landmarks.length) {
        console.warn(`Invalid connection indices: [${startIdx}, ${endIdx}]`);
        continue;
      }

      const startLm = landmarks[startIdx];
      const endLm = landmarks[endIdx];

      // Skip connections with missing landmarks
      if (!startLm || !endLm) {
        continue;
      }

      // Validate visibility values
      const startVis = typeof startLm.visibility === 'number' && !isNaN(startLm.visibility) 
        ? startLm.visibility 
        : 0;
      const endVis = typeof endLm.visibility === 'number' && !isNaN(endLm.visibility) 
        ? endLm.visibility 
        : 0;

      // Only draw if both landmarks are visible
      if (startVis >= minVisibility && endVis >= minVisibility) {
        // Validate coordinates
        if (
          typeof startLm.x === 'number' && !isNaN(startLm.x) &&
          typeof startLm.y === 'number' && !isNaN(startLm.y) &&
          typeof endLm.x === 'number' && !isNaN(endLm.x) &&
          typeof endLm.y === 'number' && !isNaN(endLm.y)
        ) {
          // Vary line thickness based on average confidence of both landmarks
          const avgConfidence = (startVis + endVis) / 2;
          const lineWidth = RENDER_CONFIG.minConnectionWidth + 
            (RENDER_CONFIG.maxConnectionWidth - RENDER_CONFIG.minConnectionWidth) * avgConfidence;
          
          ctx.lineWidth = lineWidth;
          ctx.beginPath();
          ctx.moveTo(startLm.x * canvasWidth, startLm.y * canvasHeight);
          ctx.lineTo(endLm.x * canvasWidth, endLm.y * canvasHeight);
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1.0; // Reset alpha
  } catch (error) {
    console.error('Error drawing connections:', error);
    // Reset context state to prevent cascading errors
    try {
      ctx.globalAlpha = 1.0;
    } catch (resetError) {
      console.error('Failed to reset context state:', resetError);
    }
  }
}

/**
 * Draw landmark points with color coding, glow effects, and fade-in animation
 */
export function drawLandmarkPoints(
  ctx: CanvasRenderingContext2D,
  landmarks: LandmarksArray,
  canvasWidth: number,
  canvasHeight: number,
  minVisibility: number = RENDER_CONFIG.minVisibility
): void {
  // Null check for canvas context
  if (!ctx) {
    console.error('Canvas context is null in drawLandmarkPoints');
    return;
  }

  // Validate landmarks array
  if (!landmarks || !Array.isArray(landmarks) || landmarks.length !== 33) {
    console.warn('Invalid landmarks array in drawLandmarkPoints:', landmarks?.length);
    return;
  }

  try {
    landmarks.forEach((landmark: Landmark, index: number) => {
      // Skip invalid landmarks
      if (!landmark) {
        return;
      }

      // Validate visibility value
      const visibility = typeof landmark.visibility === 'number' && !isNaN(landmark.visibility)
        ? landmark.visibility
        : 0;

      // Only draw visible landmarks
      if (visibility >= minVisibility) {
        // Validate coordinates
        if (
          typeof landmark.x === 'number' && !isNaN(landmark.x) &&
          typeof landmark.y === 'number' && !isNaN(landmark.y)
        ) {
          // Calculate fade-in opacity
          const fadeOpacity = calculateFadeInOpacity(index);
          
          // Get color for this landmark
          const color = getLandmarkColor(index);
          
          // Apply glow effect with fade-in
          ctx.shadowBlur = RENDER_CONFIG.glowBlur * fadeOpacity;
          ctx.shadowColor = color;
          
          // Set fill style with fade-in opacity
          ctx.fillStyle = color;
          ctx.globalAlpha = fadeOpacity * RENDER_CONFIG.opacity;

          ctx.beginPath();
          ctx.arc(
            landmark.x * canvasWidth,
            landmark.y * canvasHeight,
            RENDER_CONFIG.landmarkRadius,
            0,
            2 * Math.PI
          );
          ctx.fill();
        }
      }
    });

    // Reset shadow and alpha
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1.0;
  } catch (error) {
    console.error('Error drawing landmark points:', error);
    // Reset context state to prevent cascading errors
    try {
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1.0;
    } catch (resetError) {
      console.error('Failed to reset context state:', resetError);
    }
  }
}

/**
 * Main function to draw complete skeleton overlay
 */
export function drawSkeletonOverlay(
  canvas: HTMLCanvasElement,
  landmarks: LandmarksArray,
  options: {
    showConnections?: boolean;
    showLandmarks?: boolean;
    minVisibility?: number;
  } = {}
): void {
  // Null check for canvas element
  if (!canvas) {
    console.error('Canvas element is null in drawSkeletonOverlay');
    return;
  }

  // Validate landmarks array
  if (!landmarks || !Array.isArray(landmarks) || landmarks.length !== 33) {
    console.warn('Invalid landmarks array in drawSkeletonOverlay:', landmarks?.length);
    return;
  }

  const {
    showConnections = true,
    showLandmarks = true,
    minVisibility = RENDER_CONFIG.minVisibility,
  } = options;

  try {
    const ctx = canvas.getContext('2d');
    
    // Null check for canvas context
    if (!ctx) {
      console.error('Failed to get 2D context from canvas');
      return;
    }

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Validate canvas dimensions
    if (canvasWidth <= 0 || canvasHeight <= 0) {
      console.warn('Invalid canvas dimensions:', { canvasWidth, canvasHeight });
      return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw connections first (so they appear behind landmarks)
    if (showConnections) {
      drawConnections(ctx, landmarks, canvasWidth, canvasHeight, minVisibility);
    }

    // Draw landmark points on top
    if (showLandmarks) {
      drawLandmarkPoints(ctx, landmarks, canvasWidth, canvasHeight, minVisibility);
    }
  } catch (error) {
    console.error('Error in drawSkeletonOverlay:', error);
    // Don't throw - allow video feed to continue
  }
}
