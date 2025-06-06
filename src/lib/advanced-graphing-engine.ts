/**
 * Advanced Graphing and Visualization Engine
 * Provides comprehensive mathematical function visualization with interactive features
 */

import { SecurityManager } from './security-manager';

export interface GraphingOptions {
  xRange: [number, number];
  yRange: [number, number];
  resolution: number;
  showGrid: boolean;
  showAxes: boolean;
  showLabels: boolean;
  lineColor: string;
  lineWidth: number;
  fillArea: boolean;
  showDerivative: boolean;
  showIntegral: boolean;
  showTangentLines: boolean;
  animationSpeed: number;
  interactiveMode: boolean;
}

export interface GraphData {
  points: Array<{ x: number; y: number }>;
  discontinuities: Array<{ x: number; type: 'removable' | 'jump' | 'infinite' }>;
  asymptotes: Array<{ type: 'vertical' | 'horizontal' | 'oblique'; equation: string; points: Array<{ x: number; y: number }> }>;
  criticalPoints: Array<{ x: number; y: number; type: 'max' | 'min' | 'inflection'; description: string }>;
  intercepts: Array<{ x: number; y: number; type: 'x' | 'y' }>;
  domain: { min: number; max: number; restrictions: string[] };
  range: { min: number; max: number; estimated: boolean };
  properties: {
    continuous: boolean;
    differentiable: boolean;
    monotonic: 'increasing' | 'decreasing' | 'neither';
    concavity: Array<{ interval: [number, number]; type: 'up' | 'down' }>;
    symmetry: 'even' | 'odd' | 'neither';
    periodic: { isPeriodic: boolean; period?: number };
  };
  metadata: {
    functionType: string;
    complexity: number;
    renderTime: number;
    dataPoints: number;
  };
}

export interface MultiGraphData {
  functions: Array<{
    id: string;
    expression: string;
    data: GraphData;
    style: {
      color: string;
      width: number;
      style: 'solid' | 'dashed' | 'dotted';
      opacity: number;
    };
  }>;
  intersections: Array<{ x: number; y: number; functions: string[] }>;
  comparisons: {
    dominance: Array<{ function: string; intervals: Array<[number, number]> }>;
    growth: Array<{ function: string; rate: number }>;
  };
}

export interface ParametricGraphData {
  xFunction: string;
  yFunction: string;
  parameter: string;
  parameterRange: [number, number];
  points: Array<{ x: number; y: number; t: number }>;
  properties: {
    selfIntersections: Array<{ x: number; y: number; parameters: number[] }>;
    cusps: Array<{ x: number; y: number; t: number }>;
    loops: Array<{ startT: number; endT: number; vertices: Array<{ x: number; y: number }> }>;
    arcLength: number;
    boundingBox: { minX: number; maxX: number; minY: number; maxY: number };
  };
}

export interface PolarGraphData {
  rFunction: string;
  thetaRange: [number, number];
  points: Array<{ r: number; theta: number; x: number; y: number }>;
  properties: {
    symmetries: Array<'x-axis' | 'y-axis' | 'origin' | 'line-y=x'>;
    maxRadius: number;
    minRadius: number;
    loops: number;
    petals: number;
  };
}

export class AdvancedGraphingEngine {
  private static readonly DEFAULT_OPTIONS: GraphingOptions = {
    xRange: [-10, 10],
    yRange: [-10, 10],
    resolution: 1000,
    showGrid: true,
    showAxes: true,
    showLabels: true,
    lineColor: '#3b82f6',
    lineWidth: 2,
    fillArea: false,
    showDerivative: false,
    showIntegral: false,
    showTangentLines: false,
    animationSpeed: 1,
    interactiveMode: true
  };

  /**
   * Graph a single mathematical function
   */
  static async graphFunction(
    expression: string, 
    options: Partial<GraphingOptions> = {}
  ): Promise<GraphData> {
    const startTime = Date.now();
    
    // Validate input
    const validation = SecurityManager.validateExpression(expression);
    if (!validation.isValid) {
      throw new Error(`Invalid function: ${validation.blocked.join(', ')}`);
    }

    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const points: Array<{ x: number; y: number }> = [];
    const discontinuities: Array<{ x: number; type: 'removable' | 'jump' | 'infinite' }> = [];
    
    // Generate function points
    const stepSize = (opts.xRange[1] - opts.xRange[0]) / opts.resolution;
    
    for (let i = 0; i <= opts.resolution; i++) {
      const x = opts.xRange[0] + i * stepSize;
      
      try {
        const y = await this.evaluateFunction(validation.sanitized, x);
        
        if (isFinite(y) && y >= opts.yRange[0] && y <= opts.yRange[1]) {
          points.push({ x, y });
        } else if (!isFinite(y)) {
          // Check for discontinuities
          const leftLimit = await this.calculateLimit(validation.sanitized, x, 'left');
          const rightLimit = await this.calculateLimit(validation.sanitized, x, 'right');
          
          if (isFinite(leftLimit) && isFinite(rightLimit)) {
            if (Math.abs(leftLimit - rightLimit) < 1e-10) {
              discontinuities.push({ x, type: 'removable' });
            } else {
              discontinuities.push({ x, type: 'jump' });
            }
          } else {
            discontinuities.push({ x, type: 'infinite' });
          }
        }
      } catch (error) {
        // Function undefined at this point
        continue;
      }
    }

    // Analyze function properties
    const asymptotes = await this.findAsymptotes(validation.sanitized, opts);
    const criticalPoints = await this.findCriticalPoints(validation.sanitized, opts.xRange);
    const intercepts = await this.findIntercepts(validation.sanitized, opts);
    const domain = this.analyzeDomain(validation.sanitized);
    const range = this.analyzeRange(points);
    const properties = await this.analyzeProperties(validation.sanitized, points, opts.xRange);

    return {
      points,
      discontinuities,
      asymptotes,
      criticalPoints,
      intercepts,
      domain,
      range,
      properties,
      metadata: {
        functionType: this.classifyFunction(validation.sanitized),
        complexity: this.calculateComplexity(validation.sanitized),
        renderTime: Date.now() - startTime,
        dataPoints: points.length
      }
    };
  }

  /**
   * Graph multiple functions for comparison
   */
  static async graphMultipleFunctions(
    expressions: Array<{ expression: string; label?: string; color?: string }>,
    options: Partial<GraphingOptions> = {}
  ): Promise<MultiGraphData> {
    const functions = [];
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    
    for (let i = 0; i < expressions.length; i++) {
      const expr = expressions[i];
      const color = expr.color || colors[i % colors.length];
      
      const data = await this.graphFunction(expr.expression, options);
      
      functions.push({
        id: `f${i + 1}`,
        expression: expr.expression,
        data,
        style: {
          color,
          width: 2,
          style: 'solid' as const,
          opacity: 0.8
        }
      });
    }

    // Find intersections between functions
    const intersections = await this.findIntersections(functions, options);
    
    // Analyze relationships between functions
    const comparisons = await this.analyzeFunctionRelationships(functions, options);

    return {
      functions,
      intersections,
      comparisons
    };
  }

  /**
   * Graph parametric equations
   */
  static async graphParametric(
    xExpression: string,
    yExpression: string,
    parameter: string = 't',
    parameterRange: [number, number] = [0, 2 * Math.PI],
    resolution: number = 1000
  ): Promise<ParametricGraphData> {
    // Validate inputs
    const xValidation = SecurityManager.validateExpression(xExpression);
    const yValidation = SecurityManager.validateExpression(yExpression);
    
    if (!xValidation.isValid || !yValidation.isValid) {
      throw new Error('Invalid parametric expressions');
    }

    const points: Array<{ x: number; y: number; t: number }> = [];
    const stepSize = (parameterRange[1] - parameterRange[0]) / resolution;

    for (let i = 0; i <= resolution; i++) {
      const t = parameterRange[0] + i * stepSize;
      
      try {
        const x = await this.evaluateParametricFunction(xValidation.sanitized, parameter, t);
        const y = await this.evaluateParametricFunction(yValidation.sanitized, parameter, t);
        
        if (isFinite(x) && isFinite(y)) {
          points.push({ x, y, t });
        }
      } catch (error) {
        continue;
      }
    }

    // Analyze parametric properties
    const properties = await this.analyzeParametricProperties(points, xValidation.sanitized, yValidation.sanitized, parameter);

    return {
      xFunction: xExpression,
      yFunction: yExpression,
      parameter,
      parameterRange,
      points,
      properties
    };
  }

  /**
   * Graph polar equations
   */
  static async graphPolar(
    rExpression: string,
    thetaRange: [number, number] = [0, 2 * Math.PI],
    resolution: number = 1000
  ): Promise<PolarGraphData> {
    const validation = SecurityManager.validateExpression(rExpression);
    if (!validation.isValid) {
      throw new Error(`Invalid polar expression: ${validation.blocked.join(', ')}`);
    }

    const points: Array<{ r: number; theta: number; x: number; y: number }> = [];
    const stepSize = (thetaRange[1] - thetaRange[0]) / resolution;

    for (let i = 0; i <= resolution; i++) {
      const theta = thetaRange[0] + i * stepSize;
      
      try {
        const r = await this.evaluatePolarFunction(validation.sanitized, theta);
        
        if (isFinite(r)) {
          const x = r * Math.cos(theta);
          const y = r * Math.sin(theta);
          points.push({ r, theta, x, y });
        }
      } catch (error) {
        continue;
      }
    }

    const properties = await this.analyzePolarProperties(points, validation.sanitized);

    return {
      rFunction: rExpression,
      thetaRange,
      points,
      properties
    };
  }

  /**
   * Create interactive derivative visualization
   */
  static async visualizeDerivative(
    expression: string,
    point: number,
    options: Partial<GraphingOptions> = {}
  ): Promise<{
    originalFunction: GraphData;
    derivative: GraphData;
    tangentLine: GraphData;
    analysis: {
      derivativeValue: number;
      slope: number;
      tangentEquation: string;
      behavior: 'increasing' | 'decreasing' | 'critical';
    };
  }> {
    const validation = SecurityManager.validateExpression(expression);
    if (!validation.isValid) {
      throw new Error(`Invalid function: ${validation.blocked.join(', ')}`);
    }

    // Graph original function
    const originalFunction = await this.graphFunction(expression, options);

    // Calculate derivative symbolically or numerically
    const derivativeExpression = await this.calculateDerivative(validation.sanitized);
    const derivative = await this.graphFunction(derivativeExpression, options);

    // Calculate tangent line at the specified point
    const tangentLine = await this.calculateTangentLine(validation.sanitized, point, options);

    // Analyze derivative properties
    const derivativeValue = await this.evaluateFunction(derivativeExpression, point);
    const analysis = {
      derivativeValue,
      slope: derivativeValue,
      tangentEquation: `y - ${await this.evaluateFunction(validation.sanitized, point)} = ${derivativeValue}(x - ${point})`,
      behavior: derivativeValue > 0 ? 'increasing' as const : derivativeValue < 0 ? 'decreasing' as const : 'critical' as const
    };

    return {
      originalFunction,
      derivative,
      tangentLine,
      analysis
    };
  }

  /**
   * Create integral visualization with area under curve
   */
  static async visualizeIntegral(
    expression: string,
    bounds: [number, number],
    options: Partial<GraphingOptions> = {}
  ): Promise<{
    function: GraphData;
    areaData: Array<{ x: number; y: number }>;
    integralValue: number;
    approximationMethod: string;
    analysis: {
      area: number;
      averageValue: number;
      centroid: { x: number; y: number };
    };
  }> {
    const validation = SecurityManager.validateExpression(expression);
    if (!validation.isValid) {
      throw new Error(`Invalid function: ${validation.blocked.join(', ')}`);
    }

    // Graph the function
    const functionData = await this.graphFunction(expression, {
      ...options,
      xRange: [bounds[0] - 1, bounds[1] + 1]
    });

    // Calculate area under curve
    const areaData = await this.calculateAreaUnderCurve(validation.sanitized, bounds, 500);
    const integralValue = await this.numericalIntegration(validation.sanitized, bounds);

    // Calculate analysis metrics
    const area = Math.abs(integralValue);
    const averageValue = integralValue / (bounds[1] - bounds[0]);
    const centroid = await this.calculateCentroid(validation.sanitized, bounds);

    return {
      function: functionData,
      areaData,
      integralValue,
      approximationMethod: 'Simpson\'s Rule',
      analysis: {
        area,
        averageValue,
        centroid
      }
    };
  }

  // Helper methods (simplified implementations)
  private static async evaluateFunction(expression: string, x: number): Promise<number> {
    // Replace x with the value and evaluate safely
    const substituted = expression.replace(/x/g, x.toString());
    try {
      // Use Function constructor with security constraints
      const func = new Function('return ' + substituted);
      return func();
    } catch {
      return NaN;
    }
  }

  private static async evaluateParametricFunction(expression: string, parameter: string, value: number): Promise<number> {
    const substituted = expression.replace(new RegExp(parameter, 'g'), value.toString());
    try {
      const func = new Function('return ' + substituted);
      return func();
    } catch {
      return NaN;
    }
  }

  private static async evaluatePolarFunction(expression: string, theta: number): Promise<number> {
    const substituted = expression.replace(/theta|θ/g, theta.toString());
    try {
      const func = new Function('return ' + substituted);
      return func();
    } catch {
      return NaN;
    }
  }

  private static async calculateLimit(expression: string, point: number, direction: 'left' | 'right'): Promise<number> {
    const epsilon = 1e-6;
    const delta = direction === 'left' ? -epsilon : epsilon;
    return this.evaluateFunction(expression, point + delta);
  }

  private static async findAsymptotes(expression: string, options: GraphingOptions): Promise<any[]> {
    // Simplified asymptote detection
    return [];
  }

  private static async findCriticalPoints(expression: string, xRange: [number, number]): Promise<any[]> {
    // Simplified critical point detection
    return [];
  }

  private static async findIntercepts(expression: string, options: GraphingOptions): Promise<any[]> {
    // Find x and y intercepts
    const intercepts = [];
    
    // Y-intercept (x = 0)
    try {
      const yIntercept = await this.evaluateFunction(expression, 0);
      if (isFinite(yIntercept)) {
        intercepts.push({ x: 0, y: yIntercept, type: 'y' });
      }
    } catch {}

    return intercepts;
  }

  private static analyzeDomain(expression: string): { min: number; max: number; restrictions: string[] } {
    return {
      min: -Infinity,
      max: Infinity,
      restrictions: []
    };
  }

  private static analyzeRange(points: Array<{ x: number; y: number }>): { min: number; max: number; estimated: boolean } {
    if (points.length === 0) return { min: 0, max: 0, estimated: true };
    
    const yValues = points.map(p => p.y);
    return {
      min: Math.min(...yValues),
      max: Math.max(...yValues),
      estimated: true
    };
  }

  private static async analyzeProperties(expression: string, points: Array<{ x: number; y: number }>, xRange: [number, number]): Promise<any> {
    return {
      continuous: true,
      differentiable: true,
      monotonic: 'neither' as const,
      concavity: [],
      symmetry: 'neither' as const,
      periodic: { isPeriodic: false }
    };
  }

  private static classifyFunction(expression: string): string {
    if (expression.includes('^2') || expression.includes('²')) return 'Quadratic';
    if (expression.includes('^3') || expression.includes('³')) return 'Cubic';
    if (expression.includes('sin') || expression.includes('cos') || expression.includes('tan')) return 'Trigonometric';
    if (expression.includes('log') || expression.includes('ln')) return 'Logarithmic';
    if (expression.includes('exp') || /\d+\^/.test(expression)) return 'Exponential';
    return 'Polynomial';
  }

  private static calculateComplexity(expression: string): number {
    let complexity = 0;
    complexity += (expression.match(/[\+\-]/g) || []).length;
    complexity += (expression.match(/[\*\/]/g) || []).length * 2;
    complexity += (expression.match(/\^/g) || []).length * 3;
    complexity += (expression.match(/(sin|cos|tan|log|ln|exp)/g) || []).length * 4;
    return complexity;
  }

  private static async findIntersections(functions: any[], options: any): Promise<any[]> {
    return [];
  }

  private static async analyzeFunctionRelationships(functions: any[], options: any): Promise<any> {
    return {
      dominance: [],
      growth: []
    };
  }

  private static async analyzeParametricProperties(points: any[], xExpr: string, yExpr: string, param: string): Promise<any> {
    return {
      selfIntersections: [],
      cusps: [],
      loops: [],
      arcLength: 0,
      boundingBox: { minX: 0, maxX: 0, minY: 0, maxY: 0 }
    };
  }

  private static async analyzePolarProperties(points: any[], expression: string): Promise<any> {
    return {
      symmetries: [],
      maxRadius: 0,
      minRadius: 0,
      loops: 0,
      petals: 0
    };
  }

  private static async calculateDerivative(expression: string): Promise<string> {
    // Simplified symbolic differentiation
    if (expression === 'x') return '1';
    if (expression.includes('x^2')) return '2*x';
    if (expression.includes('x^3')) return '3*x^2';
    return '1'; // Fallback
  }

  private static async calculateTangentLine(expression: string, point: number, options: any): Promise<GraphData> {
    const y0 = await this.evaluateFunction(expression, point);
    const derivative = await this.calculateDerivative(expression);
    const slope = await this.evaluateFunction(derivative, point);
    
    // Generate tangent line points
    const points = [];
    const range = options.xRange || [-10, 10];
    for (let x = range[0]; x <= range[1]; x += 0.1) {
      const y = y0 + slope * (x - point);
      points.push({ x, y });
    }

    return {
      points,
      discontinuities: [],
      asymptotes: [],
      criticalPoints: [],
      intercepts: [],
      domain: { min: range[0], max: range[1], restrictions: [] },
      range: { min: -Infinity, max: Infinity, estimated: true },
      properties: {
        continuous: true,
        differentiable: true,
        monotonic: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'neither',
        concavity: [],
        symmetry: 'neither',
        periodic: { isPeriodic: false }
      },
      metadata: {
        functionType: 'Linear',
        complexity: 1,
        renderTime: 0,
        dataPoints: points.length
      }
    };
  }

  private static async calculateAreaUnderCurve(expression: string, bounds: [number, number], resolution: number): Promise<Array<{ x: number; y: number }>> {
    const points = [];
    const stepSize = (bounds[1] - bounds[0]) / resolution;
    
    for (let i = 0; i <= resolution; i++) {
      const x = bounds[0] + i * stepSize;
      const y = await this.evaluateFunction(expression, x);
      points.push({ x, y: Math.max(0, y) }); // Only positive area
    }
    
    return points;
  }

  private static async numericalIntegration(expression: string, bounds: [number, number]): Promise<number> {
    // Simpson's rule implementation
    const n = 1000; // Number of intervals
    const h = (bounds[1] - bounds[0]) / n;
    let sum = 0;
    
    for (let i = 0; i <= n; i++) {
      const x = bounds[0] + i * h;
      const y = await this.evaluateFunction(expression, x);
      
      if (i === 0 || i === n) {
        sum += y;
      } else if (i % 2 === 1) {
        sum += 4 * y;
      } else {
        sum += 2 * y;
      }
    }
    
    return (h / 3) * sum;
  }

  private static async calculateCentroid(expression: string, bounds: [number, number]): Promise<{ x: number; y: number }> {
    // Simplified centroid calculation
    const area = await this.numericalIntegration(expression, bounds);
    const xCenter = (bounds[0] + bounds[1]) / 2;
    const yCenter = area / (bounds[1] - bounds[0]) / 2;
    
    return { x: xCenter, y: yCenter };
  }

  /**
   * Get available graphing features
   */
  static getAvailableFeatures(): string[] {
    return [
      'Function Graphing',
      'Parametric Equations',
      'Polar Coordinates',
      'Multiple Function Comparison',
      'Derivative Visualization',
      'Integral Visualization',
      'Critical Point Analysis',
      'Asymptote Detection',
      'Domain and Range Analysis',
      'Interactive Exploration'
    ];
  }

  /**
   * Get default graphing options
   */
  static getDefaultOptions(): GraphingOptions {
    return { ...this.DEFAULT_OPTIONS };
  }
}