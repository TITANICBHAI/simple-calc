// src/lib/math-parser/symbolicSimplifier.ts
import { type ASTNode } from './symbolicParser'; // Uses relative path
import { evaluateAST, Scope as EvaluatorScope } from './symbolicEvaluator'; // Uses relative path

// Helper function for basic algebraic simplifications of binary operations
function simplifyBinary(type: ASTNode['type'], left: ASTNode, right: ASTNode): ASTNode {
  if (type === 'Add') {
    if (left.type === 'Number' && left.value === 0) return right; // 0 + x = x
    if (right.type === 'Number' && right.value === 0) return left; // x + 0 = x
  } else if (type === 'Subtract') {
    if (right.type === 'Number' && right.value === 0) return left; // x - 0 = x
    // Consider x - x = 0 if left and right are identical variables/expressions - more complex
  } else if (type === 'Multiply') {
    if (left.type === 'Number' && left.value === 1) return right; // 1 * x = x
    if (right.type === 'Number' && right.value === 1) return left; // x * 1 = x
    if ((left.type === 'Number' && left.value === 0) || (right.type === 'Number' && right.value === 0)) {
      return { type: 'Number', value: 0 }; // 0 * x = 0 or x * 0 = 0
    }
  } else if (type === 'Divide') {
    if (right.type === 'Number' && right.value === 1) return left; // x / 1 = x
    if (left.type === 'Number' && left.value === 0 && right.type === 'Number' && right.value !== 0) {
      return { type: 'Number', value: 0 }; // 0 / x = 0 (x != 0)
    }
    // Consider x / x = 1 if left and right are identical and non-zero - more complex
  } else if (type === 'Exponent') {
    if (right.type === 'Number' && right.value === 1) return left; // x ^ 1 = x
    if (left.type === 'Number' && left.value === 1) return { type: 'Number', value: 1 }; // 1 ^ x = 1
    if (right.type === 'Number' && right.value === 0) return { type: 'Number', value: 1 }; // x ^ 0 = 1 (for x != 0)
  }

  // Default: return node with simplified children
  // TypeScript needs explicit casting here due to the broad 'ASTNode['type']'
  const nodeType = type as 'Add' | 'Subtract' | 'Multiply' | 'Divide' | 'Exponent';
  if (nodeType === 'Add' || nodeType === 'Subtract' || nodeType === 'Multiply' || nodeType === 'Divide' || nodeType === 'Exponent') {
     return { type: nodeType, left, right };
  }
  // Fallback, though all binary ops should be covered above
  throw new Error(`Unsupported binary operation type for simplification: ${type}`);
}

export function simplifyAST(node: ASTNode): ASTNode {
  switch (node.type) {
    case 'Number':
    case 'Variable':
      return { ...node }; // Return a copy to avoid mutating original AST during simplification

    case 'UnaryMinus':
      const simplifiedExpr = simplifyAST(node.expression);
      if (simplifiedExpr.type === 'Number') {
        return { type: 'Number', value: -simplifiedExpr.value };
      }
      if (simplifiedExpr.type === 'UnaryMinus') { // --x simplifies to x
        return simplifiedExpr.expression;
      }
      return { type: 'UnaryMinus', expression: simplifiedExpr };

    case 'Add':
    case 'Subtract':
    case 'Multiply':
    case 'Divide':
    case 'Exponent':
      const simplifiedLeft = simplifyAST(node.left);
      const simplifiedRight = simplifyAST(node.right);

      // Constant folding: if both children are numbers, evaluate them
      if (simplifiedLeft.type === 'Number' && simplifiedRight.type === 'Number') {
        // Create a temporary scope (empty) for evaluating constant parts
        const evaluationScope: EvaluatorScope = {}; 
        const evalResult = evaluateAST({ ...node, left: simplifiedLeft, right: simplifiedRight }, evaluationScope);
        if (typeof evalResult === 'number') {
          return { type: 'Number', value: evalResult };
        }
        // If evalResult is string (symbolic fallback from evaluator, unlikely here), proceed to simplifyBinary
      }
      
      // Try further algebraic simplification
      return simplifyBinary(node.type, simplifiedLeft, simplifiedRight);

    case 'FunctionCall':
      const simplifiedArgs = node.args.map(arg => simplifyAST(arg));
      // Potential constant folding for function calls if all args are numbers
      // e.g., sin(0) -> 0. This would require calling evaluateAST.
      // For simplicity, we'll just simplify args for now.
      // To do full constant folding:
      // if (simplifiedArgs.every(arg => arg.type === 'Number')) {
      //   const evalResult = evaluateAST({ ...node, args: simplifiedArgs }, {});
      //   if (typeof evalResult === 'number') {
      //     return { type: 'Number', value: evalResult };
      //   }
      // }
      return {
        type: 'FunctionCall',
        name: node.name,
        args: simplifiedArgs
      };

    case 'Complex':
      // No further simplification for complex literals
      return { ...node };
    case 'Assignment':
      return { ...node, value: simplifyAST(node.value) };
    case 'FunctionDef':
      return { ...node, body: simplifyAST(node.body) };
    case 'Batch':
      return { ...node, expressions: node.expressions.map(simplifyAST) };

    default:
      // This should be caught by TypeScript if ASTNode is a discriminated union.
      // Adding for runtime safety in case of unexpected node types.
      const exhaustiveCheck: never = node;
      throw new Error(`Unknown AST node type during simplification: ${(exhaustiveCheck as any).type}`);
  }
}
