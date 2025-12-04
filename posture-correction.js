/**
 * Real-Time Posture Correction System
 * Standalone JavaScript implementation for movement-agent.html
 */

// ============================================================================
// Configuration
// ============================================================================

const POSTURE_CONFIG = {
  alertInterval: 30000, // 30 seconds between alerts
  goodPostureThreshold: 85,
  thresholds: {
    neck: { good: 150, warning: 140, critical: 130 },
    shoulders: { symmetry: 5, elevation: 10 },
    spine: { good: 170, warning: 160, critical: 150 },
  },
};

// ============================================================================
// Geometry Helpers
// ============================================================================

function calculateAngle(a, b, c) {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) angle = 360 - angle;
  return angle;
}

function calculateDistance(a, b) {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}

function calculateVerticalDifference(a, b) {
  return Math.abs(a.y - b.y);
}

// ============================================================================
// Posture Analysis
// ============================================================================

function analyzeNeck(landmarks) {
  const nose = landmarks[0];
  const leftEar = landmarks[7];
  const rightEar = landmarks[8];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  
  // Use whichever ear is more visible, or average if both visible
  const ear = leftEar.visibility > rightEar.visibility ? leftEar : rightEar;
  const neckAngle = calculateAngle(nose, ear, leftShoulder);
  
  let status = 'good';
  let score = 100;
  
  if (neckAngle < POSTURE_CONFIG.thresholds.neck.critical) {
    status = 'forward_head';
    score = 40;
  } else if (neckAngle < POSTURE_CONFIG.thresholds.neck.warning) {
    status = 'forward_head';
    score = 70;
  } else if (neckAngle < POSTURE_CONFIG.thresholds.neck.good) {
    score = 85;
  }
  
  const shoulderMidpoint = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2,
  };
  
  const headTilt = Math.abs(nose.x - shoulderMidpoint.x);
  if (headTilt > 0.1) {
    status = 'tilted';
    score = Math.min(score, 75);
  }
  
  return { status, angle: neckAngle, score };
}

function analyzeShoulders(landmarks) {
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  
  const symmetryDiff = calculateVerticalDifference(leftShoulder, rightShoulder) * 100;
  
  const leftShoulderToHip = calculateDistance(leftShoulder, leftHip);
  const rightShoulderToHip = calculateDistance(rightShoulder, rightHip);
  const avgShoulderToHip = (leftShoulderToHip + rightShoulderToHip) / 2;
  
  let status = 'good';
  let score = 100;
  
  if (symmetryDiff > POSTURE_CONFIG.thresholds.shoulders.symmetry) {
    status = 'asymmetric';
    score = 70;
  }
  
  if (avgShoulderToHip < 0.3) {
    status = 'elevated';
    score = Math.min(score, 75);
  }
  
  return { status, symmetry: symmetryDiff, score };
}

function analyzeSpine(landmarks) {
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  
  const shoulderMidpoint = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2,
  };
  
  // Check if hips are visible enough for full spine analysis
  const hipsVisible = leftHip.visibility > 0.2 && rightHip.visibility > 0.2;
  
  if (!hipsVisible) {
    // Upper body only mode - use shoulder angle as proxy
    const shoulderAngle = Math.abs(Math.atan2(
      rightShoulder.y - leftShoulder.y,
      rightShoulder.x - leftShoulder.x
    ) * 180 / Math.PI);
    
    // Shoulders should be roughly horizontal (close to 0 or 180 degrees)
    const shoulderTilt = Math.min(shoulderAngle, 180 - shoulderAngle);
    
    let status = 'good';
    let score = 100;
    
    if (shoulderTilt > 15) {
      status = 'tilted';
      score = 70;
    } else if (shoulderTilt > 10) {
      score = 85;
    }
    
    return { status, angle: 90, score }; // Return neutral angle for upper body mode
  }
  
  const hipMidpoint = {
    x: (leftHip.x + rightHip.x) / 2,
    y: (leftHip.y + rightHip.y) / 2,
  };
  
  const spineAngle = 180 - Math.abs(Math.atan2(
    shoulderMidpoint.y - hipMidpoint.y,
    shoulderMidpoint.x - hipMidpoint.x
  ) * 180 / Math.PI);
  
  let status = 'good';
  let score = 100;
  
  if (spineAngle < POSTURE_CONFIG.thresholds.spine.critical) {
    status = 'slouching';
    score = 40;
  } else if (spineAngle < POSTURE_CONFIG.thresholds.spine.warning) {
    status = 'slouching';
    score = 70;
  } else if (spineAngle < POSTURE_CONFIG.thresholds.spine.good) {
    score = 85;
  }
  
  const horizontalOffset = Math.abs(shoulderMidpoint.x - hipMidpoint.x);
  if (horizontalOffset > 0.1) {
    status = 'leaning';
    score = Math.min(score, 80);
  }
  
  return { status, angle: spineAngle, score };
}

function analyzePosture(landmarks) {
  if (!landmarks || landmarks.length !== 33) {
    console.log('analyzePosture: Invalid landmarks', { hasLandmarks: !!landmarks, length: landmarks?.length });
    return null;
  }
  
  // Check essential landmarks (nose, shoulders) - hips optional for upper body only setups
  const essentialLandmarks = [0, 11, 12];
  // Check if at least one ear is visible
  const leftEarVisible = landmarks[7].visibility > 0.2;
  const rightEarVisible = landmarks[8].visibility > 0.2;
  const eitherEarVisible = leftEarVisible || rightEarVisible;
  
  // Check if hips are visible (optional for full body analysis)
  const hipsVisible = landmarks[23].visibility > 0.2 && landmarks[24].visibility > 0.2;
  
  const visibilityInfo = {
    nose: landmarks[0].visibility.toFixed(2),
    leftEar: landmarks[7].visibility.toFixed(2),
    rightEar: landmarks[8].visibility.toFixed(2),
    leftShoulder: landmarks[11].visibility.toFixed(2),
    rightShoulder: landmarks[12].visibility.toFixed(2),
    leftHip: landmarks[23].visibility.toFixed(2),
    rightHip: landmarks[24].visibility.toFixed(2),
    hipsVisible: hipsVisible ? 'YES' : 'NO (upper body only mode)'
  };
  
  // Lower threshold to 0.2 for better detection (MediaPipe can give low scores)
  const essentialVisible = essentialLandmarks.every(idx => landmarks[idx].visibility > 0.2);
  
  if (!essentialVisible || !eitherEarVisible) {
    console.warn('⚠️ POSTURE: Key landmarks not visible enough:', visibilityInfo);
    return null;
  }
  
  console.log('✅ POSTURE: Landmarks visible, analyzing...', visibilityInfo);
  
  const neck = analyzeNeck(landmarks);
  const shoulders = analyzeShoulders(landmarks);
  const spine = analyzeSpine(landmarks);
  
  const overall = Math.round(
    neck.score * 0.35 +
    shoulders.score * 0.25 +
    spine.score * 0.40
  );
  
  console.log('✅ POSTURE: Analysis complete', { 
    overall, 
    neck: neck.score, 
    shoulders: shoulders.score, 
    spine: spine.score,
    neckAngle: neck.angle.toFixed(1),
    spineAngle: spine.angle.toFixed(1)
  });
  
  return { overall, neck, shoulders, spine };
}

function detectPostureIssues(score) {
  const issues = [];
  
  if (score.neck.status === 'forward_head') {
    const severity = score.neck.angle < POSTURE_CONFIG.thresholds.neck.critical ? 'severe' :
                     score.neck.angle < POSTURE_CONFIG.thresholds.neck.warning ? 'moderate' : 'mild';
    
    issues.push({
      type: 'forward_head',
      severity,
      message: `Forward head posture detected (${Math.round(score.neck.angle)}°)`,
      recommendation: 'Pull your chin back and align your ears over your shoulders',
      icon: '🔴',
    });
  }
  
  if (score.neck.status === 'tilted') {
    issues.push({
      type: 'tilted_head',
      severity: 'mild',
      message: 'Head tilt detected',
      recommendation: 'Center your head over your shoulders',
      icon: '🟡',
    });
  }
  
  if (score.shoulders.status === 'asymmetric') {
    issues.push({
      type: 'asymmetric_shoulders',
      severity: score.shoulders.symmetry > 10 ? 'moderate' : 'mild',
      message: `Shoulder asymmetry detected (${score.shoulders.symmetry.toFixed(1)}° difference)`,
      recommendation: 'Level your shoulders and check for uneven weight distribution',
      icon: '🟡',
    });
  }
  
  if (score.shoulders.status === 'elevated') {
    issues.push({
      type: 'elevated_shoulders',
      severity: 'mild',
      message: 'Elevated shoulders detected (tension)',
      recommendation: 'Relax your shoulders down and back',
      icon: '🟡',
    });
  }
  
  if (score.spine.status === 'slouching') {
    const severity = score.spine.angle < POSTURE_CONFIG.thresholds.spine.critical ? 'severe' :
                     score.spine.angle < POSTURE_CONFIG.thresholds.spine.warning ? 'moderate' : 'mild';
    
    issues.push({
      type: 'slouching',
      severity,
      message: `Slouching detected (${Math.round(score.spine.angle)}° spine angle)`,
      recommendation: 'Sit up straight with your back against the chair',
      icon: '🔴',
    });
  }
  
  if (score.spine.status === 'leaning') {
    issues.push({
      type: 'leaning',
      severity: 'mild',
      message: 'Leaning to one side detected',
      recommendation: 'Center your torso over your hips',
      icon: '🟡',
    });
  }
  
  return issues;
}

function getPostureScoreColor(score) {
  if (score >= 85) return '#00ff88';
  if (score >= 70) return '#ffd700';
  if (score >= 50) return '#ffa500';
  return '#ff6b6b';
}

// ============================================================================
// Notification System
// ============================================================================

function showPostureNotification(issue) {
  // Browser notification (if permission granted)
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Posture Alert', {
      body: issue.message,
      icon: 'brain-circuit-icon.png',
      badge: 'brain-circuit-icon.png',
      tag: 'posture-alert',
      renotify: true,
    });
  }
  
  // Visual notification
  showVisualAlert(issue);
  
  // Audio alert
  playAlertSound(issue.severity);
}

function showVisualAlert(issue) {
  const alertContainer = document.getElementById('postureAlertContainer');
  if (!alertContainer) return;
  
  const alert = document.createElement('div');
  alert.className = 'posture-alert';
  alert.style.cssText = `
    background: ${issue.severity === 'severe' ? 'rgba(255, 107, 107, 0.95)' : 'rgba(255, 193, 7, 0.95)'};
    color: #000;
    padding: 15px 20px;
    border-radius: 10px;
    margin-bottom: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    animation: slideIn 0.3s ease-out;
    font-weight: bold;
  `;
  
  alert.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="font-size: 1.5rem;">${issue.icon}</span>
      <div style="flex: 1;">
        <div style="font-size: 1rem; margin-bottom: 5px;">${issue.message}</div>
        <div style="font-size: 0.85rem; opacity: 0.9;">💡 ${issue.recommendation}</div>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; opacity: 0.7;">×</button>
    </div>
  `;
  
  alertContainer.appendChild(alert);
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (alert.parentElement) {
      alert.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => alert.remove(), 300);
    }
  }, 10000);
}

function playAlertSound(severity) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(severity === 'severe' ? 800 : 600, audioContext.currentTime);
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.3);
}

// Request notification permission
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

// ============================================================================
// Posture Monitor Class
// ============================================================================

class PostureMonitor {
  constructor() {
    this.isMonitoring = false;
    this.lastAlertTime = 0;
    this.sessionStartTime = 0;
    this.scoreHistory = [];
    this.goodPostureStartTime = null;
    this.totalGoodPostureTime = 0;
    this.currentScore = null;
    this.currentIssues = [];
  }
  
  start() {
    this.isMonitoring = true;
    this.sessionStartTime = Date.now();
    this.scoreHistory = [];
    this.totalGoodPostureTime = 0;
    this.goodPostureStartTime = null;
    this.lastAlertTime = 0;
    
    requestNotificationPermission();
  }
  
  stop() {
    this.isMonitoring = false;
    
    if (this.goodPostureStartTime !== null) {
      const duration = (Date.now() - this.goodPostureStartTime) / 1000;
      this.totalGoodPostureTime += duration;
      this.goodPostureStartTime = null;
    }
  }
  
  analyze(landmarks) {
    if (!this.isMonitoring || !landmarks) return null;
    
    const score = analyzePosture(landmarks);
    if (!score) return null;
    
    this.currentScore = score;
    this.scoreHistory.push(score.overall);
    if (this.scoreHistory.length > 100) {
      this.scoreHistory.shift();
    }
    
    const issues = detectPostureIssues(score);
    this.currentIssues = issues;
    
    // Track good posture time
    if (score.overall >= POSTURE_CONFIG.goodPostureThreshold) {
      if (this.goodPostureStartTime === null) {
        this.goodPostureStartTime = Date.now();
      }
    } else {
      if (this.goodPostureStartTime !== null) {
        const duration = (Date.now() - this.goodPostureStartTime) / 1000;
        this.totalGoodPostureTime += duration;
        this.goodPostureStartTime = null;
      }
    }
    
    // Alert if issues detected
    const now = Date.now();
    if (issues.length > 0 && now - this.lastAlertTime >= POSTURE_CONFIG.alertInterval) {
      issues.forEach(issue => showPostureNotification(issue));
      this.lastAlertTime = now;
    }
    
    return { score, issues };
  }
  
  getSessionStats() {
    const duration = (Date.now() - this.sessionStartTime) / 1000;
    const avgScore = this.scoreHistory.length > 0
      ? Math.round(this.scoreHistory.reduce((a, b) => a + b, 0) / this.scoreHistory.length)
      : 0;
    
    return {
      duration: Math.round(duration),
      avgScore,
      issueCount: this.currentIssues.length,
      goodPostureTime: Math.round(this.totalGoodPostureTime),
    };
  }
}

// ============================================================================
// Export
// ============================================================================

window.PostureMonitor = PostureMonitor;
window.getPostureScoreColor = getPostureScoreColor;
