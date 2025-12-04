/**
 * usePostureCorrection Hook
 * Real-time posture monitoring and correction alerts
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { LandmarksArray } from '../../../src/types/movement';
import {
  analyzePosture,
  detectPostureIssues,
  PostureScore,
  PostureIssue,
} from '../../../src/utils/postureAnalyzer';

// ============================================================================
// Types
// ============================================================================

interface UsePostureCorrectionOptions {
  enabled?: boolean;
  alertInterval?: number; // milliseconds between alerts
  minConfidence?: number; // minimum landmark visibility
  onIssueDetected?: (issues: PostureIssue[]) => void;
  onScoreUpdate?: (score: PostureScore) => void;
}

interface UsePostureCorrectionReturn {
  currentScore: PostureScore | null;
  currentIssues: PostureIssue[];
  isMonitoring: boolean;
  sessionStats: {
    duration: number; // seconds
    avgScore: number;
    issueCount: number;
    goodPostureTime: number; // seconds
  };
  startMonitoring: () => void;
  stopMonitoring: () => void;
  resetSession: () => void;
}

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_OPTIONS = {
  enabled: true,
  alertInterval: 30000, // 30 seconds
  minConfidence: 0.5,
};

const GOOD_POSTURE_THRESHOLD = 85;

// ============================================================================
// Hook Implementation
// ============================================================================

export function usePostureCorrection(
  landmarks: LandmarksArray | null,
  options: UsePostureCorrectionOptions = {}
): UsePostureCorrectionReturn {
  const {
    enabled = DEFAULT_OPTIONS.enabled,
    alertInterval = DEFAULT_OPTIONS.alertInterval,
    minConfidence = DEFAULT_OPTIONS.minConfidence,
    onIssueDetected,
    onScoreUpdate,
  } = options;

  // State
  const [currentScore, setCurrentScore] = useState<PostureScore | null>(null);
  const [currentIssues, setCurrentIssues] = useState<PostureIssue[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    duration: 0,
    avgScore: 0,
    issueCount: 0,
    goodPostureTime: 0,
  });

  // Refs
  const lastAlertTimeRef = useRef<number>(0);
  const sessionStartTimeRef = useRef<number>(0);
  const scoreHistoryRef = useRef<number[]>([]);
  const goodPostureStartRef = useRef<number | null>(null);
  const totalGoodPostureTimeRef = useRef<number>(0);

  // ============================================================================
  // Posture Analysis
  // ============================================================================

  const analyzeLandmarks = useCallback(() => {
    if (!landmarks || !enabled || !isMonitoring) {
      return;
    }

    try {
      // Analyze posture
      const score = analyzePosture(landmarks);
      setCurrentScore(score);

      // Track score history
      scoreHistoryRef.current.push(score.overall);
      if (scoreHistoryRef.current.length > 100) {
        scoreHistoryRef.current.shift();
      }

      // Detect issues
      const issues = detectPostureIssues(score);
      setCurrentIssues(issues);

      // Track good posture time
      if (score.overall >= GOOD_POSTURE_THRESHOLD) {
        if (goodPostureStartRef.current === null) {
          goodPostureStartRef.current = Date.now();
        }
      } else {
        if (goodPostureStartRef.current !== null) {
          const duration = (Date.now() - goodPostureStartRef.current) / 1000;
          totalGoodPostureTimeRef.current += duration;
          goodPostureStartRef.current = null;
        }
      }

      // Update session stats
      const now = Date.now();
      const duration = (now - sessionStartTimeRef.current) / 1000;
      const avgScore = scoreHistoryRef.current.reduce((a, b) => a + b, 0) / scoreHistoryRef.current.length;
      
      setSessionStats({
        duration,
        avgScore: Math.round(avgScore),
        issueCount: issues.length,
        goodPostureTime: Math.round(totalGoodPostureTimeRef.current),
      });

      // Trigger callbacks
      if (onScoreUpdate) {
        onScoreUpdate(score);
      }

      // Alert if issues detected and enough time has passed
      if (issues.length > 0 && now - lastAlertTimeRef.current >= alertInterval) {
        if (onIssueDetected) {
          onIssueDetected(issues);
        }
        lastAlertTimeRef.current = now;
      }
    } catch (error) {
      console.warn('Posture analysis failed:', error);
      // Don't throw - allow monitoring to continue
    }
  }, [landmarks, enabled, isMonitoring, alertInterval, onIssueDetected, onScoreUpdate]);

  // ============================================================================
  // Monitoring Control
  // ============================================================================

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    sessionStartTimeRef.current = Date.now();
    scoreHistoryRef.current = [];
    totalGoodPostureTimeRef.current = 0;
    goodPostureStartRef.current = null;
    lastAlertTimeRef.current = 0;
  }, []);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    
    // Finalize good posture time
    if (goodPostureStartRef.current !== null) {
      const duration = (Date.now() - goodPostureStartRef.current) / 1000;
      totalGoodPostureTimeRef.current += duration;
      goodPostureStartRef.current = null;
    }
  }, []);

  const resetSession = useCallback(() => {
    setCurrentScore(null);
    setCurrentIssues([]);
    setSessionStats({
      duration: 0,
      avgScore: 0,
      issueCount: 0,
      goodPostureTime: 0,
    });
    scoreHistoryRef.current = [];
    totalGoodPostureTimeRef.current = 0;
    goodPostureStartRef.current = null;
    lastAlertTimeRef.current = 0;
  }, []);

  // ============================================================================
  // Effects
  // ============================================================================

  // Analyze landmarks when they update
  useEffect(() => {
    if (landmarks && isMonitoring) {
      analyzeLandmarks();
    }
  }, [landmarks, isMonitoring, analyzeLandmarks]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  // ============================================================================
  // Return
  // ============================================================================

  return {
    currentScore,
    currentIssues,
    isMonitoring,
    sessionStats,
    startMonitoring,
    stopMonitoring,
    resetSession,
  };
}
