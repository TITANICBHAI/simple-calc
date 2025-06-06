/**
 * Interactive Real-time Graphing Engine
 * Advanced mathematical visualization with real-time updates
 */

import { evaluate } from 'mathjs';

export interface GraphData {
  x: number[];
  y: number[];
  function: string;
  domain: [number, number];
  range: [number, number];
  critical_points: CriticalPoint[];
  asymptotes: Asymptote[];
  zeros: number[];
  extrema: Extremum[];
  derivative?: GraphData;
  integral?: GraphData;
}

export interface CriticalPoint {
  x: number;
  y: number;
  type: 'minimum' | 'maximum' | 'inflection' | 'discontinuity';
  description: string;
}

export interface Asymptote {
  type: 'vertical' | 'horizontal' | 'oblique';
  equation: string;
  value: number | null;
}

export interface Extremum {
  x: number;
  y: number;
  type: 'local_min' | 'local_max' | 'global_min' | 'global_max';
  description: string;
}

export interface GraphOptions {
  domain: [number, number];
  range: [number, number];
  resolution: number;
  showGrid: boolean;
  showAxis: boolean;
  showCriticalPoints: boolean;
  showAsymptotes: boolean;
  showDerivative: boolean;
  showIntegral: boolean;
  animate: boolean;
  realTimeUpdate: boolean;
  color: string;
  lineWidth: number;
}

export class InteractiveGraphingEngine {
  private static readonly DEFAULT_OPTIONS: GraphOptions = {
    domain: [-10, 10],
    range: [-10, 10],
    resolution: 1000,
    showGrid: true,
    showAxis: true,
    showCriticalPoints: true,
    showAsymptotes: true,
    showDerivative: false,
    showIntegral: false,
    animate: false,
    realTimeUpdate: true,
    color: '#3b82f6',
    lineWidth: 2
  };

  /**
   * Generate comprehensive graph data with mathematical analysis
   */
  static generateGraphData(expression: string, options: Partial<GraphOptions> = {}): GraphData {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    
    // Generate data points
    const { x, y } = this.generateDataPoints(expression, opts);
    
    // Mathematical analysis
    const criticalPoints = this.findCriticalPoints(expression, opts.domain);
    const asymptotes = this.findAsymptotes(expression, opts.domain);
    const zeros = this.findZeros(expression, opts.domain);
    const extrema = this.findExtrema(expression, opts.domain);

    // Calculate actual range from data
    const validY = y.filter(val => isFinite(val));
    const actualRange: [number, number] = validY.length > 0 ? 
      [Math.min(...validY), Math.max(...validY)] : [-10, 10];

    const graphData: GraphData = {
      x,
      y,
      function: expression,
      domain: opts.domain,
      range: actualRange,
      critical_points: criticalPoints,
      asymptotes,
      zeros,
      extrema
    };

    // Add derivative if requested
    if (opts.showDerivative) {
      try {
        const derivativeExpr = this.calculateDerivative(expression);
        graphData.derivative = this.generateGraphData(derivativeExpr, {
          ...opts,
          showDerivative: false,
          showIntegral: false,
          color: '#ef4444'
        });
      } catch (error) {
        console.warn('Could not calculate derivative:', error);
      }
    }

    return graphData;
  }

  /**
   * Generate data points for plotting
   */
  private static generateDataPoints(
    expression: string, 
    options: GraphOptions
  ): { x: number[]; y: number[] } {
    const x: number[] = [];
    const y: number[] = [];
    
    const [xMin, xMax] = options.domain;
    const step = (xMax - xMin) / options.resolution;

    for (let i = 0; i <= options.resolution; i++) {
      const xVal = xMin + i * step;
      x.push(xVal);

      try {
        // Replace x with actual value in expression
        const evalExpression = expression.replace(/\bx\b/g, `(${xVal})`);
        const yVal = evaluate(evalExpression);
        
        // Handle special values
        if (typeof yVal === 'number' && isFinite(yVal)) {
          y.push(yVal);
        } else {
          y.push(NaN);
        }
      } catch (error) {
        y.push(NaN);
      }
    }

    return { x, y };
  }

  /**
   * Find critical points using numerical methods
   */
  private static findCriticalPoints(
    expression: string, 
    domain: [number, number]
  ): CriticalPoint[] {
    const criticalPoints: CriticalPoint[] = [];
    
    // Simple numerical derivative to find critical points
    const h = 1e-6;
    const [xMin, xMax] = domain;
    const step = (xMax - xMin) / 1000;

    for (let x = xMin + step; x < xMax - step; x += step) {
      try {
        // Calculate numerical derivative
        const yPlus = this.evaluateAt(expression, x + h);
        const yMinus = this.evaluateAt(expression, x - h);
        
        if (!isFinite(yPlus) || !isFinite(yMinus)) continue;
        
        const derivative = (yPlus - yMinus) / (2 * h);

        // Critical point if derivative ≈ 0
        if (Math.abs(derivative) < 1e-3) {
          const y = this.evaluateAt(expression, x);
          
          if (isFinite(y)) {
            // Determine type using second derivative
            const secondDerivative = this.calculateSecondDerivative(expression, x, h);
            
            let type: CriticalPoint['type'] = 'inflection';
            let description = 'Critical point';
            
            if (secondDerivative > 0.01) {
              type = 'minimum';
              description = 'Local minimum';
            } else if (secondDerivative < -0.01) {
              type = 'maximum';
              description = 'Local maximum';
            }
            
            criticalPoints.push({
              x: Number(x.toFixed(4)),
              y: Number(y.toFixed(4)),
              type,
              description: `${description} at x = ${x.toFixed(4)}`
            });
          }
        }
      } catch (error) {
        // Skip this point if evaluation fails
      }
    }

    return criticalPoints;
  }

  /**
   * Find asymptotes
   */
  private static findAsymptotes(
    expression: string,
    domain: [number, number]
  ): Asymptote[] {
    const asymptotes: Asymptote[] = [];
    const [xMin, xMax] = domain;
    const step = (xMax - xMin) / 500;

    // Look for vertical asymptotes (points where function goes to infinity)
    for (let x = xMin; x <= xMax; x += step) {
      try {
        const y = this.evaluateAt(expression, x);
        const yNext = this.evaluateAt(expression, x + step);
        
        if (Math.abs(y) > 1000 || Math.abs(yNext) > 1000) {
          if (Math.sign(y) !== Math.sign(yNext)) {
            asymptotes.push({
              type: 'vertical',
              equation: `x = ${x.toFixed(2)}`,
              value: x
            });
          }
        }
      } catch (error) {
        // Potential asymptote location
      }
    }

    // Look for horizontal asymptotes
    try {
      const leftLimit = this.evaluateAt(expression, xMin);
      const rightLimit = this.evaluateAt(expression, xMax);
      
      if (Math.abs(leftLimit - rightLimit) < 1e-3 && isFinite(leftLimit)) {
        asymptotes.push({
          type: 'horizontal',
          equation: `y = ${leftLimit.toFixed(2)}`,
          value: leftLimit
        });
      }
    } catch (error) {
      // No horizontal asymptote found
    }

    return asymptotes;
  }

  /**
   * Find zeros (x-intercepts)
   */
  private static findZeros(
    expression: string,
    domain: [number, number]
  ): number[] {
    const zeros: number[] = [];
    const [xMin, xMax] = domain;
    const step = (xMax - xMin) / 1000;

    for (let x = xMin; x < xMax; x += step) {
      try {
        const y1 = this.evaluateAt(expression, x);
        const y2 = this.evaluateAt(expression, x + step);
        
        if (isFinite(y1) && isFinite(y2)) {
          // Zero crossing detection
          if (Math.sign(y1) !== Math.sign(y2) || Math.abs(y1) < 1e-6) {
            // Use bisection method for more accurate zero
            const zero = this.bisectionMethod(expression, x, x + step);
            if (zero !== null) {
              zeros.push(Number(zero.toFixed(4)));
            }
          }
        }
      } catch (error) {
        // Skip this interval
      }
    }

    return zeros;
  }

  /**
   * Find extrema (global min/max)
   */
  private static findExtrema(
    expression: string,
    domain: [number, number]
  ): Extremum[] {
    const extrema: Extremum[] = [];
    const [xMin, xMax] = domain;
    const step = (xMax - xMin) / 1000;

    let globalMin = { x: 0, y: Infinity };
    let globalMax = { x: 0, y: -Infinity };

    for (let x = xMin; x <= xMax; x += step) {
      try {
        const y = this.evaluateAt(expression, x);
        
        if (isFinite(y)) {
          if (y < globalMin.y) {
            globalMin = { x, y };
          }
          if (y > globalMax.y) {
            globalMax = { x, y };
          }
        }
      } catch (error) {
        // Skip this point
      }
    }

    if (isFinite(globalMin.y)) {
      extrema.push({
        x: Number(globalMin.x.toFixed(4)),
        y: Number(globalMin.y.toFixed(4)),
        type: 'global_min',
        description: `Global minimum at x = ${globalMin.x.toFixed(4)}`
      });
    }

    if (isFinite(globalMax.y)) {
      extrema.push({
        x: Number(globalMax.x.toFixed(4)),
        y: Number(globalMax.y.toFixed(4)),
        type: 'global_max',
        description: `Global maximum at x = ${globalMax.x.toFixed(4)}`
      });
    }

    return extrema;
  }

  /**
   * Evaluate expression at a specific x value
   */
  private static evaluateAt(expression: string, x: number): number {
    const evalExpression = expression.replace(/\bx\b/g, `(${x})`);
    return evaluate(evalExpression);
  }

  /**
   * Calculate second derivative numerically
   */
  private static calculateSecondDerivative(expression: string, x: number, h: number): number {
    const yPlus = this.evaluateAt(expression, x + h);
    const yCurrent = this.evaluateAt(expression, x);
    const yMinus = this.evaluateAt(expression, x - h);
    
    return (yPlus - 2 * yCurrent + yMinus) / (h * h);
  }

  /**
   * Bisection method for finding zeros
   */
  private static bisectionMethod(
    expression: string, 
    a: number, 
    b: number, 
    tolerance: number = 1e-6
  ): number | null {
    let fa = this.evaluateAt(expression, a);
    let fb = this.evaluateAt(expression, b);
    
    if (Math.sign(fa) === Math.sign(fb)) return null;
    
    for (let i = 0; i < 50; i++) {
      const c = (a + b) / 2;
      const fc = this.evaluateAt(expression, c);
      
      if (Math.abs(fc) < tolerance || Math.abs(b - a) < tolerance) {
        return c;
      }
      
      if (Math.sign(fc) === Math.sign(fa)) {
        a = c;
        fa = fc;
      } else {
        b = c;
        fb = fc;
      }
    }
    
    return (a + b) / 2;
  }

  /**
   * Calculate symbolic derivative (simplified)
   */
  private static calculateDerivative(expression: string): string {
    // Simple derivative rules for common functions
    const derivativeRules: [RegExp, string][] = [
      [/x\^(\d+)/g, (match, power) => {
        const p = parseInt(power);
        if (p === 1) return '1';
        if (p === 2) return '2*x';
        return `${p}*x^${p-1}`;
      }],
      [/sin\(x\)/g, 'cos(x)'],
      [/cos\(x\)/g, '-sin(x)'],
      [/tan\(x\)/g, 'sec(x)^2'],
      [/exp\(x\)/g, 'exp(x)'],
      [/ln\(x\)/g, '1/x'],
      [/log\(x\)/g, '1/(x*ln(10))'],
      [/sqrt\(x\)/g, '1/(2*sqrt(x))'],
      [/(\d+)\*x/g, '$1'], // constant * x -> constant
      [/x/g, '1'], // x -> 1
      [/(\d+)/g, '0'] // constant -> 0
    ];

    let derivative = expression;
    
    for (const [pattern, replacement] of derivativeRules) {
      if (typeof replacement === 'string') {
        derivative = derivative.replace(pattern, replacement);
      } else {
        derivative = derivative.replace(pattern, replacement as any);
      }
    }

    return derivative;
  }

  /**
   * Generate multiple function graphs for comparison
   */
  static generateMultipleGraphs(
    expressions: string[], 
    options: Partial<GraphOptions> = {}
  ): GraphData[] {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    
    return expressions.map((expr, index) => 
      this.generateGraphData(expr, {
        ...options,
        color: colors[index % colors.length]
      })
    );
  }

  /**
   * Animate parameter changes in real-time
   */
  static generateAnimatedGraph(
    expressionTemplate: string,
    parameter: string,
    parameterRange: [number, number],
    steps: number,
    options: Partial<GraphOptions> = {}
  ): GraphData[] {
    const [min, max] = parameterRange;
    const stepSize = (max - min) / (steps - 1);
    const frames: GraphData[] = [];

    for (let i = 0; i < steps; i++) {
      const paramValue = min + i * stepSize;
      const expression = expressionTemplate.replace(
        new RegExp(`\\b${parameter}\\b`, 'g'), 
        paramValue.toString()
      );
      
      frames.push(this.generateGraphData(expression, options));
    }

    return frames;
  }
}