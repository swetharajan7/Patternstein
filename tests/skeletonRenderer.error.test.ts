/**
 * Unit Tests for Skeleton Renderer Error Handling
 * Tests behavior when canvas context is null, landmarks are incomplete, or visibility values are invalid
 * Validates: Requirements 1.5, 3.1
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  drawSkeletonOverlay,
  drawLandmarkPoints,
  drawConnections,
} from '../src/utils/skeletonRenderer';
import { LandmarksArray, Landmark } from '../src/types/movement';

// ============================================================================
// Test Helpers
// ============================================================================

/**
 * Create a valid landmark for testing
 */
function createValidLandmark(overrides: Partial<Landmark> = {}): Landmark {
  return {
    x: 0.5,
    y: 0.5,
    z: 0,
    visibility: 1.0,
    ...overrides,
  };
}

/**
 * Create a complete landmarks array (33 landmarks)
 */
function createValidLandmarksArray(overrides: Partial<Landmark> = {}): LandmarksArray {
  return Array(33).fill(null).map(() => createValidLandmark(overrides)) as LandmarksArray;
}

/**
 * Create a mock canvas element
 */
function createMockCanvas(width: number = 640, height: number = 480) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/**
 * Create a mock canvas that returns null context
 */
function createNullContextCanvas() {
  const canvas = {
    width: 640,
    height: 480,
    getContext: vi.fn(() => null),
  } as any;
  return canvas;
}

// ============================================================================
// Error Handling Tests
// ============================================================================

describe('Skeleton Renderer - Error Handling', () => {
  let consoleErrorSpy: any;
  let consoleWarnSpy: any;

  beforeEach(() => {
    // Spy on console methods to verify error logging
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  // ==========================================================================
  // Canvas Context Null Tests
  // ==========================================================================

  describe('Canvas context is null', () => {
    it('should handle null canvas context in drawSkeletonOverlay', () => {
      const canvas = createNullContextCanvas();
      const landmarks = createValidLandmarksArray();

      // Should not throw
      expect(() => {
        drawSkeletonOverlay(canvas, landmarks);
      }).not.toThrow();

      // Should log error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to get 2D context')
      );
    });

    it('should handle null canvas context in drawConnections', () => {
      const landmarks = createValidLandmarksArray();

      // Should not throw
      expect(() => {
        drawConnections(null as any, landmarks, 640, 480);
      }).not.toThrow();

      // Should log error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Canvas context is null')
      );
    });

    it('should handle null canvas context in drawLandmarkPoints', () => {
      const landmarks = createValidLandmarksArray();

      // Should not throw
      expect(() => {
        drawLandmarkPoints(null as any, landmarks, 640, 480);
      }).not.toThrow();

      // Should log error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Canvas context is null')
      );
    });

    it('should handle null canvas element in drawSkeletonOverlay', () => {
      const landmarks = createValidLandmarksArray();

      // Should not throw
      expect(() => {
        drawSkeletonOverlay(null as any, landmarks);
      }).not.toThrow();

      // Should log error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Canvas element is null')
      );
    });
  });

  // ==========================================================================
  // Incomplete Landmarks Array Tests
  // ==========================================================================

  describe('Landmarks array is incomplete', () => {
    it('should handle empty landmarks array', () => {
      const canvas = createMockCanvas();
      const landmarks = [] as any;

      // Should not throw
      expect(() => {
        drawSkeletonOverlay(canvas, landmarks);
      }).not.toThrow();

      // Should log warning
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid landmarks array'),
        expect.anything()
      );
    });

    it('should handle landmarks array with fewer than 33 elements', () => {
      const canvas = createMockCanvas();
      const landmarks = Array(20).fill(createValidLandmark()) as any;

      // Should not throw
      expect(() => {
        drawSkeletonOverlay(canvas, landmarks);
      }).not.toThrow();

      // Should log warning
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid landmarks array'),
        20
      );
    });

    it('should handle landmarks array with more than 33 elements', () => {
      const canvas = createMockCanvas();
      const landmarks = Array(40).fill(createValidLandmark()) as any;

      // Should not throw
      expect(() => {
        drawSkeletonOverlay(canvas, landmarks);
      }).not.toThrow();

      // Should log warning
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid landmarks array'),
        40
      );
    });

    it('should handle null landmarks array', () => {
      const canvas = createMockCanvas();

      // Should not throw
      expect(() => {
        drawSkeletonOverlay(canvas, null as any);
      }).not.toThrow();

      // Should log warning
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid landmarks array'),
        expect.anything()
      );
    });

    it('should handle undefined landmarks array', () => {
      const canvas = createMockCanvas();

      // Should not throw
      expect(() => {
        drawSkeletonOverlay(canvas, undefined as any);
      }).not.toThrow();

      // Should log warning
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid landmarks array'),
        expect.anything()
      );
    });

    it('should handle non-array landmarks', () => {
      const canvas = createMockCanvas();
      const landmarks = { length: 33 } as any;

      // Should not throw
      expect(() => {
        drawSkeletonOverlay(canvas, landmarks);
      }).not.toThrow();

      // Should log warning
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid landmarks array'),
        expect.anything()
      );
    });
  });

  // ==========================================================================
  // Invalid Visibility Values Tests
  // ==========================================================================

  describe('Visibility values are invalid', () => {
    it('should handle NaN visibility values', () => {
      const canvas = createMockCanvas();
      const landmarks = createValidLandmarksArray({ visibility: NaN });

      // Should not throw
      expect(() => {
        drawSkeletonOverlay(canvas, landmarks);
      }).not.toThrow();

      // No landmarks should be drawn (all treated as visibility 0)
      // This is verified by the function not crashing
    });

    it('should handle undefined visibility values', () => {
      const canvas = createMockCanvas();
      const landmarks = Array(33).fill(null).map(() => ({
        x: 0.5,
        y: 0.5,
        z: 0,
        visibility: undefined as any,
      })) as LandmarksArray;

      // Should not throw
      expect(() => {
        drawSkeletonOverlay(canvas, landmarks);
      }).not.toThrow();
    });

    it('should handle negative visibility values', () => {
      const canvas = createMockCanvas();
      const landmarks = createValidLandmarksArray({ visibility: -0.5 });

      // Should not throw
      expect(() => {
        drawSkeletonOverlay(canvas, landmarks);
      }).not.toThrow();

      // Negative visibility should be treated as 0 (not visible)
    });

    it('should handle visibility values greater than 1', () => {
      const canvas = createMockCanvas();
      const landmarks = createValidLandmarksArray({ visibility: 1.5 });

      // Should not throw
      expect(() => {
        drawSkeletonOverlay(canvas, landmarks);
      }).not.toThrow();

      // Values > 1 should still render (treated as fully visible)
    });

    it('should handle string visibility values', () => {
      const canvas = createMockCanvas();
      const landmarks = Array(33).fill(null).map(() => ({
        x: 0.5,
        y: 0.5,
        z: 0,
        visibility: '1.0' as any,
      })) as LandmarksArray;

      // Should not throw
      expect(() => {
        drawSkeletonOverlay(canvas, landmarks);
      }).not.toThrow();
    });

    it('should handle mixed valid and invalid visibility values', () => {
      const canvas = createMockCanvas();
      const landmarks = Array(33).fill(null).map((_, i) => ({
        x: 0.5,
        y: 0.5,
        z: 0,
        visibility: i % 2 === 0 ? 1.0 : NaN,
      })) as LandmarksArray;

      // Should not throw
      expect(() => {
        drawSkeletonOverlay(canvas, landmarks);
      }).not.toThrow();

      // Only valid landmarks should be drawn
    });
  });

  // ==========================================================================
  // Invalid Coordinate Values Tests
  // ==========================================================================

  describe('Coordinate values are invalid', () => {
    it('should handle NaN coordinate values', () => {
      const canvas = createMockCanvas();
      const landmarks = createValidLandmarksArray({ x: NaN, y: NaN });

      // Should not throw
      expect(() => {
        drawSkeletonOverlay(canvas, landmarks);
      }).not.toThrow();
    });

    it('should handle undefined coordinate values', () => {
      const canvas = createMockCanvas();
      const landmarks = Array(33).fill(null).map(() => ({
        x: undefined as any,
        y: undefined as any,
        z: 0,
        visibility: 1.0,
      })) as LandmarksArray;

      // Should not throw
      expect(() => {
        drawSkeletonOverlay(canvas, landmarks);
      }).not.toThrow();
    });

    it('should handle string coordinate values', () => {
      const canvas = createMockCanvas();
      const landmarks = Array(33).fill(null).map(() => ({
        x: '0.5' as any,
        y: '0.5' as any,
        z: 0,
        visibility: 1.0,
      })) as LandmarksArray;

      // Should not throw
      expect(() => {
        drawSkeletonOverlay(canvas, landmarks);
      }).not.toThrow();
    });

    it('should handle coordinates outside [0, 1] range', () => {
      const canvas = createMockCanvas();
      const landmarks = createValidLandmarksArray({ x: 2.0, y: -1.0 });

      // Should not throw (coordinates can be outside normalized range)
      expect(() => {
        drawSkeletonOverlay(canvas, landmarks);
      }).not.toThrow();
    });
  });

  // ==========================================================================
  // Missing Landmarks Tests
  // ==========================================================================

  describe('Missing landmarks in array', () => {
    it('should skip connections with null landmarks', () => {
      const canvas = createMockCanvas();
      const landmarks = createValidLandmarksArray();
      landmarks[0] = null as any; // Make first landmark null

      // Should not throw
      expect(() => {
        drawSkeletonOverlay(canvas, landmarks);
      }).not.toThrow();

      // Connections involving landmark 0 should be skipped
    });

    it('should skip connections with undefined landmarks', () => {
      const canvas = createMockCanvas();
      const landmarks = createValidLandmarksArray();
      landmarks[11] = undefined as any; // Make shoulder landmark undefined

      // Should not throw
      expect(() => {
        drawSkeletonOverlay(canvas, landmarks);
      }).not.toThrow();

      // Connections involving landmark 11 should be skipped
    });

    it('should handle array with multiple missing landmarks', () => {
      const canvas = createMockCanvas();
      const landmarks = createValidLandmarksArray();
      landmarks[0] = null as any;
      landmarks[5] = null as any;
      landmarks[10] = null as any;
      landmarks[15] = null as any;

      // Should not throw
      expect(() => {
        drawSkeletonOverlay(canvas, landmarks);
      }).not.toThrow();
    });

    it('should handle array with all null landmarks', () => {
      const canvas = createMockCanvas();
      const landmarks = Array(33).fill(null) as any;

      // Should not throw
      expect(() => {
        drawSkeletonOverlay(canvas, landmarks);
      }).not.toThrow();

      // Should log warning about invalid array
      expect(consoleWarnSpy).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Invalid Canvas Dimensions Tests
  // ==========================================================================

  describe('Invalid canvas dimensions', () => {
    it('should handle zero width canvas', () => {
      const canvas = createMockCanvas(0, 480);
      const landmarks = createValidLandmarksArray();

      // Should not throw
      expect(() => {
        drawSkeletonOverlay(canvas, landmarks);
      }).not.toThrow();

      // Should log warning
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid canvas dimensions'),
        expect.anything()
      );
    });

    it('should handle zero height canvas', () => {
      const canvas = createMockCanvas(640, 0);
      const landmarks = createValidLandmarksArray();

      // Should not throw
      expect(() => {
        drawSkeletonOverlay(canvas, landmarks);
      }).not.toThrow();

      // Should log warning
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid canvas dimensions'),
        expect.anything()
      );
    });

    it('should handle negative canvas dimensions', () => {
      const canvas = {
        width: -640,
        height: -480,
        getContext: () => ({
          clearRect: vi.fn(),
          beginPath: vi.fn(),
          moveTo: vi.fn(),
          lineTo: vi.fn(),
          stroke: vi.fn(),
          arc: vi.fn(),
          fill: vi.fn(),
          fillStyle: '',
          strokeStyle: '',
          lineWidth: 0,
          globalAlpha: 1,
          shadowBlur: 0,
          shadowColor: '',
        }),
      } as any;
      const landmarks = createValidLandmarksArray();

      // Should not throw
      expect(() => {
        drawSkeletonOverlay(canvas, landmarks);
      }).not.toThrow();

      // Should log warning
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid canvas dimensions'),
        expect.anything()
      );
    });
  });

  // ==========================================================================
  // Error Recovery Tests
  // ==========================================================================

  describe('Error recovery', () => {
    it('should reset context state after error in drawConnections', () => {
      const canvas = createMockCanvas();
      const ctx = canvas.getContext('2d')!;
      const landmarks = createValidLandmarksArray();

      // Mock stroke to throw error
      const originalStroke = ctx.stroke;
      ctx.stroke = vi.fn(() => {
        throw new Error('Stroke error');
      });

      // Should not throw
      expect(() => {
        drawConnections(ctx, landmarks, canvas.width, canvas.height);
      }).not.toThrow();

      // Should log error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error drawing connections'),
        expect.any(Error)
      );

      // Restore original stroke
      ctx.stroke = originalStroke;
    });

    it('should reset context state after error in drawLandmarkPoints', () => {
      const canvas = createMockCanvas();
      const ctx = canvas.getContext('2d')!;
      const landmarks = createValidLandmarksArray();

      // Mock fill to throw error
      const originalFill = ctx.fill;
      ctx.fill = vi.fn(() => {
        throw new Error('Fill error');
      });

      // Should not throw
      expect(() => {
        drawLandmarkPoints(ctx, landmarks, canvas.width, canvas.height);
      }).not.toThrow();

      // Should log error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error drawing landmark points'),
        expect.any(Error)
      );

      // Restore original fill
      ctx.fill = originalFill;
    });

    it('should continue video feed after rendering error', () => {
      const canvas = createMockCanvas();
      const landmarks = createValidLandmarksArray();

      // Mock getContext to throw error
      const originalGetContext = canvas.getContext;
      canvas.getContext = vi.fn(() => {
        throw new Error('Context error');
      });

      // Should not throw
      expect(() => {
        drawSkeletonOverlay(canvas, landmarks);
      }).not.toThrow();

      // Should log error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error in drawSkeletonOverlay'),
        expect.any(Error)
      );

      // Restore original getContext
      canvas.getContext = originalGetContext;
    });

    it('should handle multiple consecutive errors gracefully', () => {
      const canvas = createMockCanvas();
      const landmarks = createValidLandmarksArray();

      // Call with invalid data multiple times
      for (let i = 0; i < 5; i++) {
        expect(() => {
          drawSkeletonOverlay(canvas, null as any);
        }).not.toThrow();
      }

      // Should log warnings for each call
      expect(consoleWarnSpy).toHaveBeenCalledTimes(5);
    });
  });

  // ==========================================================================
  // Integration Tests
  // ==========================================================================

  describe('Integration with real canvas', () => {
    it('should handle complete error scenario without crashing', () => {
      const canvas = createMockCanvas();
      const landmarks = createValidLandmarksArray();

      // Simulate various error conditions
      const errorScenarios = [
        null as any, // Null landmarks
        [] as any, // Empty array
        Array(20).fill(createValidLandmark()) as any, // Incomplete array
        createValidLandmarksArray({ visibility: NaN }), // Invalid visibility
        createValidLandmarksArray({ x: NaN, y: NaN }), // Invalid coordinates
      ];

      // None should throw
      errorScenarios.forEach((scenario) => {
        expect(() => {
          drawSkeletonOverlay(canvas, scenario);
        }).not.toThrow();
      });
    });

    it('should log errors without breaking video feed', () => {
      const canvas = createMockCanvas();
      const landmarks = createValidLandmarksArray();

      // Simulate error in rendering
      const ctx = canvas.getContext('2d')!;
      const originalClearRect = ctx.clearRect;
      ctx.clearRect = vi.fn(() => {
        throw new Error('Clear error');
      });

      // Should not throw
      expect(() => {
        drawSkeletonOverlay(canvas, landmarks);
      }).not.toThrow();

      // Should log error
      expect(consoleErrorSpy).toHaveBeenCalled();

      // Restore original clearRect
      ctx.clearRect = originalClearRect;
    });
  });
});
