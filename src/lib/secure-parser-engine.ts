/**
 * Secure Mathematical Parser Engine
 * Fixes vulnerabilities in AST parsing and expression evaluation
 */

import { SecurityManager } from './security-manager';

interface SecureASTNode {
  type: 'number' | 'variable' | 'function' | 'operator' | 'equation';
  value?: number | string;
  left?: SecureASTNode;
  right?: SecureASTNode;
  args?: SecureASTNode[];
  operator?: string;
  name?: string;
  metadata?: {
    position: number;
    validated: boolean;
    complexity: number;
  };
}

interface ParseResult {
  ast: SecureASTNode;
  variables: Set<string>;
  functions: Set<string>;
  complexity: number;
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface EvaluationContext {
  variables: Map<string, number>;
  functions: Map<string, (...args: number[]) => number>;
  precision: number;
  maxDepth: number;
  timeoutMs: number;
}

export class SecureParserEngine {
  private static readonly SAFE_FUNCTIONS = new Map([
    ['sin', Math.sin],
    ['cos', Math.cos],
    ['tan', Math.tan],
    ['asin', Math.asin],
    ['acos', Math.acos],
    ['atan', Math.atan],
    ['sinh', Math.sinh],
    ['cosh', Math.cosh],
    ['tanh', Math.tanh],
    ['log', Math.log],
    ['ln', Math.log],
    ['log10', Math.log10],
    ['exp', Math.exp],
    ['sqrt', Math.sqrt],
    ['abs', Math.abs],
    ['ceil', Math.ceil],
    ['floor', Math.floor],
    ['round', Math.round],
    ['max', Math.max],
    ['min', Math.min],
    ['pow', Math.pow]
  ]);

  private static readonly SAFE_CONSTANTS = new Map([
    ['pi', Math.PI],
    ['e', Math.E],
    ['π', Math.PI],
    ['euler', Math.E]
  ]);

  private static readonly OPERATORS = new Set(['+', '-', '*', '/', '^', '=', '<', '>', '<=', '>=']);

  /**
   * Securely parse mathematical expression with comprehensive validation
   */
  static parseExpression(expression: string): ParseResult {
    try {
      // Security validation first
      const validation = SecurityManager.validateExpression(expression);
      if (!validation.isValid) {
        return {
          ast: { type: 'number', value: 0 },
          variables: new Set(),
          functions: new Set(),
          complexity: 0,
          isValid: false,
          errors: validation.blocked,
          warnings: validation.warnings
        };
      }

      // Tokenize safely
      const tokens = this.secureTokenize(validation.sanitized);
      
      // Build AST with depth limiting
      const parseResult = this.buildSecureAST(tokens);
      
      // Calculate complexity
      const complexity = this.calculateComplexity(parseResult.ast);
      
      return {
        ...parseResult,
        complexity,
        isValid: true,
        errors: [],
        warnings: validation.warnings
      };

    } catch (error) {
      const sanitizedError = SecurityManager.sanitizeError(error);
      return {
        ast: { type: 'number', value: 0 },
        variables: new Set(),
        functions: new Set(),
        complexity: 0,
        isValid: false,
        errors: [sanitizedError],
        warnings: []
      };
    }
  }

  /**
   * Secure tokenization with bounds checking
   */
  private static secureTokenize(expression: string): string[] {
    const tokens: string[] = [];
    let current = '';
    let position = 0;

    while (position < expression.length && tokens.length < 1000) { // Prevent infinite loops
      const char = expression[position];

      if (char === ' ') {
        if (current) {
          tokens.push(current);
          current = '';
        }
        position++;
        continue;
      }

      if (this.isOperator(char)) {
        if (current) {
          tokens.push(current);
          current = '';
        }
        
        // Check for multi-character operators
        if (position + 1 < expression.length) {
          const twoChar = char + expression[position + 1];
          if (['<=', '>=', '==', '!='].includes(twoChar)) {
            tokens.push(twoChar);
            position += 2;
            continue;
          }
        }
        
        tokens.push(char);
        position++;
        continue;
      }

      if (char === '(' || char === ')') {
        if (current) {
          tokens.push(current);
          current = '';
        }
        tokens.push(char);
        position++;
        continue;
      }

      current += char;
      position++;
    }

    if (current) {
      tokens.push(current);
    }

    return tokens;
  }

  /**
   * Build AST with security constraints
   */
  private static buildSecureAST(tokens: string[]): {
    ast: SecureASTNode;
    variables: Set<string>;
    functions: Set<string>;
  } {
    let position = 0;
    const variables = new Set<string>();
    const functions = new Set<string>();
    let depth = 0;
    const maxDepth = 50;

    const parseExpression = (): SecureASTNode => {
      depth++;
      if (depth > maxDepth) {
        throw new Error('Expression too deeply nested');
      }

      const node = parseAdditionSubtraction();
      depth--;
      return node;
    };

    const parseAdditionSubtraction = (): SecureASTNode => {
      let left = parseMultiplicationDivision();

      while (position < tokens.length && (tokens[position] === '+' || tokens[position] === '-')) {
        const operator = tokens[position++];
        const right = parseMultiplicationDivision();
        
        left = {
          type: 'operator',
          operator,
          left,
          right,
          metadata: {
            position: position - 1,
            validated: true,
            complexity: this.calculateNodeComplexity(left) + this.calculateNodeComplexity(right) + 1
          }
        };
      }

      return left;
    };

    const parseMultiplicationDivision = (): SecureASTNode => {
      let left = parseExponentiation();

      while (position < tokens.length && (tokens[position] === '*' || tokens[position] === '/')) {
        const operator = tokens[position++];
        const right = parseExponentiation();
        
        left = {
          type: 'operator',
          operator,
          left,
          right,
          metadata: {
            position: position - 1,
            validated: true,
            complexity: this.calculateNodeComplexity(left) + this.calculateNodeComplexity(right) + 1
          }
        };
      }

      return left;
    };

    const parseExponentiation = (): SecureASTNode => {
      let left = parseFactor();

      if (position < tokens.length && (tokens[position] === '^' || tokens[position] === '**')) {
        const operator = tokens[position++];
        const right = parseExponentiation(); // Right associative
        
        left = {
          type: 'operator',
          operator: '^',
          left,
          right,
          metadata: {
            position: position - 1,
            validated: true,
            complexity: this.calculateNodeComplexity(left) + this.calculateNodeComplexity(right) + 2
          }
        };
      }

      return left;
    };

    const parseFactor = (): SecureASTNode => {
      if (position >= tokens.length) {
        throw new Error('Unexpected end of expression');
      }

      const token = tokens[position];

      // Handle parentheses
      if (token === '(') {
        position++;
        const node = parseExpression();
        if (position >= tokens.length || tokens[position] !== ')') {
          throw new Error('Missing closing parenthesis');
        }
        position++;
        return node;
      }

      // Handle negative numbers
      if (token === '-') {
        position++;
        const node = parseFactor();
        return {
          type: 'operator',
          operator: 'unary-',
          right: node,
          metadata: {
            position: position - 1,
            validated: true,
            complexity: this.calculateNodeComplexity(node) + 1
          }
        };
      }

      // Handle numbers
      if (this.isNumber(token)) {
        position++;
        const value = parseFloat(token);
        
        // Check for safe number range
        if (!isFinite(value) || Math.abs(value) > Number.MAX_SAFE_INTEGER) {
          throw new Error('Number out of safe range');
        }

        return {
          type: 'number',
          value,
          metadata: {
            position: position - 1,
            validated: true,
            complexity: 1
          }
        };
      }

      // Handle functions
      if (position + 1 < tokens.length && tokens[position + 1] === '(') {
        const funcName = token.toLowerCase();
        
        // Validate function is safe
        if (!this.SAFE_FUNCTIONS.has(funcName)) {
          throw new Error(`Unsafe function: ${funcName}`);
        }

        functions.add(funcName);
        position += 2; // Skip function name and opening parenthesis

        const args: SecureASTNode[] = [];
        
        while (position < tokens.length && tokens[position] !== ')') {
          args.push(parseExpression());
          
          if (position < tokens.length && tokens[position] === ',') {
            position++;
          } else if (position < tokens.length && tokens[position] !== ')') {
            throw new Error('Expected comma or closing parenthesis in function call');
          }
        }

        if (position >= tokens.length) {
          throw new Error('Missing closing parenthesis in function call');
        }
        
        position++; // Skip closing parenthesis

        return {
          type: 'function',
          name: funcName,
          args,
          metadata: {
            position: position - 1,
            validated: true,
            complexity: args.reduce((sum, arg) => sum + this.calculateNodeComplexity(arg), 0) + 2
          }
        };
      }

      // Handle variables and constants
      if (this.isValidIdentifier(token)) {
        position++;
        const name = token.toLowerCase();
        
        // Check if it's a constant
        if (this.SAFE_CONSTANTS.has(name)) {
          return {
            type: 'number',
            value: this.SAFE_CONSTANTS.get(name)!,
            metadata: {
              position: position - 1,
              validated: true,
              complexity: 1
            }
          };
        }

        variables.add(name);
        return {
          type: 'variable',
          name,
          metadata: {
            position: position - 1,
            validated: true,
            complexity: 1
          }
        };
      }

      throw new Error(`Unexpected token: ${token}`);
    };

    const ast = parseExpression();
    
    if (position < tokens.length) {
      throw new Error(`Unexpected token after expression: ${tokens[position]}`);
    }

    return { ast, variables, functions };
  }

  /**
   * Securely evaluate AST with timeout and depth limits
   */
  static async evaluateAST(
    node: SecureASTNode, 
    context: EvaluationContext
  ): Promise<number> {
    return SecurityManager.withTimeout(
      this.evaluateNode(node, context, 0),
      context.timeoutMs || 5000
    );
  }

  /**
   * Internal evaluation with depth tracking
   */
  private static async evaluateNode(
    node: SecureASTNode,
    context: EvaluationContext,
    depth: number
  ): Promise<number> {
    if (depth > context.maxDepth) {
      throw new Error('Evaluation depth limit exceeded');
    }

    switch (node.type) {
      case 'number':
        return typeof node.value === 'number' ? node.value : 0;

      case 'variable':
        const varValue = context.variables.get(node.name as string);
        if (varValue === undefined) {
          throw new Error(`Undefined variable: ${node.name}`);
        }
        return varValue;

      case 'function':
        const funcName = node.name as string;
        const func = this.SAFE_FUNCTIONS.get(funcName);
        if (!func) {
          throw new Error(`Unknown function: ${funcName}`);
        }

        const args = await Promise.all(
          (node.args || []).map(arg => this.evaluateNode(arg, context, depth + 1))
        );

        try {
          const result = func(...args);
          if (!isFinite(result)) {
            throw new Error(`Function ${funcName} returned invalid result`);
          }
          return result;
        } catch (error) {
          throw new Error(`Error in function ${funcName}: ${SecurityManager.sanitizeError(error)}`);
        }

      case 'operator':
        if (node.operator === 'unary-') {
          const operand = await this.evaluateNode(node.right!, context, depth + 1);
          return -operand;
        }

        const left = await this.evaluateNode(node.left!, context, depth + 1);
        const right = await this.evaluateNode(node.right!, context, depth + 1);

        switch (node.operator) {
          case '+': return left + right;
          case '-': return left - right;
          case '*': return left * right;
          case '/':
            if (Math.abs(right) < Number.EPSILON) {
              throw new Error('Division by zero');
            }
            return left / right;
          case '^':
            if (left < 0 && !Number.isInteger(right)) {
              throw new Error('Cannot raise negative number to non-integer power');
            }
            const result = Math.pow(left, right);
            if (!isFinite(result)) {
              throw new Error('Exponentiation resulted in invalid number');
            }
            return result;
          default:
            throw new Error(`Unknown operator: ${node.operator}`);
        }

      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  /**
   * Calculate expression complexity
   */
  private static calculateComplexity(node: SecureASTNode): number {
    return this.calculateNodeComplexity(node);
  }

  private static calculateNodeComplexity(node: SecureASTNode): number {
    if (node.metadata?.complexity) {
      return node.metadata.complexity;
    }

    switch (node.type) {
      case 'number':
      case 'variable':
        return 1;
      case 'function':
        return 2 + (node.args?.reduce((sum, arg) => sum + this.calculateNodeComplexity(arg), 0) || 0);
      case 'operator':
        const leftComplexity = node.left ? this.calculateNodeComplexity(node.left) : 0;
        const rightComplexity = node.right ? this.calculateNodeComplexity(node.right) : 0;
        return 1 + leftComplexity + rightComplexity;
      default:
        return 0;
    }
  }

  /**
   * Helper methods
   */
  private static isOperator(char: string): boolean {
    return '+-*/^=<>'.includes(char);
  }

  private static isNumber(token: string): boolean {
    return /^-?\d*\.?\d+([eE][+-]?\d+)?$/.test(token);
  }

  private static isValidIdentifier(token: string): boolean {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(token) && token.length <= 50;
  }

  /**
   * Create default evaluation context
   */
  static createContext(overrides: Partial<EvaluationContext> = {}): EvaluationContext {
    return {
      variables: new Map(),
      functions: new Map(),
      precision: 15,
      maxDepth: 100,
      timeoutMs: 5000,
      ...overrides
    };
  }
}