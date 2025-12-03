# Project Structure

## Root Directory

```
Patternstein/
├── frontend/                    # React/TypeScript frontend components
│   └── src/
│       ├── hooks/              # React hooks (useMediaPipe)
│       └── utils/              # Frontend utilities
├── src/                        # Core TypeScript source
│   ├── types/                  # TypeScript type definitions
│   └── utils/                  # Utility functions (skeletonRenderer, mediapipeHelpers)
├── tests/                      # Test files
│   ├── README.md              # Testing documentation
│   ├── *.test.ts              # Test files (property-based, visual, error, responsive)
│   └── fixtures/              # Test fixtures and sample data
├── .kiro/                      # Kiro IDE configuration
│   ├── specs/                 # Feature specifications
│   │   └── mediapipe-skeleton-overlay/
│   │       ├── requirements.md
│   │       ├── design.md
│   │       └── tasks.md
│   └── steering/              # Steering rules (this directory)
├── *.html                      # HTML pages for each agent and demos
├── *.md                        # Documentation files
├── package.json               # NPM dependencies and scripts
└── *.sh                       # Shell scripts for validation
```

## Key Directories

### `/frontend/src/hooks/`
React hooks for MediaPipe integration:
- `useMediaPipe.tsx`: Main hook for camera, pose detection, and rendering

### `/src/utils/`
Core rendering and helper utilities:
- `skeletonRenderer.ts`: Canvas drawing functions for skeleton overlay
- `mediapipeHelpers.ts`: Landmark smoothing and processing

### `/src/types/`
TypeScript type definitions:
- `movement.ts`: Landmark and pose types

### `/tests/`
Comprehensive test suite:
- `skeletonRenderer.property.test.ts`: Property-based tests using fast-check
- `skeletonRenderer.visual.test.ts`: Visual rendering tests
- `skeletonRenderer.error.test.ts`: Error handling tests
- `responsive.compatibility.test.ts`: Responsive design tests

### `/.kiro/specs/`
Feature specifications following the spec workflow:
- `requirements.md`: User stories and acceptance criteria
- `design.md`: Technical design and correctness properties
- `tasks.md`: Implementation tasks

## HTML Pages

### Agent Pages
- `movement-agent.html`: Movement analysis with MediaPipe
- `vitals-agent.html`: ECG/heart rhythm analysis
- `pathology-agent.html`: Cancer detection
- `genomic-agent.html`: DNA sequence analysis
- `language-agent.html`: Symptom processing
- `radiology-agent.html`: Medical imaging
- `lab-results-agent.html`: Blood work interpretation

### Main Pages
- `index.html`: Landing page with gothic theme
- `patternstein.html`: Fusion interface
- `demo-movement-agent.html`: Movement agent demo

### Test Pages
- `test-*.html`: Various test pages for features
- `verify-*.html`: Verification pages

## File Naming Conventions

- **Components**: PascalCase for React components (`useMediaPipe.tsx`)
- **Utilities**: camelCase for utility files (`skeletonRenderer.ts`)
- **Tests**: `*.test.ts` suffix for test files
- **HTML**: kebab-case for HTML files (`movement-agent.html`)
- **Documentation**: SCREAMING_SNAKE_CASE for implementation docs (`SKELETON_RENDERER_IMPLEMENTATION.md`)

## Import Patterns

```typescript
// Type imports
import { LandmarksArray, Landmark } from '../types/movement';

// Utility imports
import { drawSkeletonOverlay } from '../utils/skeletonRenderer';
import { smoothLandmarks } from '../utils/mediapipeHelpers';

// External library imports
import { Pose, Results } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
```

## Configuration Files

- `package.json`: NPM configuration and scripts
- `tsconfig.json`: TypeScript compiler configuration
- `vite.config.ts`: Vite build configuration (if present)
- `.eslintrc.*`: ESLint configuration (if present)

## Asset Organization

- **Icons/Images**: Root directory (e.g., `brain-circuit-icon.svg`, `kolam-favicon.svg`)
- **Favicons**: SVG format preferred for scalability
- **Test Assets**: In `tests/fixtures/` directory
