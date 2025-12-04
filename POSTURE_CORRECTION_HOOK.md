## Real-Time Posture Correction Hook

A comprehensive posture monitoring system that provides real-time feedback and corrections for the Movement Agent.

---

## 🎯 Features

### Core Capabilities
- **Real-time Analysis**: Continuous posture monitoring at 30 FPS
- **Multi-point Detection**: Analyzes neck, shoulders, and spine alignment
- **Smart Alerts**: Configurable notifications (visual, audio, browser)
- **Session Tracking**: Monitors posture quality over time
- **Good Posture Timer**: Tracks time spent in correct posture

### Detected Issues
1. **Forward Head Posture** - Common in computer users
2. **Slouching** - Poor spine alignment
3. **Shoulder Asymmetry** - Uneven shoulder height
4. **Elevated Shoulders** - Tension indicator
5. **Head Tilt** - Lateral misalignment
6. **Leaning** - Torso offset from center

---

## 📁 Files Created

```
Patternstein/
├── src/utils/postureAnalyzer.ts          # Core analysis logic
├── frontend/src/hooks/
│   └── usePostureCorrection.tsx          # React hook
├── posture-correction.js                 # Standalone JS for HTML
├── posture-correction.css                # Styling and animations
└── POSTURE_CORRECTION_HOOK.md           # This file
```

---

## 🚀 Usage

### Option 1: React Hook (TypeScript)

```typescript
import { usePostureCorrection } from './hooks/usePostureCorrection';
import { useMediaPipe } from './hooks/useMediaPipe';

function MovementAgent() {
  const { landmarks } = useMediaPipe();
  
  const {
    currentScore,
    currentIssues,
    isMonitoring,
    sessionStats,
    startMonitoring,
    stopMonitoring,
  } = usePostureCorrection(landmarks, {
    enabled: true,
    alertInterval: 30000, // 30 seconds
    onIssueDetected: (issues) => {
      console.log('Posture issues:', issues);
    },
    onScoreUpdate: (score) => {
      console.log('Posture score:', score.overall);
    },
  });
  
  return (
    <div>
      <button onClick={startMonitoring}>Start Monitoring</button>
      <button onClick={stopMonitoring}>Stop Monitoring</button>
      
      {currentScore && (
        <div>
          <h3>Posture Score: {currentScore.overall}/100</h3>
          <p>Neck: {currentScore.neck.score}</p>
          <p>Shoulders: {currentScore.shoulders.score}</p>
          <p>Spine: {currentScore.spine.score}</p>
        </div>
      )}
      
      {currentIssues.map((issue, idx) => (
        <div key={idx} className={`issue ${issue.severity}`}>
          <strong>{issue.message}</strong>
          <p>{issue.recommendation}</p>
        </div>
      ))}
      
      <div>
        <p>Session Duration: {sessionStats.duration}s</p>
        <p>Average Score: {sessionStats.avgScore}</p>
        <p>Good Posture Time: {sessionStats.goodPostureTime}s</p>
      </div>
    </div>
  );
}
```

### Option 2: Standalone JavaScript (HTML)

Add to `movement-agent.html`:

```html
<!-- Add CSS -->
<link rel="stylesheet" href="posture-correction.css">

<!-- Add alert container -->
<div id="postureAlertContainer"></div>

<!-- Add scripts -->
<script src="posture-correction.js"></script>

<script>
  // Initialize posture monitor
  const postureMonitor = new PostureMonitor();
  
  // Start monitoring when camera starts
  startBtn.addEventListener('click', () => {
    postureMonitor.start();
  });
  
  // Stop monitoring when camera stops
  stopBtn.addEventListener('click', () => {
    postureMonitor.stop();
  });
  
  // Analyze posture in MediaPipe callback
  function onPoseResults(results) {
    if (!results.poseLandmarks) return;
    
    // Existing code...
    drawSkeleton(results.poseLandmarks);
    
    // Add posture analysis
    const analysis = postureMonitor.analyze(results.poseLandmarks);
    
    if (analysis) {
      // Update UI with score
      const scoreColor = getPostureScoreColor(analysis.score.overall);
      document.getElementById('postureScoreDisplay').textContent = analysis.score.overall;
      document.getElementById('postureScoreDisplay').style.color = scoreColor;
      
      // Display session stats
      const stats = postureMonitor.getSessionStats();
      document.getElementById('sessionDuration').textContent = `${stats.duration}s`;
      document.getElementById('avgScore').textContent = stats.avgScore;
      document.getElementById('goodPostureTime').textContent = `${stats.goodPostureTime}s`;
    }
  }
</script>
```

---

## 🎨 UI Components

### Posture Score Badge
```html
<div class="posture-score-badge excellent">
  <span>🟢</span>
  <span>95/100</span>
</div>
```

Classes: `excellent` (85+), `good` (70-84), `fair` (50-69), `poor` (<50)

### Session Stats
```html
<div class="session-stats">
  <div class="stat-item">
    <div class="stat-label">Duration</div>
    <div class="stat-value">5:23</div>
  </div>
  <div class="stat-item">
    <div class="stat-label">Avg Score</div>
    <div class="stat-value">87</div>
  </div>
  <div class="stat-item">
    <div class="stat-label">Good Posture</div>
    <div class="stat-value">4:12</div>
  </div>
  <div class="stat-item">
    <div class="stat-label">Issues</div>
    <div class="stat-value">2</div>
  </div>
</div>
```

### Issue Display
```html
<div class="posture-issue-item severe">
  <div class="issue-message">🔴 Forward head posture detected (135°)</div>
  <div class="issue-recommendation">💡 Pull your chin back and align your ears over your shoulders</div>
</div>
```

---

## ⚙️ Configuration

### Thresholds
```javascript
const POSTURE_CONFIG = {
  alertInterval: 30000, // Alert frequency (ms)
  goodPostureThreshold: 85, // Score for "good" posture
  
  thresholds: {
    neck: {
      good: 150,      // Ideal angle (degrees)
      warning: 140,   // Warning threshold
      critical: 130,  // Critical threshold
    },
    shoulders: {
      symmetry: 5,    // Max acceptable difference (degrees)
      elevation: 10,  // Max acceptable elevation (degrees)
    },
    spine: {
      good: 170,      // Ideal angle (degrees)
      warning: 160,   // Warning threshold
      critical: 150,  // Critical threshold
    },
  },
};
```

### Customization
```javascript
// Adjust alert frequency
postureMonitor.alertInterval = 60000; // 1 minute

// Change good posture threshold
postureMonitor.goodPostureThreshold = 90; // Stricter

// Disable audio alerts
function playAlertSound() { /* no-op */ }

// Custom notification handler
function showPostureNotification(issue) {
  // Your custom logic
  console.log('Custom alert:', issue);
}
```

---

## 📊 Scoring System

### Overall Score (0-100)
Weighted average of component scores:
- **Neck**: 35% weight
- **Shoulders**: 25% weight
- **Spine**: 40% weight

### Component Scores

**Neck (0-100)**
- 100: Perfect alignment (>150°)
- 85: Good (145-150°)
- 70: Fair (140-145°)
- 40: Poor (<140°)

**Shoulders (0-100)**
- 100: Symmetric and relaxed
- 70: Asymmetric (>5° difference)
- 75: Elevated (tension)

**Spine (0-100)**
- 100: Upright (>170°)
- 85: Good (165-170°)
- 70: Fair (160-165°)
- 40: Slouching (<160°)

---

## 🔔 Notification System

### Browser Notifications
Requires user permission. Automatically requested on first use.

```javascript
// Check permission status
Notification.permission // 'granted', 'denied', or 'default'

// Request permission
requestNotificationPermission();
```

### Visual Alerts
Slide-in notifications in top-right corner with:
- Color-coded severity (red/yellow)
- Issue description
- Actionable recommendation
- Auto-dismiss after 10 seconds

### Audio Alerts
Gentle chime sounds:
- **Severe issues**: 800 Hz tone
- **Moderate/Mild**: 600 Hz tone
- Duration: 300ms
- Volume: 10% (non-intrusive)

---

## 🧪 Testing

### Manual Testing
1. Start camera in Movement Agent
2. Enable posture monitoring
3. Test each posture issue:
   - **Forward head**: Lean head forward
   - **Slouching**: Slump in chair
   - **Asymmetry**: Raise one shoulder
   - **Elevation**: Shrug shoulders up

### Expected Behavior
- Alert appears within 30 seconds of bad posture
- Score updates in real-time
- Session stats track correctly
- Good posture timer increments when score >85

---

## 🎯 Integration Checklist

- [ ] Add `posture-correction.js` to HTML
- [ ] Add `posture-correction.css` to HTML
- [ ] Add alert container div
- [ ] Initialize PostureMonitor
- [ ] Call `analyze()` in MediaPipe callback
- [ ] Update UI with scores
- [ ] Display session stats
- [ ] Test notifications
- [ ] Test on mobile devices

---

## 🚧 Future Enhancements

### Planned Features
1. **Posture History Graph** - Visualize score over time
2. **Daily Reports** - Email/PDF summaries
3. **Gamification** - Achievements and streaks
4. **Custom Exercises** - Guided stretching routines
5. **Multi-user Profiles** - Track multiple users
6. **Export Data** - CSV/JSON export for analysis
7. **Integration with Wearables** - Haptic feedback
8. **AI Predictions** - Predict injury risk

### API Endpoints (Future)
```javascript
// Save session to backend
POST /api/posture/sessions
{
  "duration": 300,
  "avgScore": 87,
  "issues": [...],
  "timestamp": "2025-01-01T12:00:00Z"
}

// Get user history
GET /api/posture/history?userId=123&days=7

// Get recommendations
GET /api/posture/recommendations?score=75
```

---

## 📝 License

MIT License - Part of the Patternstein project

---

## 🙏 Acknowledgments

- MediaPipe Pose for landmark detection
- Patternstein team for the Movement Agent
- Ergonomics research for posture thresholds

---

**Built with ❤️ for better posture and health**
