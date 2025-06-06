/**
 * 3D Visualization Engine
 * Advanced 3D mathematical surface visualization with interactive controls
 */

import { evaluate } from 'mathjs';

export interface Surface3DData {
  x: number[];
  y: number[];
  z: number[][];
  function: string;
  domain: { x: [number, number]; y: [number, number] };
  range: [number, number];
  criticalPoints: CriticalPoint3D[];
  gradients: GradientField[];
  levelCurves: LevelCurve[];
  analysis: SurfaceAnalysis;
}

export interface CriticalPoint3D {
  x: number;
  y: number;
  z: number;
  type: 'local_min' | 'local_max' | 'saddle_point' | 'global_min' | 'global_max';
  hessianDeterminant: number;
  description: string;
}

export interface GradientField {
  x: number;
  y: number;
  gradX: number;
  gradY: number;
  magnitude: number;
}

export interface LevelCurve {
  level: number;
  points: { x: number; y: number }[];
  color: string;
}

export interface SurfaceAnalysis {
  volume: number;
  surfaceArea: number;
  averageValue: number;
  extrema: {
    globalMin: { x: number; y: number; z: number };
    globalMax: { x: number; y: number; z: number };
  };
  curvature: {
    meanCurvature: number;
    gaussianCurvature: number;
  };
  symmetries: string[];
}

export interface Plot3DOptions {
  xDomain: [number, number];
  yDomain: [number, number];
  resolution: number;
  showGradients: boolean;
  showLevelCurves: boolean;
  showCriticalPoints: boolean;
  showNormalVectors: boolean;
  showTangentPlanes: boolean;
  showCurvatureAnalysis: boolean;
  numLevelCurves: number;
  wireframe: boolean;
  lighting: boolean;
  colorScheme: 'viridis' | 'plasma' | 'rainbow' | 'grayscale' | 'magma' | 'inferno' | 'turbo';
  surfaceTransparency: number;
  animationSpeed: number;
  qualityLevel: 'low' | 'medium' | 'high' | 'ultra';
  mathematicalPrecision: number;
}

export class Visualization3DEngine {
  private static readonly DEFAULT_OPTIONS: Plot3DOptions = {
    xDomain: [-5, 5],
    yDomain: [-5, 5],
    resolution: 50,
    showGradients: true,
    showLevelCurves: true,
    showCriticalPoints: true,
    showNormalVectors: false,
    showTangentPlanes: false,
    showCurvatureAnalysis: false,
    numLevelCurves: 10,
    wireframe: false,
    lighting: true,
    colorScheme: 'viridis',
    surfaceTransparency: 0.8,
    animationSpeed: 1.0,
    qualityLevel: 'high',
    mathematicalPrecision: 6
  };

  /**
   * Generate comprehensive 3D surface data with mathematical analysis
   */
  static generateSurface(expression: string, options: Partial<Plot3DOptions> = {}): Surface3DData {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    
    // Generate surface data
    const { x, y, z } = this.generateSurfacePoints(expression, opts);
    
    // Calculate range
    const flatZ = z.flat().filter(val => isFinite(val));
    const range: [number, number] = flatZ.length > 0 ? 
      [Math.min(...flatZ), Math.max(...flatZ)] : [-10, 10];

    // Advanced mathematical analysis
    const criticalPoints = this.findCriticalPoints3D(expression, opts);
    const gradients = this.calculateGradientField(expression, opts);
    const levelCurves = this.generateLevelCurves(expression, opts, range);
    const analysis = this.analyzeSurface(x, y, z, opts);

    return {
      x,
      y,
      z,
      function: expression,
      domain: { x: opts.xDomain, y: opts.yDomain },
      range,
      criticalPoints,
      gradients,
      levelCurves,
      analysis
    };
  }

  /**
   * Generate 3D surface points
   */
  private static generateSurfacePoints(
    expression: string,
    options: Plot3DOptions
  ): { x: number[]; y: number[]; z: number[][] } {
    const [xMin, xMax] = options.xDomain;
    const [yMin, yMax] = options.yDomain;
    const resolution = options.resolution;

    const xStep = (xMax - xMin) / (resolution - 1);
    const yStep = (yMax - yMin) / (resolution - 1);

    const x: number[] = [];
    const y: number[] = [];
    const z: number[][] = [];

    // Generate x and y arrays
    for (let i = 0; i < resolution; i++) {
      x.push(xMin + i * xStep);
      y.push(yMin + i * yStep);
    }

    // Generate z values
    for (let i = 0; i < resolution; i++) {
      const zRow: number[] = [];
      const yVal = y[i];

      for (let j = 0; j < resolution; j++) {
        const xVal = x[j];

        try {
          const zVal = this.evaluateAt3D(expression, xVal, yVal);
          zRow.push(isFinite(zVal) ? zVal : NaN);
        } catch (error) {
          zRow.push(NaN);
        }
      }
      z.push(zRow);
    }

    return { x, y, z };
  }

  /**
   * Find critical points using gradient analysis
   */
  private static findCriticalPoints3D(
    expression: string,
    options: Plot3DOptions
  ): CriticalPoint3D[] {
    const criticalPoints: CriticalPoint3D[] = [];
    const [xMin, xMax] = options.xDomain;
    const [yMin, yMax] = options.yDomain;
    const step = Math.min((xMax - xMin), (yMax - yMin)) / 50;
    const h = 1e-6;

    for (let x = xMin; x <= xMax; x += step) {
      for (let y = yMin; y <= yMax; y += step) {
        try {
          // Calculate partial derivatives numerically
          const { gradX, gradY } = this.calculatePartialDerivatives(expression, x, y, h);
          
          // Critical point if both partial derivatives ≈ 0
          if (Math.abs(gradX) < 0.01 && Math.abs(gradY) < 0.01) {
            const z = this.evaluateAt3D(expression, x, y);
            
            if (isFinite(z)) {
              // Calculate Hessian matrix for classification
              const hessian = this.calculateHessianMatrix(expression, x, y, h);
              const det = hessian.fxx * hessian.fyy - hessian.fxy * hessian.fxy;
              
              let type: CriticalPoint3D['type'] = 'saddle_point';
              let description = 'Saddle point';
              
              if (det > 0) {
                if (hessian.fxx > 0) {
                  type = 'local_min';
                  description = 'Local minimum';
                } else {
                  type = 'local_max';
                  description = 'Local maximum';
                }
              }
              
              criticalPoints.push({
                x: Number(x.toFixed(4)),
                y: Number(y.toFixed(4)),
                z: Number(z.toFixed(4)),
                type,
                hessianDeterminant: det,
                description: `${description} at (${x.toFixed(2)}, ${y.toFixed(2)})`
              });
            }
          }
        } catch (error) {
          // Skip this point if evaluation fails
        }
      }
    }

    return criticalPoints;
  }

  /**
   * Calculate gradient field
   */
  private static calculateGradientField(
    expression: string,
    options: Plot3DOptions
  ): GradientField[] {
    const gradients: GradientField[] = [];
    const [xMin, xMax] = options.xDomain;
    const [yMin, yMax] = options.yDomain;
    const step = Math.min((xMax - xMin), (yMax - yMin)) / 20;
    const h = 1e-5;

    for (let x = xMin; x <= xMax; x += step) {
      for (let y = yMin; y <= yMax; y += step) {
        try {
          const { gradX, gradY } = this.calculatePartialDerivatives(expression, x, y, h);
          const magnitude = Math.sqrt(gradX * gradX + gradY * gradY);
          
          if (isFinite(magnitude)) {
            gradients.push({
              x: Number(x.toFixed(3)),
              y: Number(y.toFixed(3)),
              gradX: Number(gradX.toFixed(4)),
              gradY: Number(gradY.toFixed(4)),
              magnitude: Number(magnitude.toFixed(4))
            });
          }
        } catch (error) {
          // Skip this point
        }
      }
    }

    return gradients;
  }

  /**
   * Generate level curves
   */
  private static generateLevelCurves(
    expression: string,
    options: Plot3DOptions,
    range: [number, number]
  ): LevelCurve[] {
    const curves: LevelCurve[] = [];
    const [zMin, zMax] = range;
    const numCurves = options.numLevelCurves;
    const colors = this.generateColorScale(numCurves, options.colorScheme);

    for (let i = 0; i < numCurves; i++) {
      const level = zMin + (i / (numCurves - 1)) * (zMax - zMin);
      const points = this.findLevelCurvePoints(expression, level, options);
      
      if (points.length > 0) {
        curves.push({
          level: Number(level.toFixed(3)),
          points,
          color: colors[i]
        });
      }
    }

    return curves;
  }

  /**
   * Analyze surface properties
   */
  private static analyzeSurface(
    x: number[],
    y: number[],
    z: number[][],
    options: Plot3DOptions
  ): SurfaceAnalysis {
    const flatZ = z.flat().filter(val => isFinite(val));
    
    // Find extrema
    let globalMin = { x: 0, y: 0, z: Infinity };
    let globalMax = { x: 0, y: 0, z: -Infinity };
    let sum = 0;
    let count = 0;

    for (let i = 0; i < z.length; i++) {
      for (let j = 0; j < z[i].length; j++) {
        const zVal = z[i][j];
        if (isFinite(zVal)) {
          sum += zVal;
          count++;
          
          if (zVal < globalMin.z) {
            globalMin = { x: x[j], y: y[i], z: zVal };
          }
          if (zVal > globalMax.z) {
            globalMax = { x: x[j], y: y[i], z: zVal };
          }
        }
      }
    }

    const averageValue = count > 0 ? sum / count : 0;

    // Approximate volume using trapezoidal rule
    const dx = (options.xDomain[1] - options.xDomain[0]) / (x.length - 1);
    const dy = (options.yDomain[1] - options.yDomain[0]) / (y.length - 1);
    const volume = sum * dx * dy;

    // Approximate surface area
    let surfaceArea = 0;
    for (let i = 0; i < z.length - 1; i++) {
      for (let j = 0; j < z[i].length - 1; j++) {
        if (isFinite(z[i][j]) && isFinite(z[i+1][j]) && isFinite(z[i][j+1])) {
          const area = this.calculateTriangleArea(
            [x[j], y[i], z[i][j]],
            [x[j+1], y[i], z[i][j+1]],
            [x[j], y[i+1], z[i+1][j]]
          );
          surfaceArea += area;
        }
      }
    }

    // Detect symmetries
    const symmetries: string[] = [];
    if (this.checkSymmetry(z, 'x')) symmetries.push('x-axis symmetry');
    if (this.checkSymmetry(z, 'y')) symmetries.push('y-axis symmetry');
    if (this.checkSymmetry(z, 'origin')) symmetries.push('origin symmetry');

    return {
      volume: Number(volume.toFixed(4)),
      surfaceArea: Number(surfaceArea.toFixed(4)),
      averageValue: Number(averageValue.toFixed(4)),
      extrema: {
        globalMin: {
          x: Number(globalMin.x.toFixed(4)),
          y: Number(globalMin.y.toFixed(4)),
          z: Number(globalMin.z.toFixed(4))
        },
        globalMax: {
          x: Number(globalMax.x.toFixed(4)),
          y: Number(globalMax.y.toFixed(4)),
          z: Number(globalMax.z.toFixed(4))
        }
      },
      curvature: {
        meanCurvature: 0, // Simplified
        gaussianCurvature: 0 // Simplified
      },
      symmetries
    };
  }

  /**
   * Evaluate 3D function at specific x, y coordinates
   */
  private static evaluateAt3D(expression: string, x: number, y: number): number {
    let evalExpression = expression
      .replace(/\bx\b/g, `(${x})`)
      .replace(/\by\b/g, `(${y})`);
    
    return evaluate(evalExpression);
  }

  /**
   * Calculate partial derivatives numerically
   */
  private static calculatePartialDerivatives(
    expression: string,
    x: number,
    y: number,
    h: number
  ): { gradX: number; gradY: number } {
    const fxPlus = this.evaluateAt3D(expression, x + h, y);
    const fxMinus = this.evaluateAt3D(expression, x - h, y);
    const fyPlus = this.evaluateAt3D(expression, x, y + h);
    const fyMinus = this.evaluateAt3D(expression, x, y - h);

    const gradX = (fxPlus - fxMinus) / (2 * h);
    const gradY = (fyPlus - fyMinus) / (2 * h);

    return { gradX, gradY };
  }

  /**
   * Calculate Hessian matrix
   */
  private static calculateHessianMatrix(
    expression: string,
    x: number,
    y: number,
    h: number
  ): { fxx: number; fyy: number; fxy: number } {
    const f = this.evaluateAt3D(expression, x, y);
    const fxPlus = this.evaluateAt3D(expression, x + h, y);
    const fxMinus = this.evaluateAt3D(expression, x - h, y);
    const fyPlus = this.evaluateAt3D(expression, x, y + h);
    const fyMinus = this.evaluateAt3D(expression, x, y - h);
    const fxyPlus = this.evaluateAt3D(expression, x + h, y + h);
    const fxyMinus = this.evaluateAt3D(expression, x - h, y - h);

    const fxx = (fxPlus - 2 * f + fxMinus) / (h * h);
    const fyy = (fyPlus - 2 * f + fyMinus) / (h * h);
    const fxy = (fxyPlus - this.evaluateAt3D(expression, x + h, y - h) - 
                this.evaluateAt3D(expression, x - h, y + h) + fxyMinus) / (4 * h * h);

    return { fxx, fyy, fxy };
  }

  /**
   * Find level curve points
   */
  private static findLevelCurvePoints(
    expression: string,
    level: number,
    options: Plot3DOptions
  ): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [];
    const [xMin, xMax] = options.xDomain;
    const [yMin, yMax] = options.yDomain;
    const step = Math.min((xMax - xMin), (yMax - yMin)) / 100;

    for (let x = xMin; x <= xMax; x += step) {
      for (let y = yMin; y <= yMax; y += step) {
        try {
          const z = this.evaluateAt3D(expression, x, y);
          if (Math.abs(z - level) < 0.1) {
            points.push({ x: Number(x.toFixed(3)), y: Number(y.toFixed(3)) });
          }
        } catch (error) {
          // Skip this point
        }
      }
    }

    return points;
  }

  /**
   * Generate color scale
   */
  private static generateColorScale(numColors: number, scheme: string): string[] {
    const colors: string[] = [];
    
    for (let i = 0; i < numColors; i++) {
      const t = i / (numColors - 1);
      
      switch (scheme) {
        case 'viridis':
          colors.push(this.viridisColor(t));
          break;
        case 'plasma':
          colors.push(this.plasmaColor(t));
          break;
        case 'rainbow':
          colors.push(this.rainbowColor(t));
          break;
        default:
          colors.push(this.viridisColor(t));
      }
    }
    
    return colors;
  }

  /**
   * Viridis color scheme
   */
  private static viridisColor(t: number): string {
    const r = Math.round(255 * (0.267 + 0.005 * t + 0.322 * t * t));
    const g = Math.round(255 * (0.004 + 0.873 * t - 0.334 * t * t));
    const b = Math.round(255 * (0.329 + 0.184 * t + 0.623 * t * t));
    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * Plasma color scheme
   */
  private static plasmaColor(t: number): string {
    const r = Math.round(255 * (0.063 + 0.907 * t + 0.259 * t * t));
    const g = Math.round(255 * (0.008 + 0.718 * t - 0.333 * t * t));
    const b = Math.round(255 * (0.847 - 0.127 * t - 0.415 * t * t));
    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * Rainbow color scheme
   */
  private static rainbowColor(t: number): string {
    const hue = t * 360;
    const saturation = 100;
    const lightness = 50;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  /**
   * Calculate triangle area
   */
  private static calculateTriangleArea(
    p1: [number, number, number],
    p2: [number, number, number],
    p3: [number, number, number]
  ): number {
    const v1 = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
    const v2 = [p3[0] - p1[0], p3[1] - p1[1], p3[2] - p1[2]];
    
    const cross = [
      v1[1] * v2[2] - v1[2] * v2[1],
      v1[2] * v2[0] - v1[0] * v2[2],
      v1[0] * v2[1] - v1[1] * v2[0]
    ];
    
    const magnitude = Math.sqrt(cross[0] * cross[0] + cross[1] * cross[1] + cross[2] * cross[2]);
    return 0.5 * magnitude;
  }

  /**
   * Check for symmetries
   */
  private static checkSymmetry(z: number[][], type: string): boolean {
    const rows = z.length;
    const cols = z[0].length;
    
    switch (type) {
      case 'x':
        // Check if f(x,y) = f(x,-y)
        for (let i = 0; i < Math.floor(rows / 2); i++) {
          for (let j = 0; j < cols; j++) {
            if (Math.abs(z[i][j] - z[rows - 1 - i][j]) > 0.01) {
              return false;
            }
          }
        }
        return true;
        
      case 'y':
        // Check if f(x,y) = f(-x,y)
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < Math.floor(cols / 2); j++) {
            if (Math.abs(z[i][j] - z[i][cols - 1 - j]) > 0.01) {
              return false;
            }
          }
        }
        return true;
        
      case 'origin':
        // Check if f(x,y) = f(-x,-y)
        for (let i = 0; i < Math.floor(rows / 2); i++) {
          for (let j = 0; j < Math.floor(cols / 2); j++) {
            if (Math.abs(z[i][j] - z[rows - 1 - i][cols - 1 - j]) > 0.01) {
              return false;
            }
          }
        }
        return true;
        
      default:
        return false;
    }
  }

  /**
   * Generate parametric surface
   */
  static generateParametricSurface(
    xFunc: string,
    yFunc: string,
    zFunc: string,
    uDomain: [number, number],
    vDomain: [number, number],
    resolution: number = 50
  ): { x: number[][]; y: number[][]; z: number[][] } {
    const [uMin, uMax] = uDomain;
    const [vMin, vMax] = vDomain;
    const uStep = (uMax - uMin) / (resolution - 1);
    const vStep = (vMax - vMin) / (resolution - 1);

    const x: number[][] = [];
    const y: number[][] = [];
    const z: number[][] = [];

    for (let i = 0; i < resolution; i++) {
      const xRow: number[] = [];
      const yRow: number[] = [];
      const zRow: number[] = [];
      const u = uMin + i * uStep;

      for (let j = 0; j < resolution; j++) {
        const v = vMin + j * vStep;

        try {
          const xVal = this.evaluateParametric(xFunc, u, v);
          const yVal = this.evaluateParametric(yFunc, u, v);
          const zVal = this.evaluateParametric(zFunc, u, v);

          xRow.push(isFinite(xVal) ? xVal : NaN);
          yRow.push(isFinite(yVal) ? yVal : NaN);
          zRow.push(isFinite(zVal) ? zVal : NaN);
        } catch (error) {
          xRow.push(NaN);
          yRow.push(NaN);
          zRow.push(NaN);
        }
      }

      x.push(xRow);
      y.push(yRow);
      z.push(zRow);
    }

    return { x, y, z };
  }

  /**
   * Evaluate parametric function
   */
  private static evaluateParametric(expression: string, u: number, v: number): number {
    let evalExpression = expression
      .replace(/\bu\b/g, `(${u})`)
      .replace(/\bv\b/g, `(${v})`);
    
    return evaluate(evalExpression);
  }
}