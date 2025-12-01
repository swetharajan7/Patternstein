# Tests

## Setup

Before running tests, ensure you have Node.js and npm installed, then install dependencies:

```bash
npm install
```

## Running Tests

### All Tests
```bash
npm test
```

### Property-Based Tests Only
```bash
npm test skeletonRenderer.property.test.ts
```

### With Coverage
```bash
npm run test:coverage
```

### With UI
```bash
npm run test:ui
```

## Property-Based Testing

This project uses `fast-check` for property-based testing. Property tests are marked with comments indicating:
- **Feature**: The feature name from the spec
- **Property**: The property number and description
- **Validates**: The requirements being validated

### Example
```typescript
/**
 * **Feature: mediapipe-skeleton-overlay, Property 3: Visibility-based rendering**
 * **Validates: Requirements 1.3, 1.4**
 */
```

## Test Files

- `analyze_motion.test.ts` - Unit tests for motion analysis
- `skeletonRenderer.property.test.ts` - Property-based tests for skeleton rendering
- `fixtures/sample-frames.ts` - Test fixtures with sample landmark data
