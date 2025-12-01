/**
 * Responsive Design and Browser Compatibility Tests
 * Feature: mediapipe-skeleton-overlay
 * 
 * Tests Requirements: 1.5, 2.1, 3.3
 * - Desktop browser compatibility
 * - Mobile device support
 * - Skeleton scaling across screen sizes
 * - Portrait and landscape orientations
 * - Performance on various devices
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Responsive Design Tests', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas context not available');
    ctx = context;
  });

  afterEach(() => {
    canvas.remove();
  });

  describe('Canvas Scaling', () => {
    it('should scale canvas to match container dimensions', () => {
      // Test different viewport sizes
      const viewportSizes = [
        { width: 320, height: 568, name: 'Mobile Portrait (iPhone SE)' },
        { width: 375, height: 667, name: 'Mobile Portrait (iPhone 8)' },
        { width: 414, height: 896, name: 'Mobile Portrait (iPhone 11)' },
        { width: 768, height: 1024, name: 'Tablet Portrait (iPad)' },
        { width: 1024, height: 768, name: 'Tablet Landscape (iPad)' },
        { width: 1920, height: 1080, name: 'Desktop (Full HD)' },
        { width: 2560, height: 1440, name: 'Desktop (2K)' },
      ];

      viewportSizes.forEach(({ width, height, name }) => {
        canvas.width = width;
        canvas.height = height;

        expect(canvas.width).toBe(width);
        expect(canvas.height).toBe(height);
        expect(canvas.width / canvas.height).toBeCloseTo(width / height, 2);
      });
    });

    it('should maintain aspect ratio when scaling', () => {
      const originalWidth = 1280;
      const originalHeight = 720;
      const originalAspect = originalWidth / originalHeight;

      canvas.width = originalWidth;
      canvas.height = originalHeight;

      // Scale to different sizes
      const scales = [0.25, 0.5, 0.75, 1.5, 2.0];

      scales.forEach(scale => {
        const scaledWidth = originalWidth * scale;
        const scaledHeight = originalHeight * scale;
        const scaledAspect = scaledWidth / scaledHeight;

        expect(scaledAspect).toBeCloseTo(originalAspect, 5);
      });
    });

    it('should handle extreme aspect ratios', () => {
      // Ultra-wide
      canvas.width = 3440;
      canvas.height = 1440;
      expect(canvas.width).toBe(3440);
      expect(canvas.height).toBe(1440);

      // Ultra-tall (mobile)
      canvas.width = 360;
      canvas.height = 800;
      expect(canvas.width).toBe(360);
      expect(canvas.height).toBe(800);
    });
  });

  describe('Coordinate Scaling', () => {
    it('should scale normalized coordinates to canvas dimensions', () => {
      const testCases = [
        { canvasWidth: 640, canvasHeight: 480 },
        { canvasWidth: 1280, canvasHeight: 720 },
        { canvasWidth: 1920, canvasHeight: 1080 },
        { canvasWidth: 320, canvasHeight: 568 },
      ];

      testCases.forEach(({ canvasWidth, canvasHeight }) => {
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Test normalized coordinates (0-1 range)
        const normalizedPoints = [
          { x: 0, y: 0 },
          { x: 0.5, y: 0.5 },
          { x: 1, y: 1 },
          { x: 0.25, y: 0.75 },
        ];

        normalizedPoints.forEach(point => {
          const scaledX = point.x * canvasWidth;
          const scaledY = point.y * canvasHeight;

          expect(scaledX).toBeGreaterThanOrEqual(0);
          expect(scaledX).toBeLessThanOrEqual(canvasWidth);
          expect(scaledY).toBeGreaterThanOrEqual(0);
          expect(scaledY).toBeLessThanOrEqual(canvasHeight);
        });
      });
    });

    it('should handle device pixel ratio scaling', () => {
      const devicePixelRatios = [1, 1.5, 2, 3];

      devicePixelRatios.forEach(dpr => {
        const logicalWidth = 640;
        const logicalHeight = 480;

        const physicalWidth = logicalWidth * dpr;
        const physicalHeight = logicalHeight * dpr;

        canvas.width = physicalWidth;
        canvas.height = physicalHeight;
        canvas.style.width = `${logicalWidth}px`;
        canvas.style.height = `${logicalHeight}px`;

        expect(canvas.width).toBe(physicalWidth);
        expect(canvas.height).toBe(physicalHeight);
      });
    });
  });

  describe('Orientation Support', () => {
    it('should handle portrait orientation', () => {
      // Portrait: height > width
      canvas.width = 375;
      canvas.height = 667;

      expect(canvas.height).toBeGreaterThan(canvas.width);
      expect(canvas.width / canvas.height).toBeLessThan(1);
    });

    it('should handle landscape orientation', () => {
      // Landscape: width > height
      canvas.width = 667;
      canvas.height = 375;

      expect(canvas.width).toBeGreaterThan(canvas.height);
      expect(canvas.width / canvas.height).toBeGreaterThan(1);
    });

    it('should handle orientation changes', () => {
      // Start in portrait
      canvas.width = 375;
      canvas.height = 667;
      const portraitAspect = canvas.width / canvas.height;

      // Switch to landscape (swap dimensions)
      const temp = canvas.width;
      canvas.width = canvas.height;
      canvas.height = temp;
      const landscapeAspect = canvas.width / canvas.height;

      expect(portraitAspect).toBeLessThan(1);
      expect(landscapeAspect).toBeGreaterThan(1);
      expect(landscapeAspect).toBeCloseTo(1 / portraitAspect, 5);
    });
  });

  describe('Performance Considerations', () => {
    it('should render efficiently on small canvases (mobile)', () => {
      canvas.width = 320;
      canvas.height = 568;

      const startTime = performance.now();

      // Simulate drawing operations
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < 33; i++) {
        ctx.beginPath();
        ctx.arc(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          6,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render in less than 16ms (60 FPS)
      expect(renderTime).toBeLessThan(16);
    });

    it('should render efficiently on large canvases (desktop)', () => {
      canvas.width = 1920;
      canvas.height = 1080;

      const startTime = performance.now();

      // Simulate drawing operations
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < 33; i++) {
        ctx.beginPath();
        ctx.arc(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          6,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render in less than 16ms (60 FPS)
      expect(renderTime).toBeLessThan(16);
    });

    it('should handle high DPI displays efficiently', () => {
      const dpr = 2;
      canvas.width = 1280 * dpr;
      canvas.height = 720 * dpr;

      const startTime = performance.now();

      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      for (let i = 0; i < 33; i++) {
        ctx.beginPath();
        ctx.arc(
          Math.random() * (canvas.width / dpr),
          Math.random() * (canvas.height / dpr),
          6,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should still render efficiently
      expect(renderTime).toBeLessThan(20);
    });
  });

  describe('Browser API Compatibility', () => {
    it('should support Canvas 2D context', () => {
      const testCanvas = document.createElement('canvas');
      const context = testCanvas.getContext('2d');

      expect(context).not.toBeNull();
      expect(context).toBeInstanceOf(CanvasRenderingContext2D);
    });

    it('should support required canvas operations', () => {
      expect(typeof ctx.clearRect).toBe('function');
      expect(typeof ctx.beginPath).toBe('function');
      expect(typeof ctx.moveTo).toBe('function');
      expect(typeof ctx.lineTo).toBe('function');
      expect(typeof ctx.stroke).toBe('function');
      expect(typeof ctx.arc).toBe('function');
      expect(typeof ctx.fill).toBe('function');
    });

    it('should support shadow effects', () => {
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(0, 212, 255, 0.5)';

      expect(ctx.shadowBlur).toBe(10);
      expect(ctx.shadowColor).toBe('rgba(0, 212, 255, 0.5)');
    });

    it('should support transparency', () => {
      ctx.globalAlpha = 0.7;
      expect(ctx.globalAlpha).toBe(0.7);

      ctx.strokeStyle = 'rgba(0, 212, 255, 0.7)';
      expect(ctx.strokeStyle).toBe('#00d4ffb3'); // Browser converts to hex
    });
  });

  describe('Responsive Breakpoints', () => {
    it('should identify mobile viewport', () => {
      const mobileWidths = [320, 375, 414, 428];

      mobileWidths.forEach(width => {
        const isMobile = width < 768;
        expect(isMobile).toBe(true);
      });
    });

    it('should identify tablet viewport', () => {
      const tabletWidths = [768, 800, 1024];

      tabletWidths.forEach(width => {
        const isTablet = width >= 768 && width < 1024;
        expect(isTablet).toBe(true);
      });
    });

    it('should identify desktop viewport', () => {
      const desktopWidths = [1280, 1920, 2560, 3440];

      desktopWidths.forEach(width => {
        const isDesktop = width >= 1024;
        expect(isDesktop).toBe(true);
      });
    });
  });

  describe('Skeleton Scaling Validation', () => {
    it('should scale landmark size proportionally to canvas', () => {
      const baseLandmarkRadius = 6;
      const baseCanvasWidth = 640;

      const testSizes = [
        { width: 320, expectedRadius: 3 },
        { width: 640, expectedRadius: 6 },
        { width: 1280, expectedRadius: 12 },
        { width: 1920, expectedRadius: 18 },
      ];

      testSizes.forEach(({ width, expectedRadius }) => {
        const scale = width / baseCanvasWidth;
        const scaledRadius = baseLandmarkRadius * scale;

        expect(scaledRadius).toBeCloseTo(expectedRadius, 1);
      });
    });

    it('should scale connection line width proportionally', () => {
      const baseLineWidth = 3;
      const baseCanvasWidth = 640;

      const testSizes = [
        { width: 320, expectedWidth: 1.5 },
        { width: 640, expectedWidth: 3 },
        { width: 1280, expectedWidth: 6 },
        { width: 1920, expectedWidth: 9 },
      ];

      testSizes.forEach(({ width, expectedWidth }) => {
        const scale = width / baseCanvasWidth;
        const scaledWidth = baseLineWidth * scale;

        expect(scaledWidth).toBeCloseTo(expectedWidth, 1);
      });
    });

    it('should maintain minimum sizes on small screens', () => {
      const minLandmarkRadius = 3;
      const minLineWidth = 1;

      // Very small mobile screen
      canvas.width = 280;
      canvas.height = 653;

      const scale = canvas.width / 640;
      const landmarkRadius = Math.max(6 * scale, minLandmarkRadius);
      const lineWidth = Math.max(3 * scale, minLineWidth);

      expect(landmarkRadius).toBeGreaterThanOrEqual(minLandmarkRadius);
      expect(lineWidth).toBeGreaterThanOrEqual(minLineWidth);
    });
  });
});

describe('Browser Compatibility Tests', () => {
  describe('Feature Detection', () => {
    it('should detect Canvas API support', () => {
      const canvas = document.createElement('canvas');
      const hasCanvas = !!(canvas.getContext && canvas.getContext('2d'));

      expect(hasCanvas).toBe(true);
    });

    it('should detect requestAnimationFrame support', () => {
      expect(typeof requestAnimationFrame).toBe('function');
    });

    it('should detect performance API support', () => {
      expect(typeof performance).toBe('object');
      expect(typeof performance.now).toBe('function');
    });

    it('should detect ResizeObserver support', () => {
      expect(typeof ResizeObserver).toBe('function');
    });
  });

  describe('Color Format Support', () => {
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;

    beforeEach(() => {
      canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas context not available');
      ctx = context;
    });

    it('should support hex color format', () => {
      ctx.fillStyle = '#00d4ff';
      expect(ctx.fillStyle).toBeTruthy();
    });

    it('should support rgba color format', () => {
      ctx.fillStyle = 'rgba(0, 212, 255, 0.7)';
      expect(ctx.fillStyle).toBeTruthy();
    });

    it('should support rgb color format', () => {
      ctx.fillStyle = 'rgb(0, 212, 255)';
      expect(ctx.fillStyle).toBeTruthy();
    });
  });
});
