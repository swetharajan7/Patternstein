# Posture Monitoring Fix - Requirements

## Problem Statement
The posture monitoring system is active and analyzing, but no posture scores are being displayed to the user. The system shows "Monitoring active - Analyzing posture..." but the score remains at "--" and no component scores or issues are shown.

## Current Behavior
- Camera starts successfully
- MediaPipe detects landmarks (showing X/33 visible)
- Posture monitoring is enabled by default
- Console shows "Monitoring active - Analyzing posture..."
- BUT: No scores update in real-time
- Console may show "Key landmarks not visible enough"

## Root Cause Analysis
1. **Visibility Threshold Too High**: Even at 0.2, MediaPipe may report lower visibility values for certain camera angles/lighting
2. **Missing Fallback Logic**: When analysis returns null, UI doesn't provide helpful feedback
3. **Insufficient Debugging**: User can't see actual visibility values to understand what's wrong

## User Stories

### US-1: See Posture Scores in Real-Time
**As a** user  
**I want** to see my posture score update in real-time as I move  
**So that** I can get immediate feedback on my posture

**Acceptance Criteria:**
- Posture score displays within 2 seconds of camera start
- Score updates at least once per second
- Component scores (neck, shoulders, spine) all update
- Score works with upper body only (no hips visible)

### US-2: Understand Why Scores Aren't Showing
**As a** user  
**I want** to see helpful messages when scores can't be calculated  
**So that** I know how to fix the issue (e.g., adjust camera, lighting, position)

**Acceptance Criteria:**
- If landmarks not visible: Show "Adjust camera to show upper body"
- If visibility too low: Show actual visibility percentages
- If specific landmarks missing: Show which ones (e.g., "Can't see ears")
- Provide visual guide for optimal camera positioning

### US-3: Lower Visibility Requirements
**As a** user  
**I want** the system to work with lower visibility thresholds  
**So that** it works in various lighting conditions and camera angles

**Acceptance Criteria:**
- System works with visibility as low as 0.1 (10%)
- Gracefully degrades: Shows partial scores if only some landmarks visible
- Prioritizes most important landmarks (nose, shoulders, ears)
- Works in both bright and dim lighting

## Technical Requirements

### TR-1: Enhanced Logging
- Log actual visibility values for all key landmarks
- Log why analysis returns null (which specific check failed)
- Add visual indicator in UI showing landmark visibility status

### TR-2: Adaptive Thresholds
- Lower visibility threshold from 0.2 to 0.1
- Make threshold configurable via UI slider
- Add "sensitivity" setting (low/medium/high)

### TR-3: Partial Analysis Mode
- If full analysis fails, attempt partial analysis
- Show scores for available components only
- Mark unavailable components with "N/A" instead of "--"

### TR-4: Better Error Handling
- Never leave UI in "--" state for more than 3 seconds
- Always show actionable feedback
- Add "troubleshooting" button that shows detailed diagnostics

## Success Metrics
- 95%+ of users see scores within 3 seconds of camera start
- <5% of sessions show "landmarks not visible" for >10 seconds
- User can understand and fix visibility issues without external help
