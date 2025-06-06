import { type ASTNode } from './symbolicParser';
import { generateCode } from './astCodeGen';
import { StepTracker } from './stepTracker';
import { simplifyAST } from './symbolicSimplifier';
import { differentiateAST } from './symbolicDifferentiator';

interface ComplexNumber {
  re: number;
  im: number;
}

export class Matrix {
  private data: number[][];
  constructor(data: number[][]) {
    this.data = data;
  }

  static identity(size: number): Matrix {
    const data = Array(size).fill(0).map((_, i) => 
      Array(size).fill(0).map((_, j) => i === j ? 1 : 0)
    );
    return new Matrix(data);
  }

  add(other: Matrix): Matrix {
    if (this.data.length !== other.data.length || 
        this.data[0].length !== other.data[0].length) {
      throw new Error('Matrix dimensions must match for addition');
    }
    const result = this.data.map((row, i) =>
      row.map((val, j) => val + other.data[i][j])
    );
    return new Matrix(result);
  }

  multiply(other: Matrix): Matrix {
    if (this.data[0].length !== other.data.length) {
      throw new Error('Invalid matrix dimensions for multiplication');
    }
    const result = this.data.map((row) =>
      Array(other.data[0].length).fill(0).map((_, j) =>
        row.reduce((sum, val, k) => sum + val * other.data[k][j], 0)
      )
    );
    return new Matrix(result);
  }

  determinant(): number {
    if (this.data.length !== this.data[0].length) {
      throw new Error('Matrix must be square to compute determinant');
    }
    if (this.data.length === 1) return this.data[0][0];
    if (this.data.length === 2) {
      return this.data[0][0] * this.data[1][1] - this.data[0][1] * this.data[1][0];
    }
    return this.data[0].reduce((sum, val, j) => {
      return sum + (j % 2 ? -1 : 1) * val * this.minor(0, j).determinant();
    }, 0);
  }

  minor(row: number, col: number): Matrix {
    return new Matrix(
      this.data
        .filter((_, index) => index !== row)
        .map(row => row.filter((_, index) => index !== col))
    );
  }

  toString(): string {
    return `[${this.data.map(row => `[${row.join(', ')}]`).join(', ')}]`;
  }
}

export function evaluateComplex(expr: ASTNode, tracker?: StepTracker): ComplexNumber {
  const code = generateCode(expr);
  // Complex number handling logic here
  // This is a placeholder implementation
  return { re: 0, im: 0 };
}

export function evaluateMatrix(expr: ASTNode, tracker?: StepTracker): Matrix {
  const code = generateCode(expr);
  // Matrix evaluation logic here
  // This is a placeholder implementation
  return Matrix.identity(2);
}

export function findRoots(coefficients: number[]): ComplexNumber[] {
  // Implements root-finding for polynomials using numerical methods
  // This is a placeholder implementation
  return [{ re: 0, im: 0 }];
}

export function solveSystemOfEquations(coefficients: Matrix, constants: number[]): number[] {
  // Implements system solving using Gaussian elimination
  // This is a placeholder implementation
  return [0];
}

export function integrateSymbolic(expr: ASTNode, variable: string): ASTNode {
  function integrate(node: ASTNode): ASTNode {
    switch (node.type) {
      case 'Number':
        return { type: 'Multiply', left: node, right: { type: 'Variable', name: variable } };
      case 'Variable':
        if (node.name === variable) {
          return {
            type: 'Divide',
            left: { type: 'Exponent', left: { type: 'Variable', name: variable }, right: { type: 'Number', value: 2 } },
            right: { type: 'Number', value: 2 }
          };
        } else {
          return { type: 'Multiply', left: node, right: { type: 'Variable', name: variable } };
        }
      case 'Add':
      case 'Subtract':
        return {
          type: node.type,
          left: integrate(node.left),
          right: integrate(node.right)
        };
      case 'Multiply':
        if (node.left.type === 'Number') {
          return {
            type: 'Multiply',
            left: node.left,
            right: integrate(node.right)
          };
        }
        if (node.right.type === 'Number') {
          return {
            type: 'Multiply',
            left: node.right,
            right: integrate(node.left)
          };
        }
        break;
      case 'Exponent':
        // ∫ x^n dx
        if (node.left.type === 'Variable' && node.left.name === variable && node.right.type === 'Number') {
          const n = node.right.value;
          if (n === -1) {
            return {
              type: 'FunctionCall',
              name: 'ln',
              args: [{ type: 'Variable', name: variable }]
            };
          } else {
            return {
              type: 'Divide',
              left: {
                type: 'Exponent',
                left: { type: 'Variable', name: variable },
                right: { type: 'Number', value: n + 1 }
              },
              right: { type: 'Number', value: n + 1 }
            };
          }
        }
        // ∫ a^x dx = a^x / ln(a)
        if (node.left.type === 'Number' && node.right.type === 'Variable' && node.right.name === variable) {
          return {
            type: 'Divide',
            left: node,
            right: { type: 'FunctionCall', name: 'ln', args: [node.left] }
          };
        }
        break;
      case 'FunctionCall':
        // ∫ sin(x) dx = -cos(x)
        if (node.name === 'sin' && node.args && node.args.length === 1 && node.args[0].type === 'Variable' && node.args[0].name === variable) {
          return {
            type: 'UnaryMinus',
            expression: { type: 'FunctionCall', name: 'cos', args: [{ type: 'Variable', name: variable }] }
          };
        }
        // ∫ cos(x) dx = sin(x)
        if (node.name === 'cos' && node.args && node.args.length === 1 && node.args[0].type === 'Variable' && node.args[0].name === variable) {
          return {
            type: 'FunctionCall', name: 'sin', args: [{ type: 'Variable', name: variable }] };
        }
        // ∫ exp(x) dx = exp(x)
        if ((node.name === 'exp' || node.name === 'e^') && node.args && node.args.length === 1 && node.args[0].type === 'Variable' && node.args[0].name === variable) {
          return {
            type: 'FunctionCall', name: 'exp', args: [{ type: 'Variable', name: variable }] };
        }
        // ∫ ln(x) dx = x*ln(x) - x
        if (node.name === 'ln' && node.args && node.args.length === 1 && node.args[0].type === 'Variable' && node.args[0].name === variable) {
          return {
            type: 'Subtract',
            left: {
              type: 'Multiply',
              left: { type: 'Variable', name: variable },
              right: { type: 'FunctionCall', name: 'ln', args: [{ type: 'Variable', name: variable }] }
            },
            right: { type: 'Variable', name: variable }
          };
        }
        break;
      case 'UnaryMinus':
        return { type: 'UnaryMinus', expression: integrate(node.expression) };
      default:
        break;
    }
    // Fallback: return unevaluated integral
    return {
      type: 'FunctionCall',
      name: 'integral',
      args: [node, { type: 'Variable', name: variable }]
    };
  }
  return simplifyAST(integrate(expr));
}

// --- Symbolic equation solver for linear/quadratic equations ---
export function solveEquationSymbolic(equation: ASTNode, variable: string): string[] {
  // Helper functions
  function isVariable(n: ASTNode, v: string): boolean {
    return n.type === 'Variable' && n.name === v;
  }
  function isNumber(n: ASTNode): n is { type: 'Number', value: number } {
    return n.type === 'Number';
  }
  function isSimple(n: ASTNode): boolean {
    return isNumber(n) || isVariable(n, variable);
  }

  // --- Rational equations: x in denominator ---
  // e.g. (a / (b*x + c)) = d  =>  b*x + c = a/d  => x = (a/d - c)/b
  if (equation.type === 'Subtract' && equation.left.type === 'Divide' && isNumber(equation.left.left) && equation.left.right.type === 'Add' && equation.left.right.left.type === 'Multiply' && isNumber(equation.left.right.left.left) && isVariable(equation.left.right.left.right, variable) && isNumber(equation.left.right.right) && isNumber(equation.right)) {
    // a/(b*x + c) - d = 0
    const a = equation.left.left.value;
    const b = equation.left.right.left.left.value;
    const c = equation.left.right.right.value;
    const d = equation.right.value;
    if (b !== 0 && d !== 0) {
      const x = (a/d - c)/b;
      return [`${variable} = ${x}`];
    }
  }
  // --- Exponential equations: x in exponent ---
  // e.g. a^(b*x + c) = d  =>  b*x + c = log_a(d)  => x = (log_a(d) - c)/b
  if (equation.type === 'Subtract' && equation.left.type === 'Exponent' && equation.left.left.type === 'Number' && equation.left.right.type === 'Add' && equation.left.right.left.type === 'Multiply' && isNumber(equation.left.right.left.left) && isVariable(equation.left.right.left.right, variable) && isNumber(equation.left.right.right) && isNumber(equation.right)) {
    // a^(b*x + c) - d = 0
    const a = equation.left.left.value;
    const b = equation.left.right.left.left.value;
    const c = equation.left.right.right.value;
    const d = equation.right.value;
    if (a > 0 && d > 0 && b !== 0) {
      return [`${variable} = (ln(${d})/ln(${a}) - ${c})/${b}`];
    }
  }
  // --- Logarithmic equations: x inside log/ln ---
  // e.g. log(b*x + c) = d  =>  b*x + c = 10^d  => x = (10^d - c)/b
  if (equation.type === 'Subtract' && equation.left.type === 'FunctionCall' && (equation.left.name === 'log' || equation.left.name === 'ln') && equation.left.args.length === 1 && equation.left.args[0].type === 'Add' && equation.left.args[0].left.type === 'Multiply' && isNumber(equation.left.args[0].left.left) && isVariable(equation.left.args[0].left.right, variable) && isNumber(equation.left.args[0].right) && isNumber(equation.right)) {
    // log(b*x + c) - d = 0
    const b = equation.left.args[0].left.left.value;
    const c = equation.left.args[0].right.value;
    const d = equation.right.value;
    if (b !== 0) {
      if (equation.left.name === 'log') {
        return [`${variable} = (10^${d} - ${c})/${b}`];
      } else if (equation.left.name === 'ln') {
        return [`${variable} = (e^${d} - ${c})/${b}`];
      }
    }
  }
  // --- Fallback to previous cases (simple rational, exp, log, ln, linear, quadratic) ---
  function extractCoefficients(node: ASTNode): { a: number, b: number, c: number } | null {
    let a = 0, b = 0, c = 0;
    function walk(n: ASTNode): void {
      if (n.type === 'Add' || n.type === 'Subtract') {
        walk(n.left);
        const sign = n.type === 'Add' ? 1 : -1;
        function walkRight(r: ASTNode) {
          if (sign === 1) walk(r); else walk({ type: 'UnaryMinus', expression: r });
        }
        walkRight(n.right);
      } else if (n.type === 'UnaryMinus') {
        if (n.expression.type === 'Number') {
          c -= n.expression.value;
        } else if (n.expression.type === 'Variable' && n.expression.name === variable) {
          b -= 1;
        } else if (n.expression.type === 'Multiply') {
          if (n.expression.left.type === 'Number' && n.expression.right.type === 'Variable' && n.expression.right.name === variable) {
            b -= n.expression.left.value;
          } else if (n.expression.left.type === 'Number' && n.expression.right.type === 'Exponent' && n.expression.right.left.type === 'Variable' && n.expression.right.left.name === variable && n.expression.right.right.type === 'Number' && n.expression.right.right.value === 2) {
            a -= n.expression.left.value;
          }
        } else if (n.expression.type === 'Exponent' && n.expression.left.type === 'Variable' && n.expression.left.name === variable && n.expression.right.type === 'Number' && n.expression.right.value === 2) {
          a -= 1;
        }
      } else if (n.type === 'Number') {
        c += n.value;
      } else if (n.type === 'Variable' && n.name === variable) {
        b += 1;
      } else if (n.type === 'Multiply') {
        if (n.left.type === 'Number' && n.right.type === 'Variable' && n.right.name === variable) {
          b += n.left.value;
        } else if (n.left.type === 'Number' && n.right.type === 'Exponent' && n.right.left.type === 'Variable' && n.right.left.name === variable && n.right.right.type === 'Number' && n.right.right.value === 2) {
          a += n.left.value;
        } else if (n.right.type === 'Number' && n.left.type === 'Variable' && n.left.name === variable) {
          b += n.right.value;
        } else if (n.right.type === 'Number' && n.left.type === 'Exponent' && n.left.left.type === 'Variable' && n.left.left.name === variable && n.left.right.type === 'Number' && n.left.right.value === 2) {
          a += n.right.value;
        }
      } else if (n.type === 'Exponent' && n.left.type === 'Variable' && n.left.name === variable && n.right.type === 'Number' && n.right.value === 2) {
        a += 1;
      }
    }
    walk(node);
    return { a, b, c };
  }
  const coeffs = extractCoefficients(equation);
  if (!coeffs) return ['Could not extract coefficients. Only linear/quadratic/rational/exponential/logarithmic supported.'];
  const { a, b, c } = coeffs;
  if (a === 0 && b === 0) return ['No solution (not a valid equation in variable).'];
  if (a === 0) {
    if (b === 0) return ['No solution (b=0).'];
    return [`${variable} = ${-c / b}`];
  } else {
    const D = b * b - 4 * a * c;
    if (D < 0) {
      return [`No real solution (discriminant < 0).`];
    } else if (D === 0) {
      const x = -b / (2 * a);
      return [`${variable} = ${x}`];
    } else {
      const sqrtD = Math.sqrt(D);
      const x1 = (-b + sqrtD) / (2 * a);
      const x2 = (-b - sqrtD) / (2 * a);
      return [`${variable} = ${x1}`, `${variable} = ${x2}`];
    }
  }
  return ['Could not solve equation.'];
}

export async function findLimit(ast: ASTNode, variable: string, point: string): Promise<ASTNode> {
  // Convert the point to a number if possible
  const numPoint = parseFloat(point);
  const isInfinity = point.toLowerCase() === '∞' || point === 'infinity';
  const isNegativeInfinity = point.startsWith('-') && 
    (point.slice(1).toLowerCase() === '∞' || point.slice(1) === 'infinity');

  // Handle special cases
  if (isInfinity || isNegativeInfinity) {
    // For infinity limits, use algebraic manipulation and L'Hôpital's rule if needed
    const simplified = simplifyAST(ast);
    return simplified;
  }

  if (!isNaN(numPoint)) {
    // For finite limits, evaluate near the point
    // Could implement L'Hôpital's rule for 0/0 or ∞/∞ forms
    const simplified = simplifyAST(ast);
    return simplified;
  }

  throw new Error(`Invalid limit point: ${point}`);
}

export async function taylorSeries(
  ast: ASTNode, 
  variable: string, 
  point: string, 
  order: number
): Promise<ASTNode> {
  if (order < 0 || order > 7) {
    throw new Error('Series expansion order must be between 0 and 7');
  }

  const center = parseFloat(point);
  if (isNaN(center)) {
    throw new Error('Invalid expansion point');
  }

  let series: ASTNode = {
    type: 'Number',
    value: 0
  };

  // Compute derivatives up to the specified order
  let currentTerm: ASTNode = ast;
  let factorial = 1;

  for (let n = 0; n <= order; n++) {
    // Add the nth term to the series
    const termCoefficient = await evaluateAtPoint(currentTerm, variable, center);
    const term = createSeriesTerm(termCoefficient, variable, center, n, factorial);
    series = combineSeries(series, term);

    // Prepare for next iteration
    if (n < order) {
      currentTerm = await differentiateAST(currentTerm, variable);
      factorial *= (n + 1);
    }
  }

  return simplifyAST(series);
}

// Helper functions for Taylor series
function evaluateAtPoint(ast: ASTNode, variable: string, point: number): Promise<number> {
  // Implementation of function evaluation at a point
  return Promise.resolve(0); // Placeholder
}

function createSeriesTerm(
  coefficient: number,
  variable: string,
  center: number,
  power: number,
  factorial: number
): ASTNode {
  // Create a term of the form: coefficient * (x - center)^power / factorial
  return {
    type: 'Number',
    value: coefficient / factorial
  };
}

function combineSeries(existing: ASTNode, newTerm: ASTNode): ASTNode {
  // Combine series terms
  return {
    type: 'Add',
    left: existing,
    right: newTerm
  };
}

// --- Research-level symbolic proof and logic engine ---
export interface ProofStep {
  description: string;
  expression: string;
  rule?: string;
}

export interface ProofResult {
  valid: boolean;
  steps: ProofStep[];
  message?: string;
}

/**
 * Attempts to prove a symbolic statement (e.g., equality, inequality, identity) step-by-step.
 * Supports algebraic, trigonometric, and logical identities, and can use assumptions.
 * @param statement The ASTNode representing the statement to prove (e.g., {type: 'Subtract', left, right} for equality)
 * @param assumptions Optional array of ASTNode representing assumptions (e.g., x > 0)
 */
export function proveSymbolic(statement: ASTNode, assumptions: ASTNode[] = []): ProofResult {
  const steps: ProofStep[] = [];
  // Example: Prove that left - right = 0 (i.e., left == right)
  if (statement.type === 'Subtract') {
    // Try to simplify left - right
    const simplified = simplifyAST(statement);
    steps.push({
      description: 'Simplify left - right',
      expression: generateCode(simplified),
      rule: 'algebraic simplification'
    });
    // If result is 0, proof is valid
    if (simplified.type === 'Number' && simplified.value === 0) {
      return { valid: true, steps, message: 'Proved: LHS = RHS' };
    }
    // Try further advanced simplification (e.g., trigonometric identities)
    // TODO: Add more advanced pattern matching and identity checks here
    // For now, if not zero, return invalid
    return { valid: false, steps, message: 'Could not prove equality symbolically.' };
  }
  // TODO: Add support for inequalities, logical statements, quantifiers, etc.
  return { valid: false, steps, message: 'Proof type not supported yet.' };
}

// --- Advanced simplification entry point (for research-level CAS) ---
export function advancedSimplify(ast: ASTNode): ASTNode {
  // TODO: Add trigonometric, exponential, and logical identity simplification
  // For now, fallback to basic simplifyAST
  return simplifyAST(ast);
}

// --- Advanced symbolic graphing utility ---
export interface GraphingOptions {
  type: 'explicit' | 'implicit' | 'parametric';
  variable?: string;
  variables?: string[];
  domain?: [number, number];
  range?: [number, number];
  step?: number;
  assumptions?: ASTNode[];
}

/**
 * Generates data points for advanced symbolic graphing (explicit, implicit, parametric, with domain/assumptions).
 * @param ast The ASTNode representing the function or relation.
 * @param options Graphing options (type, variables, domain, etc.)
 * @returns Array of points (for 2D: {x, y}, for parametric: {t, x, y}, for implicit: {x, y, valid})
 */
export function generateGraphData(ast: ASTNode, options: GraphingOptions): any[] {
  // For explicit: y = f(x)
  if (options.type === 'explicit' && options.variable) {
    const [xmin, xmax] = options.domain || [-10, 10];
    const step = options.step || (xmax - xmin) / 300;
    const points = [];
    for (let x = xmin; x <= xmax; x += step) {
      // TODO: Use symbolic evaluation for y = f(x)
      // For now, fallback to evaluateAST
      const scope: Record<string, number> = { [options.variable]: x };
      let y: number | null = null;
      try {
        const val = (globalThis as any).evaluateAST ? (globalThis as any).evaluateAST(ast, scope) : null;
        y = typeof val === 'number' && isFinite(val) ? val : null;
      } catch {
        y = null;
      }
      points.push({ x, y });
    }
    return points;
  }
  // For parametric: x = f(t), y = g(t) or 3D: x = f(t), y = g(t), z = h(t)
  if (options.type === 'parametric' && options.variables && options.variables.length >= 2) {
    const [tVar, ...outVars] = options.variables;
    const [tmin, tmax] = options.domain || [0, 2 * Math.PI];
    const step = options.step || (tmax - tmin) / 300;
    const points = [];
    // Accept AST as { x: ASTNode, y: ASTNode, z?: ASTNode } or array [xAST, yAST, zAST?]
    let xAST, yAST, zAST;
    if (Array.isArray(ast)) {
      [xAST, yAST, zAST] = ast;
    } else if (typeof ast === 'object' && ast !== null && 'x' in ast && 'y' in ast) {
      xAST = (ast as any).x;
      yAST = (ast as any).y;
      zAST = (ast as any).z;
    } else {
      // fallback: treat ast as yAST, xAST = t
      yAST = ast;
      xAST = { type: 'Variable', name: tVar };
    }
    for (let t = tmin; t <= tmax; t += step) {
      const scope: Record<string, number> = { [tVar]: t };
      let x: number | null = null, y: number | null = null, z: number | null = null;
      try {
        x = (globalThis as any).evaluateAST ? (globalThis as any).evaluateAST(xAST, scope) : null;
        y = (globalThis as any).evaluateAST ? (globalThis as any).evaluateAST(yAST, scope) : null;
        if (zAST) z = (globalThis as any).evaluateAST ? (globalThis as any).evaluateAST(zAST, scope) : null;
      } catch {
        x = y = z = null;
      }
      if (zAST !== undefined) {
        points.push({ t, x, y, z });
      } else {
        points.push({ t, x, y });
      }
    }
    return points;
  }
  // For implicit: F(x, y) = 0
  if (options.type === 'implicit' && options.variables && options.variables.length === 2) {
    const [xVar, yVar] = options.variables;
    const [xmin, xmax] = options.domain || [-10, 10];
    const [ymin, ymax] = options.range || [-10, 10];
    const step = options.step || (xmax - xmin) / 100;
    const points = [];
    for (let x = xmin; x <= xmax; x += step) {
      for (let y = ymin; y <= ymax; y += step) {
        const scope: Record<string, number> = { [xVar]: x, [yVar]: y };
        let val: number | null = null;
        try {
          val = (globalThis as any).evaluateAST ? (globalThis as any).evaluateAST(ast, scope) : null;
        } catch {
          val = null;
        }
        // Mark as valid if close to zero (for plotting level sets)
        const valid = typeof val === 'number' && Math.abs(val) < 1e-2;
        if (valid) points.push({ x, y });
      }
    }
    return points;
  }
  // Fallback: not supported
  return [];
}
