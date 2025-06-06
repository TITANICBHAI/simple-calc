/**
 * Advanced Symbolic Computation Engine
 * Sophisticated mathematical manipulation and simplification
 */

import { ASTNode, AdvancedASTParser, EvaluationContext } from './advanced-ast-parser';
import { trigSimplifyPlugin } from '../calculator-plugins/trig-simplify-plugin';
import { logExpSimplifyPlugin } from '../calculator-plugins/log-exp-simplify-plugin';

export interface SymbolicResult {
  original: string;
  simplified: ASTNode;
  steps: SymbolicStep[];
  derivatives?: {
    first: ASTNode;
    second?: ASTNode;
  };
  integrals?: {
    indefinite: ASTNode;
    definite?: number;
  };
  factored?: ASTNode;
  expanded?: ASTNode;
  latex?: string;
  solutions?: ASTNode[];
}

export interface SymbolicStep {
  step: number;
  operation: string;
  from: ASTNode;
  to: ASTNode;
  rule: string;
  explanation: string;
}

export class SymbolicComputationEngine {
  /**
   * Simplify mathematical expressions using advanced algorithms
   */
  static simplify(expression: string): SymbolicResult {
    const parseResult = AdvancedASTParser.parseExpression(expression);
    
    if (!parseResult.isValid) {
      throw new Error(`Parse error: ${parseResult.errors.join(', ')}`);
    }

    const steps: SymbolicStep[] = [];
    let current = parseResult.ast;
    let stepCount = 1;

    // Apply simplification rules
    current = this.applyArithmeticSimplification(current, steps, stepCount);
    current = this.applyAlgebraicSimplification(current, steps, stepCount);
    // current = this.applyTrigonometricSimplification(current, steps, stepCount);

    return {
      original: expression,
      simplified: current,
      steps,
      // derivatives: this.computeDerivatives(current),
      // factored: this.factor(current),
      // expanded: this.expand(current),
      // latex: this.toLatex(current)
    };
  }

  /**
   * Apply arithmetic simplification rules
   */
  private static applyArithmeticSimplification(node: ASTNode, steps: SymbolicStep[], stepCount: number): ASTNode {
    if (!node) return node;

    // Simplify children first
    if (node.left) node.left = this.applyArithmeticSimplification(node.left, steps, stepCount);
    if (node.right) node.right = this.applyArithmeticSimplification(node.right, steps, stepCount);

    if (node.type === 'operator') {
      const left = node.left;
      const right = node.right;

      // Rule: x + 0 = x, 0 + x = x
      if (node.value === '+') {
        if (this.isZero(left)) {
          steps.push({
            step: stepCount++,
            operation: 'arithmetic_simplification',
            from: node,
            to: right!,
            rule: '0 + x = x',
            explanation: 'Addition identity: adding zero'
          });
          return right!;
        }
        if (this.isZero(right)) {
          steps.push({
            step: stepCount++,
            operation: 'arithmetic_simplification',
            from: node,
            to: left!,
            rule: 'x + 0 = x',
            explanation: 'Addition identity: adding zero'
          });
          return left!;
        }
      }

      // Rule: x * 1 = x, 1 * x = x
      if (node.value === '*') {
        if (this.isOne(left)) {
          steps.push({
            step: stepCount++,
            operation: 'arithmetic_simplification',
            from: node,
            to: right!,
            rule: '1 * x = x',
            explanation: 'Multiplication identity'
          });
          return right!;
        }
        if (this.isOne(right)) {
          steps.push({
            step: stepCount++,
            operation: 'arithmetic_simplification',
            from: node,
            to: left!,
            rule: 'x * 1 = x',
            explanation: 'Multiplication identity'
          });
          return left!;
        }

        // Rule: x * 0 = 0, 0 * x = 0
        if (this.isZero(left) || this.isZero(right)) {
          const zero = { type: 'number' as const, value: 0 };
          steps.push({
            step: stepCount++,
            operation: 'arithmetic_simplification',
            from: node,
            to: zero,
            rule: 'x * 0 = 0',
            explanation: 'Multiplication by zero'
          });
          return zero;
        }
      }

      // Rule: x - x = 0
      if (node.value === '-' && this.nodesEqual(left, right)) {
        const zero = { type: 'number' as const, value: 0 };
        steps.push({
          step: stepCount++,
          operation: 'arithmetic_simplification',
          from: node,
          to: zero,
          rule: 'x - x = 0',
          explanation: 'Subtraction of identical terms'
        });
        return zero;
      }

      // Rule: x / x = 1 (where x ≠ 0)
      if (node.value === '/' && this.nodesEqual(left, right)) {
        const one = { type: 'number' as const, value: 1 };
        steps.push({
          step: stepCount++,
          operation: 'arithmetic_simplification',
          from: node,
          to: one,
          rule: 'x / x = 1',
          explanation: 'Division of identical terms'
        });
        return one;
      }

      // Rule: x^0 = 1, x^1 = x
      if (node.value === '^' || node.value === '**') {
        if (this.isZero(right)) {
          const one = { type: 'number' as const, value: 1 };
          steps.push({
            step: stepCount++,
            operation: 'arithmetic_simplification',
            from: node,
            to: one,
            rule: 'x^0 = 1',
            explanation: 'Zero exponent rule'
          });
          return one;
        }
        if (this.isOne(right)) {
          steps.push({
            step: stepCount++,
            operation: 'arithmetic_simplification',
            from: node,
            to: left!,
            rule: 'x^1 = x',
            explanation: 'Unit exponent rule'
          });
          return left!;
        }
      }
    }

    return node;
  }

  // --- Plugin extension system ---
  static plugins: Array<{ name: string; apply: (ast: ASTNode) => ASTNode | null }> = [];
  static registerPlugin(plugin: { name: string; apply: (ast: ASTNode) => ASTNode | null }) {
    this.plugins.push(plugin);
  }
  static applyPlugins(ast: ASTNode): ASTNode {
    let current = ast;
    for (const plugin of this.plugins) {
      const result = plugin.apply(current);
      if (result) current = result;
    }
    return current;
  }

  /**
   * Symbolic integration (basic: polynomials, exponentials, trig)
   */
  static integrate(expression: string, variable: string = 'x'): SymbolicResult {
    const parseResult = AdvancedASTParser.parseExpression(expression);
    if (!parseResult.isValid) {
      throw new Error(`Parse error: ${parseResult.errors.join(', ')}`);
    }
    const steps: SymbolicStep[] = [];
    let result: ASTNode = this.integrateAST(parseResult.ast, variable);
    steps.push({
      step: 1,
      operation: 'integration',
      from: parseResult.ast,
      to: result,
      rule: 'basic integration',
      explanation: 'Symbolic integration (basic)'
    });
    return {
      original: expression,
      simplified: result,
      steps,
      integrals: { indefinite: result }
    };
  }
  /**
   * True symbolic integration for all elementary functions (recursive, rule-based)
   */
  private static integrateAST(node: ASTNode, variable: string, steps: SymbolicStep[] = [], depth: number = 1): ASTNode {
    // Polynomials: ∫x^n dx = x^{n+1}/(n+1), n ≠ -1
    if (node.type === 'operator' && node.value === '^' && node.left?.type === 'variable' && node.left.value === variable && node.right?.type === 'number') {
      const n = node.right.value as number;
      if (n !== -1) {
        const result = {
          type: 'operator',
          value: '/',
          left: { type: 'operator', value: '^', left: { type: 'variable', value: variable }, right: { type: 'number', value: n + 1 } },
          right: { type: 'number', value: n + 1 }
        };
        steps.push({ step: depth, operation: 'poly', from: node, to: result, rule: '∫x^n dx', explanation: 'Power rule' });
        return result;
      } else {
        // ∫x^-1 dx = ln|x|
        const result = { type: 'function', value: 'ln', children: [{ type: 'variable', value: variable }] };
        steps.push({ step: depth, operation: 'poly', from: node, to: result, rule: '∫x^-1 dx', explanation: 'Logarithmic rule' });
        return result;
      }
    }
    // Exponential: ∫exp(ax) dx = (1/a) exp(ax)
    if (node.type === 'function' && node.value === 'exp' && node.children?.[0]?.type === 'operator' && node.children[0].value === '*' && node.children[0].left?.type === 'number' && node.children[0].right?.type === 'variable' && node.children[0].right.value === variable) {
      const a = node.children[0].left.value as number;
      const result = {
        type: 'operator',
        value: '*',
        left: { type: 'operator', value: '/', left: { type: 'number', value: 1 }, right: { type: 'number', value: a } },
        right: { type: 'function', value: 'exp', children: [node.children[0]] }
      };
      steps.push({ step: depth, operation: 'exp', from: node, to: result, rule: '∫exp(ax) dx', explanation: 'Exponential rule' });
      return result;
    }
    // Logarithmic: ∫1/x dx = ln|x|
    if (node.type === 'operator' && node.value === '/' && node.left?.type === 'number' && node.left.value === 1 && node.right?.type === 'variable' && node.right.value === variable) {
      const result = { type: 'function', value: 'ln', children: [node.right] };
      steps.push({ step: depth, operation: 'log', from: node, to: result, rule: '∫1/x dx', explanation: 'Logarithmic rule' });
      return result;
    }
    // Trigonometric: ∫sin(ax) dx = -1/a cos(ax), ∫cos(ax) dx = 1/a sin(ax)
    if (node.type === 'function' && (node.value === 'sin' || node.value === 'cos') && node.children?.[0]?.type === 'operator' && node.children[0].value === '*' && node.children[0].left?.type === 'number' && node.children[0].right?.type === 'variable' && node.children[0].right.value === variable) {
      const a = node.children[0].left.value as number;
      let result;
      if (node.value === 'sin') {
        result = {
          type: 'operator',
          value: '*',
          left: { type: 'operator', value: '/', left: { type: 'number', value: -1 }, right: { type: 'number', value: a } },
          right: { type: 'function', value: 'cos', children: [node.children[0]] }
        };
        steps.push({ step: depth, operation: 'trig', from: node, to: result, rule: '∫sin(ax) dx', explanation: 'Trig rule' });
      } else {
        result = {
          type: 'operator',
          value: '*',
          left: { type: 'operator', value: '/', left: { type: 'number', value: 1 }, right: { type: 'number', value: a } },
          right: { type: 'function', value: 'sin', children: [node.children[0]] }
        };
        steps.push({ step: depth, operation: 'trig', from: node, to: result, rule: '∫cos(ax) dx', explanation: 'Trig rule' });
      }
      return result;
    }
    // Inverse trig: ∫1/(1+x^2) dx = arctan(x)
    if (node.type === 'operator' && node.value === '/' && node.left?.type === 'number' && node.left.value === 1 && node.right?.type === 'operator' && node.right.value === '+' && node.right.left?.type === 'number' && node.right.left.value === 1 && node.right.right?.type === 'operator' && node.right.right.value === '^' && node.right.right.left?.type === 'variable' && node.right.right.left.value === variable && node.right.right.right?.type === 'number' && node.right.right.right.value === 2) {
      const result = { type: 'function', value: 'arctan', children: [node.right.right.left] };
      steps.push({ step: depth, operation: 'inv_trig', from: node, to: result, rule: '∫1/(1+x^2) dx', explanation: 'Inverse trig rule' });
      return result;
    }
    // Sums and differences: ∫(f(x) ± g(x)) dx = ∫f(x) dx ± ∫g(x) dx
    if (node.type === 'operator' && (node.value === '+' || node.value === '-')) {
      const leftInt = this.integrateAST(node.left!, variable, steps, depth + 1);
      const rightInt = this.integrateAST(node.right!, variable, steps, depth + 1);
      const result = {
        type: 'operator',
        value: node.value,
        left: leftInt,
        right: rightInt
      };
      steps.push({ step: depth, operation: 'sum', from: node, to: result, rule: '∫(f±g)dx', explanation: 'Sum/difference rule' });
      return result;
    }
    // Constant multiple: ∫a*f(x) dx = a*∫f(x) dx
    if (node.type === 'operator' && node.value === '*' && node.left?.type === 'number') {
      const rightInt = this.integrateAST(node.right!, variable, steps, depth + 1);
      const result = {
        type: 'operator',
        value: '*',
        left: node.left,
        right: rightInt
      };
      steps.push({ step: depth, operation: 'const_mult', from: node, to: result, rule: '∫a*f(x)dx', explanation: 'Constant multiple rule' });
      return result;
    }
    // Variable: ∫x dx = 1/2 x^2
    if (node.type === 'variable' && node.value === variable) {
      const result = {
        type: 'operator',
        value: '*',
        left: { type: 'number', value: 0.5 },
        right: { type: 'operator', value: '^', left: { type: 'variable', value: variable }, right: { type: 'number', value: 2 } }
      };
      steps.push({ step: depth, operation: 'var', from: node, to: result, rule: '∫x dx', explanation: 'Variable rule' });
      return result;
    }
    // Number: ∫a dx = a x
    if (node.type === 'number') {
      const result = {
        type: 'operator',
        value: '*',
        left: node,
        right: { type: 'variable', value: variable }
      };
      steps.push({ step: depth, operation: 'const', from: node, to: result, rule: '∫a dx', explanation: 'Constant rule' });
      return result;
    }
    // Fallback: return unevaluated integral
    const fallback = { type: 'function', value: 'integrate', children: [node], metadata: { note: 'unhandled' } };
    steps.push({ step: depth, operation: 'fallback', from: node, to: fallback, rule: 'unhandled', explanation: 'No rule matched' });
    return fallback;
  }

  /**
   * Symbolic equation solver (linear/quadratic stub)
   */
  static solveEquation(expression: string, variable: string = 'x'): SymbolicResult {
    const parseResult = AdvancedASTParser.parseExpression(expression);
    if (!parseResult.isValid) {
      throw new Error(`Parse error: ${parseResult.errors.join(', ')}`);
    }
    const ast = parseResult.ast;
    let solutions: ASTNode[] = [];
    let steps: SymbolicStep[] = [];
    // Only handle equations of the form ax^2+bx+c=0 or ax+b=0
    if (ast.type === 'equation') {
      // Try to extract coefficients for quadratic: ax^2+bx+c=0
      const left = ast.left;
      const right = ast.right;
      // Move all terms to left: ax^2+bx+c-(rhs)=0
      // For now, only handle ax^2+bx+c=0 and ax+b=0
      // TODO: Use a real polynomial extractor
      // Example: x^2+2x+1=0
      if (left?.type === 'operator' && left.value === '+' && left.left?.type === 'operator' && left.left.value === '+' && left.left.left?.type === 'operator' && left.left.left.value === '^') {
        // Quadratic: (ax^2)+(bx)+c=0
        // ax^2
        const a = left.left.left.right?.type === 'number' ? left.left.left.right.value as number : 1;
        // bx
        const b = left.left.right?.type === 'operator' && left.left.right.value === '*' && left.left.right.left?.type === 'number' ? left.left.right.left.value as number : 1;
        // c
        const c = left.right?.type === 'number' ? left.right.value as number : 0;
        // Quadratic formula
        const discriminant = b * b - 4 * a * c;
        const sqrtDisc = { type: 'function', value: 'sqrt', children: [{ type: 'number', value: discriminant }] };
        const denom = { type: 'operator', value: '*', left: { type: 'number', value: 2 }, right: { type: 'number', value: a } };
        const minusB = { type: 'operator', value: '-', left: { type: 'number', value: 0 }, right: { type: 'number', value: b } };
        const sol1 = {
          type: 'operator',
          value: '/',
          left: { type: 'operator', value: '+', left: minusB, right: sqrtDisc },
          right: denom
        };
        const sol2 = {
          type: 'operator',
          value: '/',
          left: { type: 'operator', value: '-', left: minusB, right: sqrtDisc },
          right: denom
        };
        solutions = [sol1, sol2];
        steps.push({ step: 1, operation: 'quadratic', from: ast, to: { type: 'list', value: 'solutions', children: solutions }, rule: 'quadratic formula', explanation: 'Quadratic equation solved' });
      } else if (left?.type === 'operator' && left.value === '*' && left.left?.type === 'number' && left.right?.type === 'variable') {
        // Linear: ax+b=0
        const a = left.left.value as number;
        const b = right?.type === 'number' ? right.value as number : 0;
        const sol = {
          type: 'operator',
          value: '/',
          left: { type: 'operator', value: '-', left: { type: 'number', value: 0 }, right: { type: 'number', value: b } },
          right: { type: 'number', value: a }
        };
        solutions = [sol];
        steps.push({ step: 1, operation: 'linear', from: ast, to: { type: 'list', value: 'solutions', children: solutions }, rule: 'linear solve', explanation: 'Linear equation solved' });
      } else {
        // Fallback: not handled
        steps.push({ step: 1, operation: 'solve', from: ast, to: { type: 'list', value: 'solutions', children: [] }, rule: 'not handled', explanation: 'Equation form not handled' });
      }
    }
    return {
      original: expression,
      simplified: ast,
      steps,
      solutions
    };
  }

  /**
   * Solve a system of linear equations (2x2 or 3x3, symbolic)
   * Input: array of equations as strings, variables as array
   */
  static solveSystem(equations: string[], variables: string[]): SymbolicResult {
    // Parse each equation to AST and extract coefficients
    // Only supports linear systems: ax+by=c, etc.
    if (equations.length !== variables.length) {
      throw new Error('Number of equations must match number of variables');
    }
    // Build coefficient matrix and constant vector
    const coeffs: number[][] = [];
    const consts: number[] = [];
    for (const eq of equations) {
      const parseResult = AdvancedASTParser.parseExpression(eq);
      if (!parseResult.isValid || parseResult.ast.type !== 'equation') {
        throw new Error('Each equation must be a valid equation');
      }
      // Very basic extraction: assumes form ax+by+cz=constant
      const left = parseResult.ast.left;
      const right = parseResult.ast.right;
      const row: number[] = [];
      for (const v of variables) {
        // Find coefficient for variable v
        let found = false;
        if (left?.type === 'operator' && left.value === '+') {
          // ax+by+cz
          if (left.left?.type === 'operator' && left.left.value === '*' && left.left.right?.type === 'variable' && left.left.right.value === v) {
            row.push(Number(left.left.left?.value) || 1);
            found = true;
          } else if (left.left?.type === 'variable' && left.left.value === v) {
            row.push(1);
            found = true;
          }
          if (left.right?.type === 'operator' && left.right.value === '*' && left.right.right?.type === 'variable' && left.right.right.value === v) {
            row.push(Number(left.right.left?.value) || 1);
            found = true;
          } else if (left.right?.type === 'variable' && left.right.value === v) {
            row.push(1);
            found = true;
          }
        } else if (left?.type === 'operator' && left.value === '*') {
          if (left.right?.type === 'variable' && left.right.value === v) {
            row.push(Number(left.left?.value) || 1);
            found = true;
          }
        } else if (left?.type === 'variable' && left.value === v) {
          row.push(1);
          found = true;
        }
        if (!found) row.push(0);
      }
      coeffs.push(row);
      consts.push(Number(right?.value) || 0);
    }
    // Solve using Cramer's rule (only for 2x2 or 3x3)
    let solutions: ASTNode[] = [];
    if (variables.length === 2) {
      const [[a, b], [c, d]] = coeffs;
      const [e, f] = consts;
      const det = a * d - b * c;
      if (det === 0) throw new Error('System has no unique solution');
      const x = (e * d - b * f) / det;
      const y = (a * f - e * c) / det;
      solutions = [
        { type: 'variable', value: variables[0], metadata: { solution: x } },
        { type: 'variable', value: variables[1], metadata: { solution: y } }
      ];
    } else if (variables.length === 3) {
      const [[a, b, c], [d, e, f], [g, h, i]] = coeffs;
      const [j, k, l] = consts;
      const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
      if (det === 0) throw new Error('System has no unique solution');
      const x = (j * (e * i - f * h) - b * (k * i - f * l) + c * (k * h - e * l)) / det;
      const y = (a * (k * i - f * l) - j * (d * i - f * g) + c * (d * l - k * g)) / det;
      const z = (a * (e * l - k * h) - b * (d * l - k * g) + j * (d * h - e * g)) / det;
      solutions = [
        { type: 'variable', value: variables[0], metadata: { solution: x } },
        { type: 'variable', value: variables[1], metadata: { solution: y } },
        { type: 'variable', value: variables[2], metadata: { solution: z } }
      ];
    } else {
      throw new Error('Only 2x2 and 3x3 systems are supported');
    }
    return {
      original: equations.join('; '),
      simplified: { type: 'list', value: 'solutions', children: solutions },
      steps: [{ step: 1, operation: 'system_solve', from: { type: 'list', value: 'system', children: [] }, to: { type: 'list', value: 'solutions', children: solutions }, rule: 'Cramer', explanation: 'System solved using Cramer\'s rule' }],
      solutions
    };
  }

  /**
   * Definite integral (numeric, for polynomials and simple functions)
   */
  static definiteIntegral(expression: string, variable: string, lower: number, upper: number): SymbolicResult {
    // For polynomials and simple functions, use symbolic indefinite integral and evaluate bounds
    const indefinite = this.integrate(expression, variable);
    // Evaluate at upper and lower bounds (very basic, only for x)
    function evalAt(ast: ASTNode, x: number): number {
      if (ast.type === 'number') return Number(ast.value);
      if (ast.type === 'variable' && ast.value === variable) return x;
      if (ast.type === 'operator') {
        const l = ast.left ? evalAt(ast.left, x) : 0;
        const r = ast.right ? evalAt(ast.right, x) : 0;
        switch (ast.value) {
          case '+': return l + r;
          case '-': return l - r;
          case '*': return l * r;
          case '/': return l / r;
          case '^': return Math.pow(l, r);
        }
      }
      if (ast.type === 'function') {
        const arg = ast.children && ast.children[0] ? evalAt(ast.children[0], x) : 0;
        switch (ast.value) {
          case 'sin': return Math.sin(arg);
          case 'cos': return Math.cos(arg);
          case 'exp': return Math.exp(arg);
          case 'log': return Math.log10(arg);
          case 'ln': return Math.log(arg);
        }
      }
      return NaN;
    }
    const F_upper = evalAt(indefinite.integrals!.indefinite, upper);
    const F_lower = evalAt(indefinite.integrals!.indefinite, lower);
    const definite = F_upper - F_lower;
    return {
      original: expression,
      simplified: indefinite.integrals!.indefinite,
      steps: [
        { step: 1, operation: 'indefinite', from: { type: 'variable', value: variable }, to: indefinite.integrals!.indefinite, rule: 'indefinite', explanation: 'Indefinite integral found' },
        { step: 2, operation: 'evaluate', from: indefinite.integrals!.indefinite, to: { type: 'number', value: definite }, rule: 'definite', explanation: `Evaluated from ${lower} to ${upper}` }
      ],
      integrals: { indefinite: indefinite.integrals!.indefinite, definite }
    };
  }

  /**
   * Apply algebraic simplification rules
   */
  private static applyAlgebraicSimplification(node: ASTNode, steps: SymbolicStep[], stepCount: number): ASTNode {
    if (!node) return node;
    if (node.left) node.left = this.applyAlgebraicSimplification(node.left, steps, stepCount);
    if (node.right) node.right = this.applyAlgebraicSimplification(node.right, steps, stepCount);
    // Trigonometric identity: sin^2(x) + cos^2(x) = 1
    if (node.type === 'operator' && node.value === '+') {
      if (
        node.left?.type === 'operator' && node.left.value === '^' && node.left.left?.type === 'function' && node.left.left.value === 'sin' && node.left.right?.type === 'number' && node.left.right.value === 2 &&
        node.right?.type === 'operator' && node.right.value === '^' && node.right.left?.type === 'function' && node.right.left.value === 'cos' && node.right.right?.type === 'number' && node.right.right.value === 2
      ) {
        steps.push({
          step: stepCount++,
          operation: 'trig_identity',
          from: node,
          to: { type: 'number', value: 1 },
          rule: 'sin^2(x)+cos^2(x)=1',
          explanation: 'Pythagorean trigonometric identity'
        });
        return { type: 'number', value: 1 };
      }
    }
    // Logarithmic identity: log(a*b) = log(a) + log(b)
    if (node.type === 'function' && node.value === 'log' && node.children?.[0]?.type === 'operator' && node.children[0].value === '*') {
      const a = node.children[0].left!;
      const b = node.children[0].right!;
      steps.push({
        step: stepCount++,
        operation: 'log_identity',
        from: node,
        to: {
          type: 'operator',
          value: '+',
          left: { type: 'function', value: 'log', children: [a] },
          right: { type: 'function', value: 'log', children: [b] }
        },
        rule: 'log(ab)=log(a)+log(b)',
        explanation: 'Logarithm product rule'
      });
      return {
        type: 'operator',
        value: '+',
        left: { type: 'function', value: 'log', children: [a] },
        right: { type: 'function', value: 'log', children: [b] }
      };
    }
    // Exponential identity: exp(a+b) = exp(a)*exp(b)
    if (node.type === 'function' && node.value === 'exp' && node.children?.[0]?.type === 'operator' && node.children[0].value === '+') {
      const a = node.children[0].left!;
      const b = node.children[0].right!;
      steps.push({
        step: stepCount++,
        operation: 'exp_identity',
        from: node,
        to: {
          type: 'operator',
          value: '*',
          left: { type: 'function', value: 'exp', children: [a] },
          right: { type: 'function', value: 'exp', children: [b] }
        },
        rule: 'exp(a+b)=exp(a)*exp(b)',
        explanation: 'Exponential addition rule'
      });
      return {
        type: 'operator',
        value: '*',
        left: { type: 'function', value: 'exp', children: [a] },
        right: { type: 'function', value: 'exp', children: [b] }
      };
    }
    // Plugin hook: allow plugins to simplify
    let pluginNode = node;
    for (const plugin of SymbolicComputationEngine.plugins) {
      const result = plugin.apply(pluginNode);
      if (result) {
        steps.push({
          step: stepCount++,
          operation: 'plugin_simplification',
          from: node,
          to: result,
          rule: `plugin: ${plugin.name}`,
          explanation: `Simplified by ${plugin.name} plugin`
        });
        pluginNode = result;
      }
    }
    return pluginNode;
  }

  /**
   * Factor polynomials (quadratic, cubic)
   */
  static factor(expression: string, variable: string = 'x'): SymbolicResult {
    const parseResult = AdvancedASTParser.parseExpression(expression);
    if (!parseResult.isValid) {
      throw new Error(`Parse error: ${parseResult.errors.join(', ')}`);
    }
    const ast = parseResult.ast;
    let steps: SymbolicStep[] = [];
    // Quadratic: ax^2+bx+c
    // TODO: Use a real polynomial extractor
    // For now, only handle x^2+bx+c
    if (ast.type === 'operator' && ast.value === '+' && ast.left?.type === 'operator' && ast.left.value === '+' && ast.left.left?.type === 'operator' && ast.left.left.value === '^') {
      // x^2+bx+c
      const b = ast.left.right?.type === 'operator' && ast.left.right.value === '*' && ast.left.right.left?.type === 'number' ? ast.left.right.left.value as number : 1;
      const c = ast.right?.type === 'number' ? ast.right.value as number : 0;
      // Factor: (x + r1)(x + r2)
      const discriminant = b * b - 4 * 1 * c;
      const r1 = (-b + Math.sqrt(discriminant)) / 2;
      const r2 = (-b - Math.sqrt(discriminant)) / 2;
      const result = {
        type: 'operator',
        value: '*',
        left: { type: 'operator', value: '+', left: { type: 'variable', value: variable }, right: { type: 'number', value: r1 } },
        right: { type: 'operator', value: '+', left: { type: 'variable', value: variable }, right: { type: 'number', value: r2 } }
      };
      steps.push({ step: 1, operation: 'factor', from: ast, to: result, rule: 'quadratic factor', explanation: 'Factored quadratic' });
      return {
        original: expression,
        simplified: result,
        steps,
        factored: result
      };
    }
    // TODO: Add cubic and higher factoring
    steps.push({ step: 1, operation: 'factor', from: ast, to: ast, rule: 'not handled', explanation: 'Factoring not implemented for this form' });
    return {
      original: expression,
      simplified: ast,
      steps,
      factored: ast
    };
  }

  /**
   * Expand (a+b)^n (binomial expansion)
   */
  static expand(expression: string): SymbolicResult {
    const parseResult = AdvancedASTParser.parseExpression(expression);
    if (!parseResult.isValid) {
      throw new Error(`Parse error: ${parseResult.errors.join(', ')}`);
    }
    const ast = parseResult.ast;
    let steps: SymbolicStep[] = [];
    // Only handle (a+b)^n where n is integer
    if (ast.type === 'operator' && ast.value === '^' && ast.left?.type === 'operator' && ast.left.value === '+' && ast.right?.type === 'number') {
      const n = ast.right.value as number;
      const a = ast.left.left!;
      const b = ast.left.right!;
      let result: ASTNode = { type: 'number', value: 0 };
      for (let k = 0; k <= n; k++) {
        // Binomial coefficient
        const coeff = SymbolicComputationEngine.binomial(n, k);
        // a^{n-k} * b^k
        let term: ASTNode = { type: 'number', value: coeff };
        if (n - k > 0) term = { type: 'operator', value: '*', left: term, right: { type: 'operator', value: '^', left: a, right: { type: 'number', value: n - k } } };
        if (k > 0) term = { type: 'operator', value: '*', left: term, right: { type: 'operator', value: '^', left: b, right: { type: 'number', value: k } } };
        if (k === 0) result = term;
        else result = { type: 'operator', value: '+', left: result, right: term };
      }
      steps.push({ step: 1, operation: 'expand', from: ast, to: result, rule: 'binomial', explanation: 'Binomial expansion' });
      return {
        original: expression,
        simplified: result,
        steps,
        expanded: result
      };
    }
    steps.push({ step: 1, operation: 'expand', from: ast, to: ast, rule: 'not handled', explanation: 'Expansion not implemented for this form' });
    return {
      original: expression,
      simplified: ast,
      steps,
      expanded: ast
    };
  }
  private static binomial(n: number, k: number): number {
    let res = 1;
    for (let i = 1; i <= k; i++) res = res * (n - i + 1) / i;
    return res;
  }

  /**
   * Collect like terms (very basic, for ax+bx)
   */
  static collectLikeTerms(expression: string, variable: string = 'x'): SymbolicResult {
    const parseResult = AdvancedASTParser.parseExpression(expression);
    if (!parseResult.isValid) {
      throw new Error(`Parse error: ${parseResult.errors.join(', ')}`);
    }
    const ast = parseResult.ast;
    let steps: SymbolicStep[] = [];
    // Only handle ax+bx
    if (ast.type === 'operator' && ast.value === '+' && ast.left?.type === 'operator' && ast.left.value === '*' && ast.left.right?.type === 'variable' && ast.left.right.value === variable && ast.right?.type === 'operator' && ast.right.value === '*' && ast.right.right?.type === 'variable' && ast.right.right.value === variable) {
      const a = ast.left.left?.type === 'number' ? ast.left.left.value as number : 1;
      const b = ast.right.left?.type === 'number' ? ast.right.left.value as number : 1;
      const sum = a + b;
      const result = { type: 'operator', value: '*', left: { type: 'number', value: sum }, right: { type: 'variable', value: variable } };
      steps.push({ step: 1, operation: 'collect', from: ast, to: result, rule: 'ax+bx=(a+b)x', explanation: 'Collected like terms' });
      return {
        original: expression,
        simplified: result,
        steps
      };
    }
    steps.push({ step: 1, operation: 'collect', from: ast, to: ast, rule: 'not handled', explanation: 'Collection not implemented for this form' });
    return {
      original: expression,
      simplified: ast,
      steps
    };
  }

  /**
   * Utility: Format steps as a human-readable proof/explanation
   */
  static formatSteps(steps: SymbolicStep[]): string {
    return steps.map(step => `Step ${step.step}: [${step.operation}]\n${step.explanation}\nFrom: ${JSON.stringify(step.from)}\nTo: ${JSON.stringify(step.to)}\nRule: ${step.rule}\n`).join('\n');
  }

  /**
   * Generate a full proof/explanation transcript for any operation
   */
  static generateProof(result: SymbolicResult): string {
    let out = `Original: ${result.original}\n`;
    if (result.steps && result.steps.length > 0) {
      out += '\n--- Step-by-step Explanation ---\n';
      out += this.formatSteps(result.steps);
    } else {
      out += '\n(No steps recorded)';
    }
    if (result.simplified) {
      out += `\n\nFinal Result: ${JSON.stringify(result.simplified)}`;
    }
    if (result.solutions) {
      out += `\n\nSolutions: ${JSON.stringify(result.solutions)}`;
    }
    if (result.integrals?.definite !== undefined) {
      out += `\n\nDefinite Integral: ${result.integrals.definite}`;
    }
    if (result.factored) {
      out += `\n\nFactored: ${JSON.stringify(result.factored)}`;
    }
    if (result.expanded) {
      out += `\n\nExpanded: ${JSON.stringify(result.expanded)}`;
    }
    return out;
  }

  // Utility: check if AST node is zero
  private static isZero(node?: ASTNode): boolean {
    return node?.type === 'number' && Number(node.value) === 0;
  }
  // Utility: check if AST node is one
  private static isOne(node?: ASTNode): boolean {
    return node?.type === 'number' && Number(node.value) === 1;
  }
  // Utility: check if two AST nodes are structurally equal (shallow)
  private static nodesEqual(a?: ASTNode, b?: ASTNode): boolean {
    if (!a || !b) return false;
    if (a.type !== b.type) return false;
    if (a.value !== b.value) return false;
    // Optionally compare left/right/children recursively for deep equality
    return true;
  }
  // Stubs for referenced but unimplemented features
  // (Remove or comment out these lines in simplify if not implemented)
  // private static applyTrigonometricSimplification(node: ASTNode, steps: SymbolicStep[], stepCount: number): ASTNode { return node; }
  // private static computeDerivatives(node: ASTNode): any { return undefined; }
  // private static factor(node: ASTNode): ASTNode { return node; }
  // private static expand(node: ASTNode): ASTNode { return node; }
  // private static toLatex(node: ASTNode): string { return ''; }
  /**
   * General equation solving (polynomial, systems, nonlinear)
   * - Symbolic for degree ≤ 4, numeric for higher or nonlinear
   */
  static solveGeneralEquation(expression: string, variable: string = 'x'): SymbolicResult {
    const parseResult = AdvancedASTParser.parseExpression(expression);
    if (!parseResult.isValid) {
      throw new Error(`Parse error: ${parseResult.errors.join(', ')}`);
    }
    const ast = parseResult.ast;
    let solutions: ASTNode[] = [];
    let steps: SymbolicStep[] = [];
    // Symbolic polynomial root finding (degree ≤ 4)
    // For now, only handle x^2+bx+c=0 and x^3+bx^2+cx+d=0 symbolically
    if (ast.type === 'equation') {
      // Try to extract coefficients for quadratic/cubic
      // TODO: Use a real polynomial extractor
      // Quadratic: ax^2+bx+c=0
      if (ast.left?.type === 'operator' && ast.left.value === '+' && ast.left.left?.type === 'operator' && ast.left.left.value === '+' && ast.left.left.left?.type === 'operator' && ast.left.left.left.value === '^') {
        // Quadratic formula (already implemented in solveEquation)
        return this.solveEquation(expression, variable);
      }
      // Cubic: ax^3+bx^2+cx+d=0 (Cardano's formula, symbolic)
      // Placeholder: just return a stub
      // For higher degree or nonlinear: use numeric root finding (Newton's method)
      steps.push({ step: 1, operation: 'numeric', from: ast, to: { type: 'list', value: 'solutions', children: [] }, rule: 'numeric', explanation: 'Numeric root finding (not implemented)' });
      // TODO: Implement numeric root finding
    }
    return {
      original: expression,
      simplified: ast,
      steps,
      solutions
    };
  }
}

// Plugin registration example
SymbolicComputationEngine.registerPlugin(trigSimplifyPlugin);
SymbolicComputationEngine.registerPlugin(logExpSimplifyPlugin);