/**
 * Posture Analysis Utility
 * Analyzes MediaPipe landmarks to detect posture issues
 */

import { LandmarksArray, Landmark } from '../types/movement';

// ============================================================================
// Types
// ============================================================================

export interface PostureScore {
  overall: number; // 0-100
  neck: {
    status: 'good' | 'forward_head' | 'tilted';
    angle: number;
    score: number;
  };
  shoulders: {
    status: 'good' | 'asymmetric' | 'elevated';
    symmetry: number;
    score: number;
  };
  spine: {
    status: 'good' | 'slouching' | 'leaning';
    angle: number;
    score: number;
  };
}

export interface PostureIssue {
  type: 'forward_head' | 'slouching' | 'asymmetric_shoulders' | 'elevated_shoulders';
  severity: 'mild' | 'moderate' | 'severe';
  message: string;
  recommendation: string;
}

// ============================================================================
// Configuration
// ============================================================================

const POSTURE_THRESHOLDS = {
  neck: {
    good: 150, // degrees - ideal neck angle
    warning: 140,
    critical: 130,
  },
  shoulders: {
    symmetry: 5, // degrees - max acceptable difference
    elevation: 10, // degrees - max acceptable elevation
  },
  spine: {
    good: 170, // degrees - ideal spine angle
    warning: 160,
    critical: 150,
  },
};

// ============================================================================
// Geometry Helpers
// ============================================================================

/**
 * Calculate angle between three points (in degrees)
 */
function calculateAngle(a: Landmark, b: Landmark, c: Landmark): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  
  if (angle > 180.0) {
    angle = 360 - angle;
  }
  
  return angle;
}

/**
 * Calculate distance between two points
 */
function calculateDistance(a: Landmark, b: Landmark): number {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}

/**
 * Calculate vertical difference (for symmetry)
 */
function calculateVerticalDifference(a: Landmark, b: Landmark): number {
  return Math.abs(a.y - b.y);
}

// ============================================================================
// Posture Analysis Functions
// ============================================================================

/**
 * Analyze neck posture (forward head detection)
 */
function analyzeNeck(landmarks: LandmarksArray): PostureScore['neck'] {
  // Key landmarks: nose (0), left ear (7), left shoulder (11), right shoulder (12)
  const nose = landmarks[0];
  const leftEar = landmarks[7];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  
  // Calculate neck angle (ear to shoulder alignment)
  const neckAngle = calculateAngle(nose, leftEar, leftShoulder);
  
  // Determine status
  let status: PostureScore['neck']['status'] = 'good';
  let score = 100;
  
  if (neckAngle < POSTURE_THRESHOLDS.neck.critical) {
    status = 'forward_head';
    score = 40;
  } else if (neckAngle < POSTURE_THRESHOLDS.neck.warning) {
    status = 'forward_head';
    score = 70;
  } else if (neckAngle < POSTURE_THRESHOLDS.neck.good) {
    score = 85;
  }
  
  // Check for tilt
  const shoulderMidpoint = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2,
    z: (leftShoulder.z + rightShoulder.z) / 2,
    visibility: 1,
  };
  
  const headTilt = Math.abs(nose.x - shoulderMidpoint.x);
  if (headTilt > 0.1) {
    status = 'tilted';
    score = Math.min(score, 75);
  }
  
  return { status, angle: neckAngle, score };
}

/**
 * Analyze shoulder posture (symmetry and elevation)
 */
function analyzeShoulders(landmarks: LandmarksArray): PostureScore['shoulders'] {
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  
  // Calculate shoulder symmetry (vertical difference)
  const symmetryDiff = calculateVerticalDifference(leftShoulder, rightShoulder) * 100;
  
  // Calculate shoulder elevation (distance from hips)
  const leftShoulderToHip = calculateDistance(leftShoulder, leftHip);
  const rightShoulderToHip = calculateDistance(rightShoulder, rightHip);
  const avgShoulderToHip = (leftShoulderToHip + rightShoulderToHip) / 2;
  
  // Determine status
  let status: PostureScore['shoulders']['status'] = 'good';
  let score = 100;
  
  if (symmetryDiff > POSTURE_THRESHOLDS.shoulders.symmetry) {
    status = 'asymmetric';
    score = 70;
  }
  
  // Check for elevated shoulders (tension indicator)
  if (avgShoulderToHip < 0.3) {
    status = 'elevated';
    score = Math.min(score, 75);
  }
  
  return { status, symmetry: symmetryDiff, score };
}

/**
 * Analyze spine posture (slouching detection)
 */
function analyzeSpine(landmarks: LandmarksArray): PostureScore['spine'] {
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  
  // Calculate shoulder and hip midpoints
  const shoulderMidpoint = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2,
    z: (leftShoulder.z + rightShoulder.z) / 2,
    visibility: 1,
  };
  
  const hipMidpoint = {
    x: (leftHip.x + rightHip.x) / 2,
    y: (leftHip.y + rightHip.y) / 2,
    z: (leftHip.z + rightHip.z) / 2,
    visibility: 1,
  };
  
  // Calculate spine angle (vertical alignment)
  const spineAngle = 180 - Math.abs(Math.atan2(
    shoulderMidpoint.y - hipMidpoint.y,
    shoulderMidpoint.x - hipMidpoint.x
  ) * 180 / Math.PI);
  
  // Determine status
  let status: PostureScore['spine']['status'] = 'good';
  let score = 100;
  
  if (spineAngle < POSTURE_THRESHOLDS.spine.critical) {
    status = 'slouching';
    score = 40;
  } else if (spineAngle < POSTURE_THRESHOLDS.spine.warning) {
    status = 'slouching';
    score = 70;
  } else if (spineAngle < POSTURE_THRESHOLDS.spine.good) {
    score = 85;
  }
  
  // Check for leaning
  const horizontalOffset = Math.abs(shoulderMidpoint.x - hipMidpoint.x);
  if (horizontalOffset > 0.1) {
    status = 'leaning';
    score = Math.min(score, 80);
  }
  
  return { status, angle: spineAngle, score };
}

// ============================================================================
// Main Analysis Function
// ============================================================================

/**
 * Analyze complete posture from landmarks
 */
export function analyzePosture(landmarks: LandmarksArray): PostureScore {
  // Validate landmarks
  if (!landmarks || landmarks.length !== 33) {
    throw new Error('Invalid landmarks array');
  }
  
  // Check if key landmarks are visible
  const keyLandmarks = [0, 7, 11, 12, 23, 24];
  const allVisible = keyLandmarks.every(idx => landmarks[idx].visibility > 0.5);
  
  if (!allVisible) {
    throw new Error('Key landmarks not visible');
  }
  
  // Analyze each component
  const neck = analyzeNeck(landmarks);
  const shoulders = analyzeShoulders(landmarks);
  const spine = analyzeSpine(landmarks);
  
  // Calculate overall score (weighted average)
  const overall = Math.round(
    neck.score * 0.35 +
    shoulders.score * 0.25 +
    spine.score * 0.40
  );
  
  return {
    overall,
    neck,
    shoulders,
    spine,
  };
}

/**
 * Detect posture issues from score
 */
export function detectPostureIssues(score: PostureScore): PostureIssue[] {
  const issues: PostureIssue[] = [];
  
  // Neck issues
  if (score.neck.status === 'forward_head') {
    const severity = score.neck.angle < POSTURE_THRESHOLDS.neck.critical ? 'severe' :
                     score.neck.angle < POSTURE_THRESHOLDS.neck.warning ? 'moderate' : 'mild';
    
    issues.push({
      type: 'forward_head',
      severity,
      message: `Forward head posture detected (${Math.round(score.neck.angle)}°)`,
      recommendation: 'Pull your chin back and align your ears over your shoulders',
    });
  }
  
  if (score.neck.status === 'tilted') {
    issues.push({
      type: 'forward_head',
      severity: 'mild',
      message: 'Head tilt detected',
      recommendation: 'Center your head over your shoulders',
    });
  }
  
  // Shoulder issues
  if (score.shoulders.status === 'asymmetric') {
    issues.push({
      type: 'asymmetric_shoulders',
      severity: score.shoulders.symmetry > 10 ? 'moderate' : 'mild',
      message: `Shoulder asymmetry detected (${score.shoulders.symmetry.toFixed(1)}° difference)`,
      recommendation: 'Level your shoulders and check for uneven weight distribution',
    });
  }
  
  if (score.shoulders.status === 'elevated') {
    issues.push({
      type: 'elevated_shoulders',
      severity: 'mild',
      message: 'Elevated shoulders detected (tension)',
      recommendation: 'Relax your shoulders down and back',
    });
  }
  
  // Spine issues
  if (score.spine.status === 'slouching') {
    const severity = score.spine.angle < POSTURE_THRESHOLDS.spine.critical ? 'severe' :
                     score.spine.angle < POSTURE_THRESHOLDS.spine.warning ? 'moderate' : 'mild';
    
    issues.push({
      type: 'slouching',
      severity,
      message: `Slouching detected (${Math.round(score.spine.angle)}° spine angle)`,
      recommendation: 'Sit up straight with your back against the chair',
    });
  }
  
  if (score.spine.status === 'leaning') {
    issues.push({
      type: 'slouching',
      severity: 'mild',
      message: 'Leaning to one side detected',
      recommendation: 'Center your torso over your hips',
    });
  }
  
  return issues;
}

/**
 * Get color for posture score (for UI display)
 */
export function getPostureScoreColor(score: number): string {
  if (score >= 85) return '#00ff88'; // Green - excellent
  if (score >= 70) return '#ffd700'; // Yellow - good
  if (score >= 50) return '#ffa500'; // Orange - fair
  return '#ff6b6b'; // Red - poor
}
