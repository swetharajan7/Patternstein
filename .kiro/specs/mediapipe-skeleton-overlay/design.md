# Design Document - MediaPipe Skeleton Overlay

## Overview

This feature enhances the Movement Agent by adding real-time visual skeleton/landmark overlay directly on the video feed during patient posture analysis. The implementation leverages MediaPipe Pose's 33 body landmarks and draws them with connecting lines to create an aesthetic, functional skeleton visualization that helps patients understand what the system is detecting and allows healthcare providers to verify tracking accuracy.

The current implementation already has basic skeleton drawing in `movement-agent.html`, but it uses mock data. This design will integrate real MediaPipe landmarks from the existing `useMediaPipe` hook and enhance the visual styling to match Patternstein's aesthetic.

## Architecture

The feature consists of three main layers:

1. **Data Layer**: MediaPipe Pose detection providing 33 landmarks per frame
2. **Rendering Layer**: HTML5 Canvas API for drawing skeleton overlay
3. **Integration Layer**: React hooks connecting MediaPipe output to canvas rendering

### Component Interaction Flow

```
Camera Feed → MediaPipe Pose → Landmarks (33 points)
                                      ↓
                              useMediaPipe Hook
                                      ↓
                              Canvas Renderer
                                      ↓
                              Visual Overlay (skeleton + landmarks)
```

## Components and Interfaces

### 1. Enhanced useMediaPipe Hook

**Current State**: The hook already provides landmarks and has a `drawLandmarks` function
**Enhancement Needed**: Improve the drawing function with better styling and anatomically correct connections

**Interface**:
```typescript
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
```

### 2. Canvas Rendering Module

**Purpose**: Draw skeleton overlay with aesthetic styling

**Key Functions**:
- `drawSkeletonOverlay(canvas, landmarks, options)`: Main rendering function
- `drawConnections(ctx, landmarks, connections)`: Draw lines between landmarks
- `drawLandmarks(ctx, landmarks, colorScheme)`: Draw landmark points
- `applyGlowEffect(ctx, color, intensity)`: Add glow effects

**Rendering Options**:
```typescript
interface RenderOptions {
  showLandmarks: boolean;
  showConnections: boolean;
  landmarkSize: number;
  lineWidth: number;
  glowIntensity: number;
  colorScheme: 'default' | 'patternstein' | 'medical';
  opacity: number;
}
```

### 3. Landmark Connection Definitions

**Anatomical Connections**: Define which landmarks connect to form skeleton

```typescript
const POSE_CONNECTIONS = {
  // Face outline
  face: [[0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8], [9, 10]],
  
  // Torso
  torso: [[11, 12], [11, 23], [12, 24], [23, 24]],
  
  // Left arm
  leftArm: [[11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19]],
  
  // Right arm
  rightArm: [[12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20]],
  
  // Left leg
  leftLeg: [[23, 25], [25, 27], [27, 29], [27, 31], [29, 31]],
  
  // Right leg
  rightLeg: [[24, 26], [26, 28], [28, 30], [28, 32], [30, 32]],
};
```

## Data Models

### Landmark Structure

```typescript
interface Landmark {
  x: number;        // Normalized 0-1 (left to right)
  y: number;        // Normalized 0-1 (top to bottom)
  z: number;        // Depth (negative = closer to camera)
  visibility: number; // Confidence 0-1
}

type LandmarksArray = [Landmark, ...Landmark[]]; // Exactly 33 landmarks
```

### MediaPipe Pose Landmark Indices

```typescript
enum PoseLandmark {
  NOSE = 0,
  LEFT_EYE_INNER = 1,
  LEFT_EYE = 2,
  LEFT_EYE_OUTER = 3,
  RIGHT_EYE_INNER = 4,
  RIGHT_EYE = 5,
  RIGHT_EYE_OUTER = 6,
  LEFT_EAR = 7,
  RIGHT_EAR = 8,
  MOUTH_LEFT = 9,
  MOUTH_RIGHT = 10,
  LEFT_SHOULDER = 11,
  RIGHT_SHOULDER = 12,
  LEFT_ELBOW = 13,
  RIGHT_ELBOW = 14,
  LEFT_WRIST = 15,
  RIGHT_WRIST = 16,
  LEFT_PINKY = 17,
  RIGHT_PINKY = 18,
  LEFT_INDEX = 19,
  RIGHT_INDEX = 20,
  LEFT_THUMB = 21,
  RIGHT_THUMB = 22,
  LEFT_HIP = 23,
  RIGHT_HIP = 24,
  LEFT_KNEE = 25,
  RIGHT_KNEE = 26,
  LEFT_ANKLE = 27,
  RIGHT_ANKLE = 28,
  LEFT_HEEL = 29,
  RIGHT_HEEL = 30,
  LEFT_FOOT_INDEX = 31,
  RIGHT_FOOT_INDEX = 32,
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Landmark count consistency

*For any* frame processed by MediaPipe, the landmarks array should contain exactly 33 elements
**Validates: Requirements 1.1, 1.2**

### Property 2: Coordinate normalization

*For any* landmark in the array, the x and y coordinates should be in the range [0, 1]
**Validates: Requirements 3.4**

### Property 3: Visibility-based rendering

*For any* landmark with visibility < 0.5, the landmark should either not be rendered or rendered with reduced opacity
**Validates: Requirements 1.3, 1.4**

### Property 4: Canvas dimension synchronization

*For any* video element resize event, the canvas dimensions should update to match the video element dimensions within 100ms
**Validates: Requirements 3.3**

### Property 5: Connection rendering order

*For any* frame where landmarks are drawn, connections should be drawn before landmark points to ensure points appear on top
**Validates: Requirements 2.4**

### Property 6: Frame rate consistency

*For any* 1-second window during active analysis, the rendering frame rate should be at least 25 FPS
**Validates: Requirements 2.1, 3.5**

## Error Handling

### Missing Landmarks

**Scenario**: MediaPipe fails to detect some landmarks (visibility < threshold)

**Handling**:
- Skip drawing connections that involve missing landmarks
- Draw only visible landmarks
- Log warning if more than 50% of landmarks are missing
- Continue rendering without crashing

### Canvas Context Unavailable

**Scenario**: Canvas element exists but getContext('2d') returns null

**Handling**:
- Log error to console
- Disable overlay rendering
- Continue video feed without overlay
- Show user notification about degraded functionality

### Video-Canvas Size Mismatch

**Scenario**: Canvas dimensions don't match video dimensions

**Handling**:
- Automatically resize canvas to match video on each frame
- Use ResizeObserver to detect video size changes
- Scale landmark coordinates appropriately

### Performance Degradation

**Scenario**: Rendering causes frame rate to drop below 20 FPS

**Handling**:
- Reduce rendering complexity (fewer connections, smaller landmarks)
- Skip frames if necessary (render every 2nd frame)
- Disable glow effects if performance is critical
- Log performance metrics for debugging

## Testing Strategy

### Unit Testing

**Test Cases**:
1. **Landmark Validation**: Verify all 33 landmarks are present and have valid coordinates
2. **Connection Mapping**: Verify all connection pairs reference valid landmark indices
3. **Color Scheme**: Verify color values match Patternstein theme
4. **Canvas Scaling**: Verify coordinates scale correctly from normalized to pixel space
5. **Visibility Filtering**: Verify low-visibility landmarks are handled correctly

**Testing Method**:
- Jest unit tests for pure functions
- Mock canvas context for rendering tests
- Snapshot testing for visual regression

### Property-Based Testing

**Property Tests**:
1. **Coordinate Bounds**: For any landmark array, all x/y values should be in [0, 1]
2. **Connection Validity**: For any connection pair, both indices should be in [0, 32]
3. **Rendering Performance**: For any frame, rendering time should be < 16ms (60 FPS)
4. **Canvas Synchronization**: For any video resize, canvas should match within 100ms

**Testing Library**: fast-check (JavaScript property-based testing)

**Test Configuration**:
- Run 100 iterations per property
- Generate random landmark arrays with valid structure
- Test edge cases (all visible, none visible, partial visibility)

### Integration Testing

**Test Scenarios**:
1. **End-to-End Flow**: Camera → MediaPipe → Canvas rendering
2. **Real-time Performance**: Verify 30 FPS with live camera feed
3. **Browser Compatibility**: Test on Chrome, Firefox, Safari
4. **Mobile Responsiveness**: Test on iOS and Android devices

## Implementation Notes

### Integration with Existing Code

**Current State**:
- `movement-agent.html` has mock skeleton drawing
- `useMediaPipe.tsx` has basic `drawLandmarks` function
- Canvas element already exists in HTML

**Changes Needed**:
1. Replace mock `generateMockLandmarks()` with real landmarks from `useMediaPipe`
2. Enhance `drawLandmarks()` function in `useMediaPipe.tsx` with better styling
3. Add connection definitions to `mediapipeHelpers.ts`
4. Update canvas rendering to use Patternstein color scheme

### Performance Optimization

**Strategies**:
1. **Batch Drawing**: Group all drawing operations to minimize context switches
2. **Path Reuse**: Create Path2D objects for repeated shapes
3. **Conditional Rendering**: Only redraw when landmarks change significantly
4. **OffscreenCanvas**: Consider using OffscreenCanvas for background rendering (future)
5. **WebGL**: Consider WebGL for high-performance rendering (future enhancement)

### Browser Compatibility

**Target Browsers**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Fallback Strategy**:
- Detect Canvas API support
- Gracefully degrade to video-only if canvas unavailable
- Show notification to user about limited functionality

### Accessibility

**Considerations**:
- Skeleton overlay is visual enhancement, not required for functionality
- Provide option to disable overlay for users with motion sensitivity
- Ensure video feed remains accessible without overlay
- Add ARIA labels for control buttons

## Visual Design Specifications

### Color Scheme (Patternstein Theme)

```typescript
const PATTERNSTEIN_COLORS = {
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
```

### Sizing and Proportions

```typescript
const RENDER_CONFIG = {
  landmarkRadius: 6,      // pixels
  connectionWidth: 3,     // pixels
  glowBlur: 10,          // pixels
  opacity: 0.9,          // 0-1
  minVisibility: 0.5,    // threshold for rendering
};
```

### Animation and Transitions

- **Smooth Transitions**: Use exponential smoothing (alpha = 0.5) for landmark positions
- **Fade In/Out**: Landmarks fade in when visibility increases above threshold
- **Pulse Effect**: Optional subtle pulse on key landmarks (shoulders, hips)
- **Connection Thickness**: Vary based on confidence (thicker = more confident)

## Future Enhancements

1. **Recording Mode**: Capture skeleton overlay video for patient records
2. **Comparison View**: Side-by-side before/after posture comparison
3. **3D Visualization**: Use z-coordinate for depth perception
4. **Custom Overlays**: Allow healthcare providers to add annotations
5. **Heatmaps**: Show areas of concern with color-coded overlays
6. **Motion Trails**: Show movement history for gait analysis
7. **AR Mode**: Overlay corrective posture guide on patient's body

## Dependencies

**Existing**:
- `@mediapipe/pose`: Pose detection
- `@mediapipe/camera_utils`: Camera management
- React 18+
- TypeScript 4.9+

**New** (none required):
- All functionality uses existing dependencies
- HTML5 Canvas API (built-in)

## File Structure

```
frontend/src/
├── hooks/
│   ├── useMediaPipe.tsx          # Enhanced with better rendering
│   └── useMovementAgent.ts       # Existing
├── utils/
│   ├── skeletonRenderer.ts       # NEW: Dedicated rendering module
│   └── mediapipeHelpers.ts       # Enhanced with connection definitions
└── types/
    └── movement.ts               # Enhanced with render types

movement-agent.html               # Updated to use real landmarks
```

## Implementation Phases

### Phase 1: Core Rendering (MVP)
- Integrate real landmarks from useMediaPipe
- Draw basic skeleton with connections
- Apply Patternstein color scheme

### Phase 2: Visual Enhancement
- Add glow effects
- Implement color coding by body region
- Add smooth transitions

### Phase 3: Performance Optimization
- Optimize rendering loop
- Add frame skipping if needed
- Implement conditional rendering

### Phase 4: Polish and Testing
- Add user controls (show/hide overlay)
- Comprehensive testing
- Browser compatibility verification
