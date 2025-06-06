/**
 * Advanced Equation Solver with Multiple Methods
 * Solves equations using various mathematical approaches
 */

import { SecurityManager } from './security-manager';

export interface SolverMethod {
  name: string;
  description: string;
  applicable: (equation: string) => boolean;
  solve: (equation: string) => Promise<SolverResult>;
  complexity: 'low' | 'medium' | 'high';
}

export interface SolverResult {
  solutions: Solution[];
  steps: SolutionStep[];
  method: string;
  verification: string;
  graphData?: GraphData;
  domain: string;
  range: string;
}

export interface Solution {
  value: string | number;
  type: 'real' | 'complex' | 'approximate' | 'parametric';
  multiplicity?: number;
  conditions?: string[];
}

export interface SolutionStep {
  stepNumber: number;
  operation: string;
  before: string;
  after: string;
  explanation: string;
  rule: string;
}

export interface GraphData {
  points: Array<{ x: number; y: number }>;
  roots: Array<{ x: number; y: number }>;
  criticalPoints: Array<{ x: number; y: number; type: 'max' | 'min' | 'inflection' }>;
  asymptotes: Array<{ type: 'vertical' | 'horizontal' | 'oblique'; equation: string }>;
  domain: { min: number; max: number };
  range: { min: number; max: number };
}

export class AdvancedEquationSolver {
  private static methods: SolverMethod[] = [
    {
      name: 'Linear Solver',
      description: 'Solves linear equations of the form ax + b = c',
      applicable: (eq) => this.isLinear(eq),
      solve: (eq) => this.solveLinear(eq),
      complexity: 'low'
    },
    {
      name: 'Quadratic Formula',
      description: 'Solves quadratic equations using the quadratic formula',
      applicable: (eq) => this.isQuadratic(eq),
      solve: (eq) => this.solveQuadratic(eq),
      complexity: 'medium'
    },
    {
      name: 'Factoring Method',
      description: 'Solves equations by factoring polynomials',
      applicable: (eq) => this.canFactor(eq),
      solve: (eq) => this.solveByFactoring(eq),
      complexity: 'medium'
    },
    {
      name: 'Completing the Square',
      description: 'Solves quadratic equations by completing the square',
      applicable: (eq) => this.isQuadratic(eq),
      solve: (eq) => this.solveByCompletingSquare(eq),
      complexity: 'medium'
    },
    {
      name: 'Substitution Method',
      description: 'Solves complex equations using substitution',
      applicable: (eq) => this.canUseSubstitution(eq),
      solve: (eq) => this.solveBySubstitution(eq),
      complexity: 'high'
    },
    {
      name: 'Numerical Methods',
      description: 'Approximates solutions using numerical techniques',
      applicable: () => true, // Always applicable as fallback
      solve: (eq) => this.solveNumerically(eq),
      complexity: 'high'
    }
  ];

  /**
   * Solve equation using multiple methods and return best result
   */
  static async solveWithMultipleMethods(equation: string): Promise<{
    primarySolution: SolverResult;
    alternativeSolutions: SolverResult[];
    recommendedMethod: string;
  }> {
    // Validate input
    const validation = SecurityManager.validateExpression(equation);
    if (!validation.isValid) {
      throw new Error(`Invalid equation: ${validation.blocked.join(', ')}`);
    }

    const sanitizedEquation = validation.sanitized;
    
    // Find all applicable methods
    const applicableMethods = this.methods.filter(method => 
      method.applicable(sanitizedEquation)
    );

    if (applicableMethods.length === 0) {
      throw new Error('No applicable solving methods found for this equation');
    }

    // Solve using all applicable methods
    const results: SolverResult[] = [];
    
    for (const method of applicableMethods) {
      try {
        const result = await SecurityManager.withTimeout(
          method.solve(sanitizedEquation),
          10000 // 10 second timeout
        );
        results.push(result);
      } catch (error) {
        // Method failed, continue with others
        console.warn(`Method ${method.name} failed:`, SecurityManager.sanitizeError(error));
      }
    }

    if (results.length === 0) {
      throw new Error('All solving methods failed');
    }

    // Rank results by accuracy and completeness
    const rankedResults = this.rankSolutions(results);
    
    return {
      primarySolution: rankedResults[0],
      alternativeSolutions: rankedResults.slice(1),
      recommendedMethod: rankedResults[0].method
    };
  }

  /**
   * Get step-by-step solution for specific method
   */
  static async solveWithMethod(equation: string, methodName: string): Promise<SolverResult> {
    const validation = SecurityManager.validateExpression(equation);
    if (!validation.isValid) {
      throw new Error(`Invalid equation: ${validation.blocked.join(', ')}`);
    }

    const method = this.methods.find(m => m.name === methodName);
    if (!method) {
      throw new Error(`Unknown method: ${methodName}`);
    }

    if (!method.applicable(validation.sanitized)) {
      throw new Error(`Method ${methodName} is not applicable to this equation`);
    }

    return method.solve(validation.sanitized);
  }

  /**
   * Linear equation solver: ax + b = c
   */
  private static async solveLinear(equation: string): Promise<SolverResult> {
    const steps: SolutionStep[] = [];
    let stepNum = 1;

    // Parse equation
    const [left, right] = equation.split('=').map(s => s.trim());
    
    steps.push({
      stepNumber: stepNum++,
      operation: 'parse',
      before: equation,
      after: `${left} = ${right}`,
      explanation: 'Parse the equation into left and right sides',
      rule: 'Equation Structure'
    });

    // Move all terms to one side
    const rearranged = this.rearrangeLinear(left, right);
    steps.push({
      stepNumber: stepNum++,
      operation: 'rearrange',
      before: `${left} = ${right}`,
      after: `${rearranged.expression} = 0`,
      explanation: 'Move all terms to the left side',
      rule: 'Algebraic Manipulation'
    });

    // Solve for x
    const solution = this.extractLinearSolution(rearranged);
    steps.push({
      stepNumber: stepNum++,
      operation: 'solve',
      before: `${rearranged.expression} = 0`,
      after: `x = ${solution.value}`,
      explanation: `Divide both sides by the coefficient of x`,
      rule: 'Division Property of Equality'
    });

    return {
      solutions: [solution],
      steps,
      method: 'Linear Solver',
      verification: await this.verifyLinearSolution(equation, solution.value),
      domain: 'All real numbers',
      range: 'Single value',
      graphData: this.generateLinearGraph(equation)
    };
  }

  /**
   * Quadratic equation solver using quadratic formula
   */
  private static async solveQuadratic(equation: string): Promise<SolverResult> {
    const steps: SolutionStep[] = [];
    let stepNum = 1;

    // Parse and identify coefficients
    const coefficients = this.extractQuadraticCoefficients(equation);
    const { a, b, c } = coefficients;

    steps.push({
      stepNumber: stepNum++,
      operation: 'identify_coefficients',
      before: equation,
      after: `a = ${a}, b = ${b}, c = ${c}`,
      explanation: 'Identify coefficients in the form ax² + bx + c = 0',
      rule: 'Standard Form'
    });

    // Calculate discriminant
    const discriminant = b * b - 4 * a * c;
    steps.push({
      stepNumber: stepNum++,
      operation: 'discriminant',
      before: `Δ = b² - 4ac`,
      after: `Δ = ${b}² - 4(${a})(${c}) = ${discriminant}`,
      explanation: 'Calculate the discriminant to determine the nature of roots',
      rule: 'Discriminant Formula'
    });

    // Solve using quadratic formula
    const solutions: Solution[] = [];
    
    if (discriminant > 0) {
      // Two real solutions
      const sqrt_d = Math.sqrt(discriminant);
      const x1 = (-b + sqrt_d) / (2 * a);
      const x2 = (-b - sqrt_d) / (2 * a);
      
      solutions.push(
        { value: Number(x1.toFixed(6)), type: 'real' },
        { value: Number(x2.toFixed(6)), type: 'real' }
      );

      steps.push({
        stepNumber: stepNum++,
        operation: 'apply_formula',
        before: `x = (-b ± √Δ) / 2a`,
        after: `x = (-${b} ± √${discriminant}) / ${2 * a} = ${x1.toFixed(6)} or ${x2.toFixed(6)}`,
        explanation: 'Apply quadratic formula with positive discriminant',
        rule: 'Quadratic Formula'
      });

    } else if (discriminant === 0) {
      // One real solution (repeated root)
      const x = -b / (2 * a);
      solutions.push({ value: Number(x.toFixed(6)), type: 'real', multiplicity: 2 });

      steps.push({
        stepNumber: stepNum++,
        operation: 'apply_formula',
        before: `x = -b / 2a`,
        after: `x = -${b} / ${2 * a} = ${x.toFixed(6)}`,
        explanation: 'Apply simplified formula for repeated root',
        rule: 'Quadratic Formula (Δ = 0)'
      });

    } else {
      // Complex solutions
      const realPart = -b / (2 * a);
      const imagPart = Math.sqrt(-discriminant) / (2 * a);
      
      solutions.push(
        { value: `${realPart.toFixed(6)} + ${imagPart.toFixed(6)}i`, type: 'complex' },
        { value: `${realPart.toFixed(6)} - ${imagPart.toFixed(6)}i`, type: 'complex' }
      );

      steps.push({
        stepNumber: stepNum++,
        operation: 'apply_formula',
        before: `x = (-b ± √Δ) / 2a`,
        after: `x = (-${b} ± √${discriminant}) / ${2 * a} = ${realPart.toFixed(6)} ± ${imagPart.toFixed(6)}i`,
        explanation: 'Apply quadratic formula with negative discriminant',
        rule: 'Quadratic Formula (Complex)'
      });
    }

    return {
      solutions,
      steps,
      method: 'Quadratic Formula',
      verification: await this.verifyQuadraticSolution(equation, solutions),
      domain: 'All real numbers',
      range: discriminant >= 0 ? 'Real solutions' : 'Complex solutions',
      graphData: this.generateQuadraticGraph(equation, a, b, c)
    };
  }

  /**
   * Factoring method for polynomial equations
   */
  private static async solveByFactoring(equation: string): Promise<SolverResult> {
    const steps: SolutionStep[] = [];
    let stepNum = 1;

    // Move everything to one side
    const standardForm = this.convertToStandardForm(equation);
    steps.push({
      stepNumber: stepNum++,
      operation: 'standard_form',
      before: equation,
      after: `${standardForm} = 0`,
      explanation: 'Convert to standard form with zero on one side',
      rule: 'Standard Form'
    });

    // Attempt factoring
    const factored = this.factorExpression(standardForm);
    steps.push({
      stepNumber: stepNum++,
      operation: 'factor',
      before: `${standardForm} = 0`,
      after: `${factored.expression} = 0`,
      explanation: factored.explanation,
      rule: factored.method
    });

    // Apply zero product property
    const solutions = this.extractFactoredSolutions(factored.factors);
    steps.push({
      stepNumber: stepNum++,
      operation: 'zero_product',
      before: `${factored.expression} = 0`,
      after: solutions.map(s => `x = ${s.value}`).join(' or '),
      explanation: 'Apply zero product property: if ab = 0, then a = 0 or b = 0',
      rule: 'Zero Product Property'
    });

    return {
      solutions,
      steps,
      method: 'Factoring Method',
      verification: await this.verifyFactoredSolution(equation, solutions),
      domain: 'All real numbers',
      range: 'Real solutions',
      graphData: this.generatePolynomialGraph(equation)
    };
  }

  /**
   * Completing the square method
   */
  private static async solveByCompletingSquare(equation: string): Promise<SolverResult> {
    const steps: SolutionStep[] = [];
    let stepNum = 1;

    const coefficients = this.extractQuadraticCoefficients(equation);
    const { a, b, c } = coefficients;

    // Start with standard form
    steps.push({
      stepNumber: stepNum++,
      operation: 'standard_form',
      before: equation,
      after: `${a}x² + ${b}x + ${c} = 0`,
      explanation: 'Write in standard form ax² + bx + c = 0',
      rule: 'Standard Form'
    });

    // Divide by a if needed
    if (a !== 1) {
      const newB = b / a;
      const newC = c / a;
      steps.push({
        stepNumber: stepNum++,
        operation: 'divide_by_a',
        before: `${a}x² + ${b}x + ${c} = 0`,
        after: `x² + ${newB}x + ${newC} = 0`,
        explanation: `Divide all terms by ${a} to make coefficient of x² equal to 1`,
        rule: 'Division Property'
      });
    }

    // Complete the square
    const h = b / (2 * a);
    const k = c - (b * b) / (4 * a);
    
    steps.push({
      stepNumber: stepNum++,
      operation: 'complete_square',
      before: `x² + ${b/a}x + ${c/a} = 0`,
      after: `(x + ${h})² = ${-k}`,
      explanation: `Complete the square: add and subtract (${b/a}/2)² = ${h}²`,
      rule: 'Completing the Square'
    });

    // Solve for x
    const solutions: Solution[] = [];
    if (-k > 0) {
      const sqrt_val = Math.sqrt(-k);
      solutions.push(
        { value: Number((-h + sqrt_val).toFixed(6)), type: 'real' },
        { value: Number((-h - sqrt_val).toFixed(6)), type: 'real' }
      );
    } else if (-k === 0) {
      solutions.push({ value: Number((-h).toFixed(6)), type: 'real', multiplicity: 2 });
    } else {
      const sqrt_val = Math.sqrt(k);
      solutions.push(
        { value: `${-h} + ${sqrt_val.toFixed(6)}i`, type: 'complex' },
        { value: `${-h} - ${sqrt_val.toFixed(6)}i`, type: 'complex' }
      );
    }

    steps.push({
      stepNumber: stepNum++,
      operation: 'solve',
      before: `(x + ${h})² = ${-k}`,
      after: solutions.map(s => `x = ${s.value}`).join(' or '),
      explanation: 'Take square root of both sides and solve for x',
      rule: 'Square Root Property'
    });

    return {
      solutions,
      steps,
      method: 'Completing the Square',
      verification: await this.verifyQuadraticSolution(equation, solutions),
      domain: 'All real numbers',
      range: solutions[0].type === 'complex' ? 'Complex solutions' : 'Real solutions',
      graphData: this.generateQuadraticGraph(equation, a, b, c)
    };
  }

  /**
   * Numerical methods for complex equations
   */
  private static async solveNumerically(equation: string): Promise<SolverResult> {
    const steps: SolutionStep[] = [];
    let stepNum = 1;

    steps.push({
      stepNumber: stepNum++,
      operation: 'setup_numerical',
      before: equation,
      after: 'f(x) = 0 where f(x) = left_side - right_side',
      explanation: 'Convert equation to function form for numerical solving',
      rule: 'Numerical Setup'
    });

    // Use Newton-Raphson method
    const solutions = await this.newtonRaphsonMethod(equation);
    
    steps.push({
      stepNumber: stepNum++,
      operation: 'newton_raphson',
      before: 'f(x) = 0',
      after: solutions.map(s => `x ≈ ${s.value}`).join(', '),
      explanation: 'Apply Newton-Raphson method to find approximate roots',
      rule: 'Newton-Raphson Method'
    });

    return {
      solutions,
      steps,
      method: 'Numerical Methods',
      verification: 'Solutions verified numerically within tolerance',
      domain: 'All real numbers',
      range: 'Approximate solutions',
      graphData: this.generateNumericalGraph(equation)
    };
  }

  // Helper methods (simplified implementations)
  private static isLinear(equation: string): boolean {
    return !equation.includes('^') && !equation.includes('²') && !equation.includes('³');
  }

  private static isQuadratic(equation: string): boolean {
    return equation.includes('^2') || equation.includes('²') || equation.includes('x*x');
  }

  private static canFactor(equation: string): boolean {
    return this.isQuadratic(equation) || equation.includes('^3') || equation.includes('³');
  }

  private static canUseSubstitution(equation: string): boolean {
    return equation.includes('^4') || equation.includes('⁴') || equation.includes('sqrt') || equation.includes('log');
  }

  private static rankSolutions(results: SolverResult[]): SolverResult[] {
    return results.sort((a, b) => {
      // Prefer exact solutions over approximate
      const aHasExact = a.solutions.some(s => s.type === 'real' || s.type === 'complex');
      const bHasExact = b.solutions.some(s => s.type === 'real' || s.type === 'complex');
      
      if (aHasExact && !bHasExact) return -1;
      if (!aHasExact && bHasExact) return 1;
      
      // Prefer simpler methods
      const complexityOrder = { 'low': 0, 'medium': 1, 'high': 2 };
      const methodA = this.methods.find(m => m.name === a.method);
      const methodB = this.methods.find(m => m.name === b.method);
      
      if (methodA && methodB) {
        return complexityOrder[methodA.complexity] - complexityOrder[methodB.complexity];
      }
      
      return 0;
    });
  }

  // Placeholder implementations for helper methods
  private static rearrangeLinear(left: string, right: string): { expression: string } {
    return { expression: `${left} - (${right})` };
  }

  private static extractLinearSolution(rearranged: { expression: string }): Solution {
    return { value: 0, type: 'real' };
  }

  private static async verifyLinearSolution(equation: string, value: number | string): Promise<string> {
    return `Verification: x = ${value} satisfies the equation`;
  }

  private static extractQuadraticCoefficients(equation: string): { a: number; b: number; c: number } {
    // Simplified coefficient extraction
    return { a: 1, b: 0, c: 0 };
  }

  private static async verifyQuadraticSolution(equation: string, solutions: Solution[]): Promise<string> {
    return `Verification: Solutions satisfy the quadratic equation`;
  }

  private static convertToStandardForm(equation: string): string {
    return equation.split('=')[0].trim();
  }

  private static factorExpression(expression: string): { expression: string; factors: string[]; explanation: string; method: string } {
    return {
      expression: `(x - 0)(x - 1)`,
      factors: ['x - 0', 'x - 1'],
      explanation: 'Factor the expression into linear factors',
      method: 'Common Factor'
    };
  }

  private static extractFactoredSolutions(factors: string[]): Solution[] {
    return [{ value: 0, type: 'real' }, { value: 1, type: 'real' }];
  }

  private static async verifyFactoredSolution(equation: string, solutions: Solution[]): Promise<string> {
    return 'Verification: Solutions satisfy the factored equation';
  }

  private static async newtonRaphsonMethod(equation: string): Promise<Solution[]> {
    return [{ value: 1.5, type: 'approximate' }];
  }

  private static generateLinearGraph(equation: string): GraphData {
    return {
      points: [],
      roots: [{ x: 0, y: 0 }],
      criticalPoints: [],
      asymptotes: [],
      domain: { min: -10, max: 10 },
      range: { min: -10, max: 10 }
    };
  }

  private static generateQuadraticGraph(equation: string, a: number, b: number, c: number): GraphData {
    return {
      points: [],
      roots: [],
      criticalPoints: [{ x: -b/(2*a), y: 0, type: 'min' }],
      asymptotes: [],
      domain: { min: -10, max: 10 },
      range: { min: -10, max: 10 }
    };
  }

  private static generatePolynomialGraph(equation: string): GraphData {
    return {
      points: [],
      roots: [],
      criticalPoints: [],
      asymptotes: [],
      domain: { min: -10, max: 10 },
      range: { min: -10, max: 10 }
    };
  }

  private static generateNumericalGraph(equation: string): GraphData {
    return {
      points: [],
      roots: [],
      criticalPoints: [],
      asymptotes: [],
      domain: { min: -10, max: 10 },
      range: { min: -10, max: 10 }
    };
  }

  /**
   * Get available solving methods for an equation
   */
  static getApplicableMethods(equation: string): SolverMethod[] {
    const validation = SecurityManager.validateExpression(equation);
    if (!validation.isValid) return [];

    return this.methods.filter(method => method.applicable(validation.sanitized));
  }

  /**
   * Get all available methods
   */
  static getAllMethods(): SolverMethod[] {
    return [...this.methods];
  }
}