/**
 * Interactive Real-time Graphing Engine
 * Advanced mathematical visualization with real-time updates
 */

import { ASTNode, AdvancedASTParser, EvaluationContext } from './advanced-ast-parser';

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
    realTimeUpdate: true
  };

  /**
   * Generate comprehensive graph data with mathematical analysis
   */
  static generateGraphData(expression: string, options: Partial<GraphOptions> = {}): GraphData {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const parseResult = AdvancedASTParser.parseExpression(expression);

    if (!parseResult.isValid) {
      throw new Error(`Invalid expression: ${parseResult.errors.join(', ')}`);
    }

    const ast = parseResult.ast;
    const variables = Array.from(parseResult.variables);
    
    // Assume 'x' is the independent variable
    const independentVar = variables.includes('x') ? 'x' : variables[0] || 'x';

    // Generate data points
    const { x, y } = this.generateDataPoints(ast, independentVar, opts);
    
    // Mathematical analysis
    const criticalPoints = this.findCriticalPoints(ast, independentVar, opts.domain);
    const asymptotes = this.findAsymptotes(ast, independentVar, opts.domain);
    const zeros = this.findZeros(ast, independentVar, opts.domain);
    const extrema = this.findExtrema(ast, independentVar, opts.domain);

    // Calculate actual range from data
    const actualRange: [number, number] = [
      Math.min(...y.filter(val => isFinite(val))),
      Math.max(...y.filter(val => isFinite(val)))
    ];

    return {
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
  }

  /**
   * Generate data points for plotting
   */
  private static generateDataPoints(
    ast: ASTNode, 
    variable: string, 
    options: GraphOptions
  ): { x: number[]; y: number[] } {
    const x: number[] = [];
    const y: number[] = [];
    
    const [xMin, xMax] = options.domain;
    const step = (xMax - xMin) / options.resolution;

    const context: EvaluationContext = {
      variables: new Map(),
      functions: new Map(),
      precision: 15,
      angleMode: 'rad',
      customRules: new Map(),
      optimizationLevel: 'basic',
      symbolicMode: false,
      cacheResults: false,
      resultCache: new Map(),
    };

    for (let i = 0; i <= options.resolution; i++) {
      const xVal = xMin + i * step;
      x.push(xVal);

      try {
        context.variables.set(variable, xVal);
        const yVal = AdvancedASTParser.evaluateAST(ast, context);
        
        // Handle special values
        if (!isFinite(yVal)) {
          y.push(NaN);
        } else {
          y.push(yVal);
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
    ast: ASTNode, 
    variable: string, 
    domain: [number, number]
  ): CriticalPoint[] {
    const criticalPoints: CriticalPoint[] = [];
    
    // Simple numerical derivative to find critical points
    const h = 1e-6;
    const [xMin, xMax] = domain;
    const step = (xMax - xMin) / 1000;

    const context: EvaluationContext = {
      variables: new Map(),
      functions: new Map(),
      precision: 15,
      angleMode: 'rad',
      customRules: new Map(),
      optimizationLevel: 'basic',
      symbolicMode: false,
      cacheResults: false,
      resultCache: new Map(),
    };

    for (let x = xMin; x <= xMax; x += step) {
      try {
        // Calculate numerical derivative
        context.variables.set(variable, x + h);
        const yPlus = AdvancedASTParser.evaluateAST(ast, context);
        
        context.variables.set(variable, x - h);
        const yMinus = AdvancedASTParser.evaluateAST(ast, context);
        
        const derivative = (yPlus - yMinus) / (2 * h);

        // Critical point if derivative ≈ 0
        if (Math.abs(derivative) < 1e-3) {
          context.variables.set(variable, x);
          const y = AdvancedASTParser.evaluateAST(ast, context);
          
          if (isFinite(y)) {
            // Determine type using second derivative
            const secondDerivative = this.calculateSecondDerivative(ast, variable, x, h, context);
            
            let type: CriticalPoint['type'];
            let description: string;
            
            if (secondDerivative > 0) {
              type = 'minimum';
              description = `Local minimum at (${x.toFixed(3)}, ${y.toFixed(3)})`;
            } else if (secondDerivative < 0) {
              type = 'maximum';
              description = `Local maximum at (${x.toFixed(3)}, ${y.toFixed(3)})`;
            } else {
              type = 'inflection';
              description = `Inflection point at (${x.toFixed(3)}, ${y.toFixed(3)})`;
            }

            criticalPoints.push({ x, y, type, description });
          }
        }
      } catch (error) {
        // Skip points that cause errors
      }
    }

    return criticalPoints;
  }

  /**
   * Calculate second derivative numerically
   */
  private static calculateSecondDerivative(
    ast: ASTNode,
    variable: string,
    x: number,
    h: number,
    context: EvaluationContext
  ): number {
    try {
      context.variables.set(variable, x + h);
      const yPlus = AdvancedASTParser.evaluateAST(ast, context);
      
      context.variables.set(variable, x);
      const y = AdvancedASTParser.evaluateAST(ast, context);
      
      context.variables.set(variable, x - h);
      const yMinus = AdvancedASTParser.evaluateAST(ast, context);
      
      return (yPlus - 2 * y + yMinus) / (h * h);
    } catch {
      return 0;
    }
  }

  /**
   * Find vertical asymptotes
   */
  private static findAsymptotes(
    ast: ASTNode, 
    variable: string, 
    domain: [number, number]
  ): Asymptote[] {
    const asymptotes: Asymptote[] = [];
    
    // Look for vertical asymptotes (where function approaches ±∞)
    const [xMin, xMax] = domain;
    const step = (xMax - xMin) / 1000;
    
    const context: EvaluationContext = {
      variables: new Map(),
      functions: new Map(),
      precision: 15,
      angleMode: 'rad',
      customRules: new Map(),
      optimizationLevel: 'basic',
      symbolicMode: false,
      cacheResults: false,
      resultCache: new Map(),
    };

    let previousY = NaN;
    
    for (let x = xMin; x <= xMax; x += step) {
      try {
        context.variables.set(variable, x);
        const y = AdvancedASTParser.evaluateAST(ast, context);
        
        // Check for vertical asymptote
        if (isFinite(previousY) && !isFinite(y)) {
          asymptotes.push({
            type: 'vertical',
            equation: `x = ${x.toFixed(3)}`,
            value: x
          });
        }
        
        previousY = y;
      } catch (error) {
        // Might indicate a discontinuity/asymptote
      }
    }

    return asymptotes;
  }

  /**
   * Find zeros (x-intercepts)
   */
  private static findZeros(
    ast: ASTNode, 
    variable: string, 
    domain: [number, number]
  ): number[] {
    const zeros: number[] = [];
    const [xMin, xMax] = domain;
    const step = (xMax - xMin) / 1000;
    
    const context: EvaluationContext = {
      variables: new Map(),
      functions: new Map(),
      precision: 15,
      angleMode: 'rad',
      customRules: new Map(),
      optimizationLevel: 'basic',
      symbolicMode: false,
      cacheResults: false,
      resultCache: new Map(),
    };

    let previousY = NaN;
    
    for (let x = xMin; x <= xMax; x += step) {
      try {
        context.variables.set(variable, x);
        const y = AdvancedASTParser.evaluateAST(ast, context);
        
        // Check for sign change (indicates zero crossing)
        if (isFinite(previousY) && isFinite(y) && 
            Math.sign(previousY) !== Math.sign(y) && 
            Math.abs(y) < 1e-3) {
          zeros.push(x);
        }
        
        previousY = y;
      } catch (error) {
        // Skip errors
      }
    }

    return zeros;
  }

  /**
   * Find extrema (global and local min/max)
   */
  private static findExtrema(
    ast: ASTNode, 
    variable: string, 
    domain: [number, number]
  ): Extremum[] {
    const extrema: Extremum[] = [];
    
    // Generate sample points to find extrema
    const [xMin, xMax] = domain;
    const step = (xMax - xMin) / 1000;
    
    const context: EvaluationContext = {
      variables: new Map(),
      functions: new Map(),
      precision: 15,
      angleMode: 'rad',
      customRules: new Map(),
      optimizationLevel: 'basic',
      symbolicMode: false,
      cacheResults: false,
      resultCache: new Map(),
    };

    const points: { x: number; y: number }[] = [];
    
    // Collect all valid points
    for (let x = xMin; x <= xMax; x += step) {
      try {
        context.variables.set(variable, x);
        const y = AdvancedASTParser.evaluateAST(ast, context);
        
        if (isFinite(y)) {
          points.push({ x, y });
        }
      } catch (error) {
        // Skip invalid points
      }
    }

    if (points.length === 0) return extrema;

    // Find global extrema
    const yValues = points.map(p => p.y);
    const globalMin = Math.min(...yValues);
    const globalMax = Math.max(...yValues);

    const globalMinPoint = points.find(p => p.y === globalMin);
    const globalMaxPoint = points.find(p => p.y === globalMax);

    if (globalMinPoint) {
      extrema.push({
        x: globalMinPoint.x,
        y: globalMinPoint.y,
        type: 'global_min',
        description: `Global minimum: ${globalMin.toFixed(3)}`
      });
    }

    if (globalMaxPoint) {
      extrema.push({
        x: globalMaxPoint.x,
        y: globalMaxPoint.y,
        type: 'global_max',
        description: `Global maximum: ${globalMax.toFixed(3)}`
      });
    }

    return extrema;
  }

  /**
   * Generate real-time graph updates
   */
  static generateRealTimeUpdate(
    expression: string,
    parameters: Map<string, number>,
    options: Partial<GraphOptions> = {}
  ): GraphData {
    // Parse expression with current parameter values
    const parseResult = AdvancedASTParser.parseExpression(expression);
    
    if (!parseResult.isValid) {
      throw new Error(`Invalid expression: ${parseResult.errors.join(', ')}`);
    }

    // Update context with current parameter values
    const context: EvaluationContext = {
      variables: new Map(parameters),
      functions: new Map(),
      precision: 15,
      angleMode: 'rad',
      customRules: new Map(),
      optimizationLevel: 'basic',
      symbolicMode: false,
      cacheResults: false,
      resultCache: new Map(),
    };

    return this.generateGraphData(expression, options);
  }

  /**
   * Generate multiple function plots for comparison
   */
  static generateMultiPlot(
    expressions: string[],
    options: Partial<GraphOptions> = {}
  ): GraphData[] {
    return expressions.map(expr => this.generateGraphData(expr, options));
  }

  /**
   * Generate parametric plots
   */
  static generateParametricPlot(
    xExpression: string,
    yExpression: string,
    parameter: string = 't',
    paramRange: [number, number] = [0, 2 * Math.PI],
    options: Partial<GraphOptions> = {}
  ): { x: number[]; y: number[]; parameter: string } {
    const xParseResult = AdvancedASTParser.parseExpression(xExpression);
    const yParseResult = AdvancedASTParser.parseExpression(yExpression);

    if (!xParseResult.isValid || !yParseResult.isValid) {
      throw new Error('Invalid parametric expressions');
    }

    const resolution = options.resolution || 1000;
    const [tMin, tMax] = paramRange;
    const step = (tMax - tMin) / resolution;

    const x: number[] = [];
    const y: number[] = [];

    const context: EvaluationContext = {
      variables: new Map(),
      functions: new Map(),
      precision: 15,
      angleMode: 'rad',
      customRules: new Map(),
      optimizationLevel: 'basic',
      symbolicMode: false,
      cacheResults: false,
      resultCache: new Map(),
    };

    for (let i = 0; i <= resolution; i++) {
      const t = tMin + i * step;
      context.variables.set(parameter, t);

      try {
        const xVal = AdvancedASTParser.evaluateAST(xParseResult.ast, context);
        const yVal = AdvancedASTParser.evaluateAST(yParseResult.ast, context);

        x.push(xVal);
        y.push(yVal);
      } catch (error) {
        x.push(NaN);
        y.push(NaN);
      }
    }

    return { x, y, parameter };
  }

  /**
   * Generate polar plots
   */
  static generatePolarPlot(
    rExpression: string,
    thetaRange: [number, number] = [0, 2 * Math.PI],
    options: Partial<GraphOptions> = {}
  ): { x: number[]; y: number[]; r: number[]; theta: number[] } {
    const parseResult = AdvancedASTParser.parseExpression(rExpression);

    if (!parseResult.isValid) {
      throw new Error('Invalid polar expression');
    }

    const resolution = options.resolution || 1000;
    const [thetaMin, thetaMax] = thetaRange;
    const step = (thetaMax - thetaMin) / resolution;

    const x: number[] = [];
    const y: number[] = [];
    const r: number[] = [];
    const theta: number[] = [];

    const context: EvaluationContext = {
      variables: new Map(),
      functions: new Map(),
      precision: 15,
      angleMode: 'rad',
      customRules: new Map(),
      optimizationLevel: 'basic',
      symbolicMode: false,
      cacheResults: false,
      resultCache: new Map(),
    };

    for (let i = 0; i <= resolution; i++) {
      const t = thetaMin + i * step;
      context.variables.set('theta', t);
      context.variables.set('t', t); // Alternative variable name

      try {
        const rVal = AdvancedASTParser.evaluateAST(parseResult.ast, context);
        
        if (isFinite(rVal)) {
          const xVal = rVal * Math.cos(t);
          const yVal = rVal * Math.sin(t);

          x.push(xVal);
          y.push(yVal);
          r.push(rVal);
          theta.push(t);
        } else {
          x.push(NaN);
          y.push(NaN);
          r.push(NaN);
          theta.push(t);
        }
      } catch (error) {
        x.push(NaN);
        y.push(NaN);
        r.push(NaN);
        theta.push(t);
      }
    }

    return { x, y, r, theta };
  }
}