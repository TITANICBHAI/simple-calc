// src/lib/math-parser/astCodeGen.ts
import { type ASTNode } from './symbolicParser';

// Helper function to determine if parentheses are needed for an operand
// This is a simplified version and might add more parentheses than strictly necessary
// but aims for correctness.
function needsParentheses(node: ASTNode, parentOperatorType?: ASTNode['type']): boolean {
  if (node.type === 'Number' || node.type === 'Variable') {
    return false;
  }
  if (node.type === 'FunctionCall') {
    return false;
  }
  if (node.type === 'UnaryMinus' && (node.expression.type === 'Number' || node.expression.type === 'Variable' || node.expression.type === 'FunctionCall')) {
    return false; // e.g., -x or -5 or -sin(x) don't need more parens
  }
  // Add more specific rules based on operator precedence if desired
  // For now, wrap most binary operations if they are part of another binary op
  if (parentOperatorType && (parentOperatorType === 'Multiply' || parentOperatorType === 'Divide' || parentOperatorType === 'Exponent')) {
      if (node.type === 'Add' || node.type === 'Subtract') return true;
  }
  if (parentOperatorType && parentOperatorType === 'Exponent' && 
      node.type !== 'Number' && node.type !== 'Variable' && node.type !== 'FunctionCall') {
    return true; // e.g. (a+b)^c
  }

  return node.type === 'Add' || node.type === 'Subtract' || node.type === 'Multiply' || node.type === 'Divide' || node.type === 'Exponent' || node.type === 'UnaryMinus';
}

export function generateCode(ast: ASTNode, parentOperatorType?: ASTNode['type']): string {
  switch (ast.type) {
    case 'Number':
      return ast.value.toString();
    case 'Variable':
      return ast.name;
    case 'Add':
    case 'Subtract':
    case 'Multiply':
    case 'Divide':
    case 'Exponent':
      const opSymbol = ({
        Add: '+',
        Subtract: '-',
        Multiply: '*',
        Divide: '/',
        Exponent: '^',
      } as Record<string, string>)[ast.type];

      const leftStr = generateCode(ast.left, ast.type);
      const rightStr = generateCode(ast.right, ast.type);
      
      const useParens = needsParentheses(ast, parentOperatorType);
      const result = `${leftStr} ${opSymbol} ${rightStr}`;
      return useParens ? `(${result})` : result;

    case 'UnaryMinus': {
      const exprStr = generateCode(ast.expression, ast.type);
      // Only add parentheses if the inner expression is a binary operation
      if (ast.expression.type === 'Add' || ast.expression.type === 'Subtract' ||
          ast.expression.type === 'Multiply' || ast.expression.type === 'Divide' ||
          ast.expression.type === 'Exponent') {
        return `-(${exprStr})`;
      }
      return `-${exprStr}`;
    }

    case 'FunctionCall':
      return `${ast.name}(${ast.args.map(arg => generateCode(arg)).join(', ')})`;

    default:
      // This should be caught by TypeScript if ASTNode is a discriminated union.
      const exhaustiveCheck: never = ast;
      throw new Error(`Unknown AST Node type for code generation: ${(exhaustiveCheck as any).type}`);
  }
}