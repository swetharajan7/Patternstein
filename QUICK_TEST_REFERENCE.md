# Quick Test Reference - Responsive & Compatibility Testing

## 🚀 Quick Start

### 1. Interactive Browser Test
```bash
# Open in your browser
open test-responsive-compatibility.html
```

### 2. Run Automated Tests
```bash
npm test tests/responsive.compatibility.test.ts
```

### 3. Validate Setup
```bash
bash validate-responsive-tests.sh
```

## 📱 Device Testing Quick Guide

### Desktop (5 minutes)
1. Open `test-responsive-compatibility.html` in Chrome
2. Click "Start Camera" → "Run All Tests"
3. Verify all tests pass and FPS ≥25
4. Repeat in Firefox and Safari

### Mobile (5 minutes)
1. Open test page on phone
2. Test portrait mode
3. Rotate to landscape
4. Verify smooth transition

### Tablet (3 minutes)
1. Open test page on tablet
2. Test both orientations
3. Verify performance

## ✅ Success Criteria Checklist

- [ ] All automated tests pass (29 tests)
- [ ] FPS ≥25 on all devices
- [ ] Canvas resizes on orientation change
- [ ] Works on Chrome, Firefox, Safari, Edge
- [ ] Works on iOS and Android
- [ ] No console errors

## 📊 Expected Performance

| Device | FPS | Status |
|--------|-----|--------|
| Desktop | 30+ | ✅ |
| Mobile | 25-30 | ✅ |
| Tablet | 30+ | ✅ |

## 🔍 Quick Troubleshooting

**Camera not working?**
- Check HTTPS or localhost
- Grant permissions
- Try different browser

**Low FPS?**
- Close other tabs
- Check device specs
- Disable glow effects

**Canvas not resizing?**
- Check ResizeObserver support
- Verify orientation event listeners
- Clear cache and reload

## 📚 Full Documentation

- **Testing Guide**: `RESPONSIVE_COMPATIBILITY_TEST_GUIDE.md`
- **Compatibility Matrix**: `BROWSER_COMPATIBILITY_MATRIX.md`
- **Task Summary**: `TASK_9_RESPONSIVE_TESTING_SUMMARY.md`

## 🎯 Requirements Validated

- ✅ **1.5**: Video feed without overlay when no person detected
- ✅ **2.1**: 30 FPS rendering performance
- ✅ **3.3**: Automatic canvas resize on video resize

---

**Need help?** Check the full guides or run validation script.
