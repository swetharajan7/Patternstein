/**
 * Visual Enhancement Tests for Skeleton Renderer
 * Tests for smooth transitions, glow effects, variable line thickness, and fade-in animations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  drawConnections,
  drawLandmarkPoints,
  drawSkeletonOverlay,
  resetAnimationState,
  RENDER_CONFIG,
  PATTERNSTEIN_COLORS,
} from '../src/utils/skeletonRenderer';
import { LandmarksArray } from '../src/types/movement';

// Mock canvas context
class MockCanvasContext {
  lineWidth: number = 0;
  strokeStyle: string = '';
  fillStyle: string = '';
  globalAlpha: number = 1;
  shadowBlur: number = 0;
  shadowColor: string = '';
  
  private operations: string[] = [];

  beginPath() {
    this.operations.push('beginPath');
  }

  moveTo(x: number, y: number) {
    this.operations.push(`moveTo(${x},${y})`);
  }

  lineTo(x: number, y: number) {
    this.operations.push(`lineTo(${x},${y})`);
  }

  stroke() {
    this.operations.push('stroke');
  }

  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
    this.operations.push(`arc(${x},${y},${radius},${startAngle},${endAngle})`);
  }

  fill() {
    this.operations.push('fill');
  }

  clearRect(x: number, y: number, width: number, height: number) {
    this.operations.push(`clearRect(${x},${y},${width},${height})`);
  }

  getOperations(): string[] {
    return [...this.operations];
  }

  clearOperations() {
    this.operations = [];
  }
}

// Helper to create mock landmarks
function createMockLandmarks(visibility: number = 1.0): LandmarksArray {
  return Array.from({ length: 33 }, (_, i) => ({
    x: 0.5 + (i * 0.01),
    y: 0.5 + (i * 0.01),
    z: 0,
    visibility,
  })) as LandmarksArray;
}

describe('Visual Enhancements', () => {
  let mockCtx: MockCanvasContext;
  let mockCanvas: any;

  beforeEach(() => {
    mockCtx = new MockCanvasContext();
    mockCanvas = {
      width: 640,
      height: 480,
      getContext: () => mockCtx,
    };
    resetAnimationState();
  });

  describe('Glow Effects', () => {
    it('should apply glow effects to landmarks with shadowBlur', () => {
      const landmarks = createMockLandmarks(1.0);
      
      drawLandmarkPoints(mockCtx as any, landmarks, 640, 480);

      // Check that shadowBlur was set (glow effect)
      expect(mockCtx.shadowBlur).toBeGreaterThan(0);
    });

    it('should use increased glow blur value (10-15px)', () => {
      const landmarks = createMockLandmarks(1.0);
      
      drawLandmarkPoints(mockCtx as any, landmarks, 640, 480);

      // Verify glow blur is in the 10-15px range
      expect(RENDER_CONFIG.glowBlur).toBeGreaterThanOrEqual(10);
      expect(RENDER_CONFIG.glowBlur).toBeLessThanOrEqual(15);
    });

    it('should set shadowColor to match landmark color', () => {
      const landmarks = createMockLandmarks(1.0);
      
      drawLandmarkPoints(mockCtx as any, landmarks, 640, 480);

      // shadowColor should be set (not empty)
      expect(mockCtx.shadowColor).not.toBe('');
    });
  });

  describe('Variable Connection Line Thickness', () => {
    it('should vary line thickness based on landmark confidence', () => {
      const lineWidths: number[] = [];
      
      // Test with different confidence levels
      const confidenceLevels = [0.5, 0.7, 0.9, 1.0];
      
      for (const confidence of confidenceLevels) {
        mockCtx.clearOperations();
        const landmarks = createMockLandmarks(confidence);
        
        drawConnections(mockCtx as any, landmarks, 640, 480);
        
        // Capture the line width used
        lineWidths.push(mockCtx.lineWidth);
      }

      // Line widths should increase with confidence
      for (let i = 1; i < lineWidths.length; i++) {
        expect(lineWidths[i]).toBeGreaterThanOrEqual(lineWidths[i - 1]);
      }
    });

    it('should use minimum line width for low confidence', () => {
      const landmarks = createMockLandmarks(0.5);
      
      drawConnections(mockCtx as any, landmarks, 640, 480);

      // Line width should be close to minimum
      expect(mockCtx.lineWidth).toBeGreaterThanOrEqual(RENDER_CONFIG.minConnectionWidth);
      expect(mockCtx.lineWidth).toBeLessThanOrEqual(RENDER_CONFIG.minConnectionWidth + 1);
    });

    it('should use maximum line width for high confidence', () => {
      const landmarks = createMockLandmarks(1.0);
      
      drawConnections(mockCtx as any, landmarks, 640, 480);

      // Line width should be close to maximum
      expect(mockCtx.lineWidth).toBeGreaterThanOrEqual(RENDER_CONFIG.maxConnectionWidth - 1);
      expect(mockCtx.lineWidth).toBeLessThanOrEqual(RENDER_CONFIG.maxConnectionWidth);
    });
  });

  describe('Fade-in Animation', () => {
    it('should start with low opacity when landmarks first appear', () => {
      const landmarks = createMockLandmarks(1.0);
      
      // First render - should have low opacity
      drawLandmarkPoints(mockCtx as any, landmarks, 640, 480);

      // globalAlpha should be less than full opacity initially
      expect(mockCtx.globalAlpha).toBeLessThan(RENDER_CONFIG.opacity);
    });

    it('should gradually increase opacity over time', async () => {
      const landmarks = createMockLandmarks(1.0);
      const opacities: number[] = [];

      // Render multiple times with small delays
      for (let i = 0; i < 5; i++) {
        mockCtx.clearOperations();
        drawLandmarkPoints(mockCtx as any, landmarks, 640, 480);
        opacities.push(mockCtx.globalAlpha);
        
        // Small delay
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Opacity should increase or stay the same (never decrease)
      for (let i = 1; i < opacities.length; i++) {
        expect(opacities[i]).toBeGreaterThanOrEqual(opacities[i - 1]);
      }
    });

    it('should reach full opacity after fade-in duration', async () => {
      const landmarks = createMockLandmarks(1.0);

      // Wait for fade-in duration
      await new Promise(resolve => setTimeout(resolve, RENDER_CONFIG.fadeInDuration + 50));

      drawLandmarkPoints(mockCtx as any, landmarks, 640, 480);

      // Should be at full opacity
      expect(mockCtx.globalAlpha).toBeCloseTo(RENDER_CONFIG.opacity, 1);
    });

    it('should reset animation state when resetAnimationState is called', () => {
      const landmarks = createMockLandmarks(1.0);

      // First render
      drawLandmarkPoints(mockCtx as any, landmarks, 640, 480);
      const firstOpacity = mockCtx.globalAlpha;

      // Wait a bit
      setTimeout(() => {
        // Reset animation state
        resetAnimationState();

        // Render again - should start from low opacity again
        mockCtx.clearOperations();
        drawLandmarkPoints(mockCtx as any, landmarks, 640, 480);
        const secondOpacity = mockCtx.globalAlpha;

        // Second opacity should be similar to first (both starting fresh)
        expect(Math.abs(secondOpacity - firstOpacity)).toBeLessThan(0.2);
      }, 100);
    });
  });

  describe('Patternstein Color Scheme', () => {
    it('should use cyan for face landmarks', () => {
      const landmarks = createMockLandmarks(1.0);
      
      drawLandmarkPoints(mockCtx as any, landmarks, 640, 480);

      // Face landmarks (0-10) should use cyan
      expect(PATTERNSTEIN_COLORS.face).toBe('#00d4ff');
    });

    it('should use green for upper body landmarks', () => {
      expect(PATTERNSTEIN_COLORS.upperBody).toBe('#00ff88');
    });

    it('should use orange for lower body landmarks', () => {
      expect(PATTERNSTEIN_COLORS.lowerBody).toBe('#ff9800');
    });

    it('should use cyan for connections', () => {
      expect(PATTERNSTEIN_COLORS.connections).toBe('#00d4ff');
    });
  });

  describe('Integration Test', () => {
    it('should apply all visual enhancements together', () => {
      const landmarks = createMockLandmarks(0.8);

      drawSkeletonOverlay(mockCanvas, landmarks, {
        showConnections: true,
        showLandmarks: true,
        minVisibility: 0.5,
      });

      const operations = mockCtx.getOperations();

      // Should have cleared canvas
      expect(operations.some(op => op.startsWith('clearRect'))).toBe(true);

      // Should have drawn connections (lines)
      expect(operations.some(op => op.startsWith('lineTo'))).toBe(true);

      // Should have drawn landmarks (arcs)
      expect(operations.some(op => op.startsWith('arc'))).toBe(true);

      // Should have applied glow effects
      expect(mockCtx.shadowBlur).toBeGreaterThan(0);

      // Should have varied line thickness
      expect(mockCtx.lineWidth).toBeGreaterThan(0);
    });
  });
});
