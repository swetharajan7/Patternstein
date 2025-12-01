# Implementation Plan

- [x] 1. Create skeleton rendering utility module
  - Create `frontend/src/utils/skeletonRenderer.ts` with rendering functions
  - Define POSE_CONNECTIONS constant with anatomical landmark pairs
  - Implement `drawSkeletonOverlay()` function with canvas context and landmarks
  - Implement `drawConnections()` function to draw lines between landmarks
  - Implement `drawLandmarkPoints()` function to draw colored dots
  - Add Patternstein color scheme constants (cyan, green, orange)
  - _Requirements: 2.2, 2.3, 4.1, 4.2_

- [x] 1.1 Write unit tests for skeleton renderer
  - Test connection definitions are valid (indices 0-32)
  - Test color scheme values are valid hex/rgba
  - Test coordinate scaling from normalized to pixel space
  - _Requirements: 2.2, 3.4_

- [x] 1.2 Write property test for landmark count
  - **Property 1: Landmark count consistency**
  - **Validates: Requirements 1.1, 1.2**

- [x] 1.3 Write property test for coordinate normalization
  - **Property 2: Coordinate normalization**
  - **Validates: Requirements 3.4**

- [x] 2. Enhance useMediaPipe hook with improved rendering
  - Update `drawLandmarks()` function in `frontend/src/hooks/useMediaPipe.tsx`
  - Import skeleton renderer utility functions
  - Replace basic drawing with enhanced skeleton overlay
  - Add glow effects using canvas shadowBlur and shadowColor
  - Implement visibility-based filtering (only draw landmarks with visibility > 0.5)
  - Add color coding by body region (face=cyan, upper=green, lower=orange)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 4.1, 4.2, 4.3_

- [x] 2.1 Write property test for visibility-based rendering
  - **Property 3: Visibility-based rendering**
  - **Validates: Requirements 1.3, 1.4**

- [x] 3. Add canvas dimension synchronization
  - Implement ResizeObserver in useMediaPipe hook to watch video element
  - Update canvas width/height to match video dimensions on resize
  - Ensure canvas scales correctly on window resize and orientation change
  - Add debouncing to prevent excessive resize operations
  - _Requirements: 3.3_

- [x] 3.1 Write property test for canvas synchronization
  - **Property 4: Canvas dimension synchronization**
  - **Validates: Requirements 3.3**

- [x] 4. Update movement-agent.html to use real landmarks
  - Remove `generateMockLandmarks()` function from movement-agent.html
  - Remove `animateSkeleton()` function that uses mock data
  - Update canvas rendering to use real MediaPipe landmarks from video stream
  - Ensure skeleton overlay appears when camera is active
  - Test that overlay disappears when camera is stopped
  - _Requirements: 1.1, 1.5, 3.1_

- [x] 5. Implement connection rendering with proper ordering
  - Ensure connections are drawn before landmark points in rendering pipeline
  - Set appropriate z-index/drawing order so points appear on top of lines
  - Add semi-transparent connections (opacity 0.7) to avoid obscuring video
  - _Requirements: 2.4, 4.4_

- [x] 5.1 Write property test for connection rendering order
  - **Property 5: Connection rendering order**
  - **Validates: Requirements 2.4**

- [x] 6. Add performance monitoring and optimization
  - Implement FPS counter in useMediaPipe hook
  - Add frame timing measurements (time between renders)
  - Log warning if frame rate drops below 25 FPS
  - Implement frame skipping if rendering takes > 16ms
  - Add performance metrics to console for debugging
  - _Requirements: 2.1, 3.5_

- [x] 6.1 Write property test for frame rate consistency
  - **Property 6: Frame rate consistency**
  - **Validates: Requirements 2.1, 3.5**

- [x] 7. Add error handling for edge cases
  - Add null checks for canvas context before drawing
  - Handle missing landmarks gracefully (skip connections with missing points)
  - Add try-catch around rendering code to prevent crashes
  - Log errors to console without breaking video feed
  - Show user notification if overlay fails but video continues
  - _Requirements: 1.5, 3.1_

- [x] 7.1 Write unit tests for error handling
  - Test behavior when canvas context is null
  - Test behavior when landmarks array is incomplete
  - Test behavior when visibility values are invalid
  - _Requirements: 1.5, 3.1_

- [x] 8. Add visual enhancements and polish
  - Implement smooth landmark transitions using exponential smoothing
  - Add subtle glow effects to landmarks (shadowBlur = 10-15px)
  - Vary connection line thickness based on landmark confidence
  - Add fade-in animation when landmarks first appear
  - Ensure colors match Patternstein Halloween theme
  - _Requirements: 3.5, 4.1, 4.2, 4.3, 4.5_

- [x] 9. Test responsive design and browser compatibility
  - Test on desktop browsers (Chrome, Firefox, Safari, Edge)
  - Test on mobile devices (iOS Safari, Android Chrome)
  - Verify skeleton scales correctly on different screen sizes
  - Test portrait and landscape orientations on mobile
  - Verify performance on lower-end devices
  - _Requirements: 1.5, 2.1, 3.3_

- [x] 10. Final integration and verification
  - Verify skeleton overlay works with live camera feed
  - Test start/stop camera functionality with overlay
  - Ensure no conflicts with existing posture analysis features
  - Verify overlay doesn't interfere with analysis results display
  - Test that overlay enhances rather than distracts from analysis
  - Validate all colors match Patternstein theme
  - _Requirements: 1.1, 1.2, 2.2, 3.1, 4.1_
