# Responsive Design & Browser Compatibility Test Guide

## Overview

This guide provides comprehensive testing procedures for the MediaPipe Skeleton Overlay feature across different browsers, devices, and screen sizes.

**Requirements Validated**: 1.5, 2.1, 3.3

## Test Files

1. **test-responsive-compatibility.html** - Interactive browser test page
2. **tests/responsive.compatibility.test.ts** - Automated unit tests

## Manual Testing Procedures

### 1. Desktop Browser Testing

#### Chrome (Recommended: v90+)

1. Open `test-responsive-compatibility.html` in Chrome
2. Click "Start Camera" to activate webcam
3. Click "Run All Tests" to execute automated checks
4. Verify:
   - ✓ Skeleton overlay appears on video feed
   - ✓ FPS counter shows ≥25 FPS
   - ✓ Canvas dimensions match video dimensions
   - ✓ All test results show "PASS"

**Chrome DevTools Testing:**
```
1. Press F12 to open DevTools
2. Click "Toggle Device Toolbar" (Ctrl+Shift+M / Cmd+Shift+M)
3. Test these device presets:
   - iPhone SE (375x667)
   - iPhone 12 Pro (390x844)
   - iPad (768x1024)
   - iPad Pro (1024x1366)
4. Verify skeleton scales correctly for each size
```

#### Firefox (Recommended: v88+)

1. Open `test-responsive-compatibility.html` in Firefox
2. Follow same steps as Chrome
3. Verify:
   - ✓ Camera permission prompt works
   - ✓ Canvas rendering is smooth
   - ✓ Colors match Patternstein theme (cyan #00d4ff)

**Firefox Responsive Design Mode:**
```
1. Press Ctrl+Shift+M (Cmd+Option+M on Mac)
2. Test viewport sizes:
   - 320x568 (iPhone SE)
   - 375x667 (iPhone 8)
   - 768x1024 (iPad)
   - 1920x1080 (Desktop)
3. Verify no visual artifacts or clipping
```

#### Safari (Recommended: v14+)

1. Open `test-responsive-compatibility.html` in Safari
2. Allow camera permissions when prompted
3. Verify:
   - ✓ WebRTC camera access works
   - ✓ Canvas overlay renders correctly
   - ✓ Performance is acceptable (≥25 FPS)

**Safari Responsive Testing:**
```
1. Open Web Inspector (Cmd+Option+I)
2. Enable Responsive Design Mode
3. Test iPhone and iPad presets
4. Verify touch interactions work (if available)
```

#### Edge (Recommended: v90+)

1. Open `test-responsive-compatibility.html` in Edge
2. Follow same steps as Chrome
3. Verify compatibility with Chromium-based features

### 2. Mobile Device Testing

#### iOS Safari (iPhone)

**Portrait Mode:**
1. Open `test-responsive-compatibility.html` on iPhone
2. Tap "Start Camera"
3. Grant camera permissions
4. Verify:
   - ✓ Video fills viewport appropriately
   - ✓ Skeleton overlay scales to screen
   - ✓ Touch controls work smoothly
   - ✓ No layout shifts or overflow

**Landscape Mode:**
1. Rotate device to landscape
2. Verify:
   - ✓ Canvas resizes automatically
   - ✓ Skeleton maintains proportions
   - ✓ No visual artifacts during rotation
   - ✓ Performance remains stable

**Test Devices:**
- iPhone SE (2nd gen) - 375x667
- iPhone 12/13 - 390x844
- iPhone 12/13 Pro Max - 428x926

#### Android Chrome (Android)

**Portrait Mode:**
1. Open `test-responsive-compatibility.html` on Android
2. Tap "Start Camera"
3. Grant camera permissions
4. Verify:
   - ✓ Camera feed displays correctly
   - ✓ Skeleton overlay renders
   - ✓ Touch interactions responsive
   - ✓ FPS ≥25 on mid-range devices

**Landscape Mode:**
1. Rotate device to landscape
2. Verify:
   - ✓ Automatic canvas resize
   - ✓ Skeleton proportions correct
   - ✓ No performance degradation

**Test Devices:**
- Samsung Galaxy S21 - 360x800
- Google Pixel 5 - 393x851
- OnePlus 9 - 412x915

### 3. Tablet Testing

#### iPad (Safari)

**Portrait (768x1024):**
1. Open test page in Safari
2. Start camera
3. Verify:
   - ✓ Larger canvas renders efficiently
   - ✓ Skeleton landmarks clearly visible
   - ✓ Touch controls accessible

**Landscape (1024x768):**
1. Rotate to landscape
2. Verify:
   - ✓ Canvas resizes smoothly
   - ✓ Aspect ratio maintained
   - ✓ Performance stable

#### Android Tablet

**Portrait and Landscape:**
1. Test on Samsung Galaxy Tab or similar
2. Verify same criteria as iPad
3. Check performance on lower-end tablets

### 4. Screen Size Testing

#### Small Mobile (320px - 375px)

**Expected Behavior:**
- Canvas scales down appropriately
- Landmark dots remain visible (min 3px radius)
- Connection lines visible (min 1px width)
- Text and controls stack vertically
- No horizontal scrolling

**Test Cases:**
```
- iPhone SE: 320x568
- iPhone 8: 375x667
- Small Android: 360x640
```

#### Medium Mobile (376px - 414px)

**Expected Behavior:**
- Optimal mobile viewing experience
- All features fully functional
- Good performance (≥25 FPS)

**Test Cases:**
```
- iPhone 12: 390x844
- iPhone 12 Pro Max: 428x926
- Pixel 5: 393x851
```

#### Tablet (768px - 1024px)

**Expected Behavior:**
- Larger canvas for better detail
- Skeleton more visible
- Excellent performance (≥30 FPS)

**Test Cases:**
```
- iPad: 768x1024
- iPad Pro: 1024x1366
- Android tablets: 800x1280
```

#### Desktop (1024px+)

**Expected Behavior:**
- Full-size canvas (max 640px width)
- Highest quality rendering
- Smooth 30+ FPS
- All features accessible

**Test Cases:**
```
- HD: 1280x720
- Full HD: 1920x1080
- 2K: 2560x1440
- 4K: 3840x2160
```

### 5. Orientation Change Testing

**Procedure:**
1. Start camera in portrait mode
2. Verify skeleton renders correctly
3. Rotate device to landscape
4. Verify:
   - ✓ Canvas resizes within 100ms
   - ✓ Skeleton maintains proportions
   - ✓ No visual glitches
   - ✓ Performance stable
5. Rotate back to portrait
6. Verify same criteria

**Critical Checks:**
- Canvas dimensions update automatically
- Aspect ratio preserved
- No memory leaks
- Smooth transition

### 6. Performance Testing

#### High-End Devices

**Expected Performance:**
- FPS: 30+ consistently
- Render time: <10ms per frame
- No dropped frames
- Smooth animations

**Test Devices:**
- iPhone 13 Pro
- Samsung Galaxy S21+
- Desktop with dedicated GPU

#### Mid-Range Devices

**Expected Performance:**
- FPS: 25-30
- Render time: <16ms per frame
- Occasional frame drops acceptable
- Functional animations

**Test Devices:**
- iPhone SE (2nd gen)
- Samsung Galaxy A52
- Desktop with integrated GPU

#### Low-End Devices

**Expected Performance:**
- FPS: ≥20 (minimum acceptable)
- Render time: <20ms per frame
- Frame skipping may occur
- Basic functionality maintained

**Test Devices:**
- Older iPhones (iPhone 7/8)
- Budget Android phones
- Older desktop computers

**Performance Monitoring:**
```javascript
// Check FPS in browser console
setInterval(() => {
  console.log('Current FPS:', state.fps);
}, 1000);
```

### 7. Automated Test Execution

**Run Unit Tests:**
```bash
# Install dependencies (if not already installed)
npm install

# Run all tests
npm test

# Run responsive tests specifically
npm test tests/responsive.compatibility.test.ts

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui
```

**Expected Test Results:**
```
✓ Canvas Scaling (7 tests)
✓ Coordinate Scaling (2 tests)
✓ Orientation Support (3 tests)
✓ Performance Considerations (3 tests)
✓ Browser API Compatibility (4 tests)
✓ Responsive Breakpoints (3 tests)
✓ Skeleton Scaling Validation (3 tests)
✓ Browser Compatibility Tests (4 tests)

Total: 29 tests passed
```

## Test Checklist

### Desktop Browsers
- [ ] Chrome - All features working
- [ ] Firefox - All features working
- [ ] Safari - All features working
- [ ] Edge - All features working

### Mobile Devices
- [ ] iOS Safari (iPhone) - Portrait
- [ ] iOS Safari (iPhone) - Landscape
- [ ] Android Chrome - Portrait
- [ ] Android Chrome - Landscape

### Tablets
- [ ] iPad Safari - Portrait
- [ ] iPad Safari - Landscape
- [ ] Android Tablet - Portrait
- [ ] Android Tablet - Landscape

### Screen Sizes
- [ ] Small Mobile (320-375px)
- [ ] Medium Mobile (376-414px)
- [ ] Tablet (768-1024px)
- [ ] Desktop (1024px+)

### Orientation
- [ ] Portrait → Landscape transition
- [ ] Landscape → Portrait transition
- [ ] No visual artifacts
- [ ] Canvas resizes correctly

### Performance
- [ ] High-end devices (30+ FPS)
- [ ] Mid-range devices (25-30 FPS)
- [ ] Low-end devices (≥20 FPS)
- [ ] No memory leaks

### Visual Quality
- [ ] Skeleton scales correctly
- [ ] Colors match theme
- [ ] Glow effects visible
- [ ] No clipping or overflow

## Common Issues & Solutions

### Issue: Canvas not resizing on orientation change

**Solution:**
```javascript
window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    syncCanvasSize();
  }, 100);
});
```

### Issue: Poor performance on mobile

**Solution:**
- Reduce landmark size
- Disable glow effects
- Skip frames if needed
- Lower video resolution

### Issue: Safari camera permissions

**Solution:**
- Ensure HTTPS or localhost
- Check Safari settings
- Clear site data and retry

### Issue: Canvas blurry on high DPI displays

**Solution:**
```javascript
const dpr = window.devicePixelRatio || 1;
canvas.width = width * dpr;
canvas.height = height * dpr;
ctx.scale(dpr, dpr);
```

## Success Criteria

All tests must pass with the following criteria:

1. **Browser Compatibility**: Works on Chrome, Firefox, Safari, Edge (latest versions)
2. **Mobile Support**: Functional on iOS and Android devices
3. **Responsive Design**: Scales correctly on all screen sizes (320px - 3840px)
4. **Orientation**: Handles portrait/landscape changes smoothly
5. **Performance**: Maintains ≥25 FPS on mid-range devices
6. **Visual Quality**: Skeleton overlay clearly visible and aesthetically pleasing
7. **No Errors**: No console errors or warnings
8. **Accessibility**: Touch and mouse interactions work correctly

## Reporting Issues

When reporting issues, include:

1. Browser name and version
2. Device model and OS version
3. Screen size and orientation
4. FPS measurement
5. Console errors (if any)
6. Screenshots or screen recordings
7. Steps to reproduce

## Next Steps

After completing all tests:

1. Document any browser-specific quirks
2. Update compatibility matrix
3. Add fallbacks for unsupported features
4. Optimize performance bottlenecks
5. Mark task as complete in tasks.md
