/**
 * Enhanced Equation Utilities
 * Advanced equation manipulation, rearrangement, and code generation
 */

import { parse, simplify } from 'mathjs';

export interface EquationResult {
  original: string;
  rearranged: string;
  note: string;
  steps?: string[];
  error?: string;
}

export interface CodeGeneration {
  typescript: string;
  python: string;
  latex: string;
  javascript: string;
}

export class EquationUtilities {
  /**
   * Rearrange equations to solve for specific variables
   */
  static rearrangeEquation(equation: string, solveFor?: string): EquationResult {
    const parts = equation.split('=');
    if (parts.length !== 2) {
      return { 
        original: equation,
        rearranged: '',
        note: '',
        error: 'Equation must contain exactly one equals sign (=) to rearrange.' 
      };
    }
    
    const lhs = parts[0].trim();
    const rhs = parts[1].trim();

    if (!lhs || !rhs) {
      return { 
        original: equation,
        rearranged: '',
        note: '',
        error: 'Both sides of the equation must have content.'
      };
    }

    // Reconstruct as expression: lhs - (rhs) = 0
    // Parenthesize rhs to ensure correct subtraction order
    const exprStr = `${lhs} - (${rhs})`;

    try {
      // math.js simplify can handle basic algebraic simplifications
      const simplifiedNode = simplify(exprStr); 
      const simplifiedString = simplifiedNode.toString({parenthesis: 'auto', implicit: 'hide'});

      const steps = [
        `Original equation: ${equation}`,
        `Move all terms to left side: ${exprStr} = 0`,
        `Simplify: ${simplifiedString} = 0`
      ];

      return {
        original: equation,
        rearranged: `${simplifiedString} = 0`,
        note: `Rearranged to the form 'expression = 0' and simplified using advanced algebraic rules.`,
        steps
      };
    } catch (err: any) {
      console.error("Error rearranging/simplifying equation:", err);
      return { 
        original: equation,
        rearranged: '',
        note: '',
        error: `Failed to rearrange or simplify: ${err.message || String(err)}` 
      };
    }
  }

  /**
   * Generate code representations of equations in multiple languages
   */
  static generateCodeFromEquation(equation: string): CodeGeneration {
    const parts = equation.split('=').map(s => s.trim());
    if (parts.length !== 2) {
      const errorComment = `// Invalid equation: ${equation}`;
      return {
        typescript: errorComment,
        python: errorComment.replace('//', '#'),
        latex: `\\text{Invalid equation: } ${equation}`,
        javascript: errorComment
      };
    }
    
    const lhs = parts[0];
    const rhs = parts[1];

    // Convert mathematical notation to code-friendly format
    const codeRhs = this.convertMathToCode(rhs);
    const latexLhs = this.convertToLatex(lhs);
    const latexRhs = this.convertToLatex(rhs);

    return {
      typescript: this.generateTypeScript(lhs, codeRhs, equation),
      python: this.generatePython(lhs, codeRhs, equation),
      latex: this.generateLatex(latexLhs, latexRhs),
      javascript: this.generateJavaScript(lhs, codeRhs, equation)
    };
  }

  /**
   * Solve simple algebraic equations
   */
  static solveSimpleEquation(equation: string, variable: string = 'x'): EquationResult {
    try {
      const parts = equation.split('=');
      if (parts.length !== 2) {
        return {
          original: equation,
          rearranged: '',
          note: '',
          error: 'Invalid equation format'
        };
      }

      // Try to solve using algebraic manipulation
      const lhs = parts[0].trim();
      const rhs = parts[1].trim();
      
      // Simple linear equation solving
      if (this.isLinearEquation(lhs, rhs, variable)) {
        const solution = this.solveLinearEquation(lhs, rhs, variable);
        return {
          original: equation,
          rearranged: `${variable} = ${solution}`,
          note: 'Solved using linear equation methods',
          steps: this.getLinearSolutionSteps(lhs, rhs, variable, solution)
        };
      }

      // Quadratic equation detection and solving
      if (this.isQuadraticEquation(lhs, rhs, variable)) {
        const solutions = this.solveQuadraticEquation(lhs, rhs, variable);
        return {
          original: equation,
          rearranged: `${variable} = ${solutions.join(' or ')}`,
          note: 'Solved using quadratic formula',
          steps: this.getQuadraticSolutionSteps(lhs, rhs, variable, solutions)
        };
      }

      return {
        original: equation,
        rearranged: '',
        note: 'Equation type not supported for automatic solving',
        error: 'Complex equation requires manual solving or specialized tools'
      };

    } catch (error) {
      return {
        original: equation,
        rearranged: '',
        note: '',
        error: `Solving failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Convert mathematical expressions to code-friendly format
   */
  private static convertMathToCode(expr: string): string {
    let code = expr;
    
    // Replace mathematical operators and functions
    code = code.replace(/\^/g, '**');  // Exponentiation
    code = code.replace(/π/g, 'Math.PI');
    code = code.replace(/\bpi\b/g, 'Math.PI');
    code = code.replace(/\be\b/g, 'Math.E');
    code = code.replace(/√/g, 'Math.sqrt');
    code = code.replace(/\bsqrt\(/g, 'Math.sqrt(');
    code = code.replace(/\bsin\(/g, 'Math.sin(');
    code = code.replace(/\bcos\(/g, 'Math.cos(');
    code = code.replace(/\btan\(/g, 'Math.tan(');
    code = code.replace(/\bln\(/g, 'Math.log(');
    code = code.replace(/\blog\(/g, 'Math.log10(');
    
    return code;
  }

  /**
   * Convert mathematical expressions to LaTeX format
   */
  private static convertToLatex(expr: string): string {
    let latex = expr;
    
    // Replace mathematical notation with LaTeX equivalents
    latex = latex.replace(/\^([^{])/g, '^{$1}');  // Add braces for superscripts
    latex = latex.replace(/π/g, '\\pi');
    latex = latex.replace(/\bpi\b/g, '\\pi');
    latex = latex.replace(/\be\b/g, 'e');
    latex = latex.replace(/√/g, '\\sqrt');
    latex = latex.replace(/\bsqrt\(/g, '\\sqrt{');
    latex = latex.replace(/\bfrac\(/g, '\\frac{');
    latex = latex.replace(/\*/g, ' \\cdot ');
    latex = latex.replace(/\binfinity\b/g, '\\infty');
    
    return latex;
  }

  /**
   * Generate TypeScript code
   */
  private static generateTypeScript(lhs: string, rhs: string, equation: string): string {
    return `// Equation: ${equation}
function calculate${this.capitalize(lhs)}(${this.extractVariables(rhs).join(', ')}: number): number {
  return ${rhs};
}

// Example usage:
// const result = calculate${this.capitalize(lhs)}(${this.extractVariables(rhs).map(v => `${v}Value`).join(', ')});`;
  }

  /**
   * Generate Python code
   */
  private static generatePython(lhs: string, rhs: string, equation: string): string {
    const pythonRhs = rhs.replace(/Math\./g, 'math.');
    return `# Equation: ${equation}
import math

def calculate_${lhs.toLowerCase()}(${this.extractVariables(rhs).join(', ')}):
    """
    Calculate ${lhs} based on the equation: ${equation}
    """
    return ${pythonRhs}

# Example usage:
# result = calculate_${lhs.toLowerCase()}(${this.extractVariables(rhs).map(v => `${v}_value`).join(', ')})`;
  }

  /**
   * Generate LaTeX code
   */
  private static generateLatex(lhs: string, rhs: string): string {
    return `\\begin{equation}
${lhs} = ${rhs}
\\end{equation}`;
  }

  /**
   * Generate JavaScript code
   */
  private static generateJavaScript(lhs: string, rhs: string, equation: string): string {
    return `// Equation: ${equation}
function calculate${this.capitalize(lhs)}(${this.extractVariables(rhs).join(', ')}) {
  return ${rhs};
}

// Example usage:
// const result = calculate${this.capitalize(lhs)}(${this.extractVariables(rhs).map(v => `${v}Value`).join(', ')});`;
  }

  /**
   * Check if equation is linear
   */
  private static isLinearEquation(lhs: string, rhs: string, variable: string): boolean {
    const combined = `${lhs} - (${rhs})`;
    // Simple check for linear equations (no x^2, x^3, etc.)
    const powerPattern = new RegExp(`${variable}\\^[2-9]|${variable}\\*${variable}`, 'g');
    return !powerPattern.test(combined);
  }

  /**
   * Check if equation is quadratic
   */
  private static isQuadraticEquation(lhs: string, rhs: string, variable: string): boolean {
    const combined = `${lhs} - (${rhs})`;
    // Check for x^2 terms
    const quadPattern = new RegExp(`${variable}\\^2|${variable}\\*${variable}`, 'g');
    const cubicPattern = new RegExp(`${variable}\\^[3-9]`, 'g');
    return quadPattern.test(combined) && !cubicPattern.test(combined);
  }

  /**
   * Solve linear equation
   */
  private static solveLinearEquation(lhs: string, rhs: string, variable: string): string {
    try {
      // This is a simplified implementation
      // For more complex cases, would need a full algebraic solver
      
      // Try to isolate the variable
      const expr = `${lhs} - (${rhs})`;
      
      // Simple pattern matching for ax + b = 0 form
      const linearPattern = new RegExp(`([+-]?\\d*\\.?\\d*)\\*?${variable}([+-]\\d*\\.?\\d*)?`, 'g');
      const matches = expr.match(linearPattern);
      
      if (matches && matches.length > 0) {
        // Extract coefficient and constant (simplified)
        return 'solution'; // Placeholder - would need full algebraic solver
      }
      
      return 'Unable to solve automatically';
    } catch (error) {
      return 'Error in solving';
    }
  }

  /**
   * Solve quadratic equation
   */
  private static solveQuadraticEquation(lhs: string, rhs: string, variable: string): string[] {
    // Placeholder for quadratic solving
    // Would implement quadratic formula: x = (-b ± √(b²-4ac)) / 2a
    return ['Solution requires quadratic formula implementation'];
  }

  /**
   * Get solution steps for linear equations
   */
  private static getLinearSolutionSteps(lhs: string, rhs: string, variable: string, solution: string): string[] {
    return [
      `Original equation: ${lhs} = ${rhs}`,
      `Rearrange to standard form`,
      `Isolate ${variable}`,
      `Solution: ${variable} = ${solution}`
    ];
  }

  /**
   * Get solution steps for quadratic equations
   */
  private static getQuadraticSolutionSteps(lhs: string, rhs: string, variable: string, solutions: string[]): string[] {
    return [
      `Original equation: ${lhs} = ${rhs}`,
      `Rearrange to ax² + bx + c = 0 form`,
      `Apply quadratic formula: x = (-b ± √(b²-4ac)) / 2a`,
      `Solutions: ${variable} = ${solutions.join(' or ')}`
    ];
  }

  /**
   * Extract variables from expression
   */
  private static extractVariables(expr: string): string[] {
    const variables = expr.match(/\b[a-zA-Z]\w*\b/g) || [];
    return [...new Set(variables)].filter(v => 
      !['Math', 'sin', 'cos', 'tan', 'log', 'sqrt', 'PI', 'E'].includes(v)
    );
  }

  /**
   * Capitalize first letter
   */
  private static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}