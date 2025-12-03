# Technology Stack

## Frontend

### Core Technologies
- **HTML5/CSS3/Vanilla JavaScript**: Main UI implementation
- **React 18.2** + **TypeScript 5.3**: Movement Agent frontend components
- **Vite 5.0**: Build tool and dev server
- **MediaPipe Pose 0.5**: Real-time pose detection and landmark tracking
- **HTML5 Canvas API**: Skeleton overlay rendering

### Build System
```bash
# Development
npm run dev              # Start Vite dev server

# Production
npm run build            # TypeScript compilation + Vite build

# Type Checking
npm run type-check       # Run TypeScript compiler without emitting
npm run lint             # ESLint for TypeScript files
```

### Testing
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui

# Run specific test file
npm test skeletonRenderer.property.test.ts
```

**Testing Framework**: Vitest 1.0 with fast-check 3.15 for property-based testing

## Backend

### ML/AI Stack
- **TensorFlow 2.12+** / Keras: Model training and inference
- **NumPy, Pandas, scikit-learn**: Data processing
- **OpenCV, Pillow**: Image processing
- **wfdb, neurokit2**: Physiological signal processing

### API Layer
- **Flask**: REST APIs for each agent
- **Gunicorn**: WSGI server for production
- **Python 3.8+**: Runtime environment

## Cloud Infrastructure

- **Google Cloud Platform**: Primary deployment platform
  - Vertex AI: Model training
  - Cloud Storage: Model and data storage
  - Cloud Run: Containerized API deployment
- **Google Colab**: GPU training environment
- **Docker**: Containerization

## Development Tools

- **Kiro IDE**: Primary development environment with custom MCP tools
- **Git/GitHub**: Version control
- **TensorBoard**: Training visualization

## Key Libraries

```json
{
  "dependencies": {
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@mediapipe/camera_utils": "^0.3.1675469404",
    "@mediapipe/pose": "^0.5.1675469404",
    "@types/react": "^18.2.45",
    "@vitest/ui": "^1.0.4",
    "fast-check": "^3.15.0",
    "react": "^18.2.0",
    "typescript": "^5.3.3",
    "vite": "^5.0.8",
    "vitest": "^1.0.4"
  }
}
```

## Performance Targets

- **Rendering**: 25+ FPS (60 FPS target)
- **Inference**: <2s per sample
- **Frame Processing**: 10 FPS throttled (configurable 5-30 FPS)
- **Max Render Time**: 16ms per frame (60 FPS = 16.67ms)

## Common Commands

```bash
# Install dependencies
npm install

# Start development server (long-running - use controlBashProcess)
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Type check
npm run type-check

# Lint code
npm run lint

# MCP server (if needed)
npm run mcp:start
npm run mcp:dev
```
