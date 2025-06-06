
// src/lib/math-parser/symbolicDifferentiator.ts
import { type ASTNode } from './symbolicParser'; // Ensure this path is correct if ASTNode is defined elsewhere

export function differentiateAST(node: ASTNode, wrt: string = 'x'): ASTNode {
  switch (node.type) {
    case 'Number':
      return { type: 'Number', value: 0 };

    case 'Variable':
      return { type: 'Number', value: node.name.toLowerCase() === wrt.toLowerCase() ? 1 : 0 };

    case 'Add':
      return {
        type: 'Add',
        left: differentiateAST(node.left, wrt),
        right: differentiateAST(node.right, wrt)
      };

    case 'Subtract':
      return {
        type: 'Subtract',
        left: differentiateAST(node.left, wrt),
        right: differentiateAST(node.right, wrt)
      };

    case 'UnaryMinus': // Added handler for UnaryMinus
        return {
            type: 'UnaryMinus',
            expression: differentiateAST(node.expression, wrt)
        };

    case 'Multiply': // Product rule: (uv)' = u'v + uv'
      return {
        type: 'Add',
        left: {
          type: 'Multiply',
          left: differentiateAST(node.left, wrt),
          right: node.right // u'v (right is a clone implicitly if needed later, for now, direct use)
        },
        right: {
          type: 'Multiply',
          left: node.left, // uv' (left is a clone implicitly if needed later)
          right: differentiateAST(node.right, wrt)
        }
      };

    case 'Divide': // Quotient rule: (u/v)' = (u'v - uv') / v^2
      return {
        type: 'Divide',
        left: {
          type: 'Subtract',
          left: {
            type: 'Multiply',
            left: differentiateAST(node.left, wrt),
            right: node.right
          },
          right: {
            type: 'Multiply',
            left: node.left,
            right: differentiateAST(node.right, wrt)
          }
        },
        right: {
          type: 'Exponent',
          left: node.right,
          right: { type: 'Number', value: 2 }
        }
      };

    case 'Exponent':
      // Case 1: f(x)^c where c is a constant (Power Rule + Chain Rule)
      // d/dx u^n = n * u^(n-1) * u'
      if (node.right.type === 'Number') {
        return {
          type: 'Multiply',
          left: { // n * u^(n-1)
            type: 'Multiply',
            left: { type: 'Number', value: node.right.value },
            right: {
              type: 'Exponent',
              left: node.left,
              right: { type: 'Number', value: node.right.value - 1 }
            }
          },
          right: differentiateAST(node.left, wrt) // u'
        };
      }
      // Case 2: c^f(x) where c is a constant (Exponential Rule + Chain Rule)
      // d/dx a^u = a^u * ln(a) * u'
      if (node.left.type === 'Number') {
          // If base is 'e', then ln(e) = 1
          const lnBase: ASTNode = node.left.value === Math.E 
            ? { type: 'Number', value: 1} 
            : { type: 'FunctionCall', name: 'ln', args: [node.left]};
          
          if (lnBase.type === 'Number' && lnBase.value === 1) { // for e^f(x)
            return {
                type: 'Multiply',
                left: node, // e^f(x)
                right: differentiateAST(node.right, wrt) // f'(x)
            };
          }
          // for a^f(x)
          return {
            type: 'Multiply',
            left: {
                type: 'Multiply',
                left: node, // a^f(x)
                right: lnBase // ln(a)
            },
            right: differentiateAST(node.right, wrt) // f'(x)
          };
      }
      // Case 3: f(x)^g(x) (General Power Rule using logarithmic differentiation)
      // d/dx u^v = u^v * (v' * ln(u) + v * u'/u)
      return {
        type: 'Multiply',
        left: node, // u^v
        right: {
          type: 'Add',
          left: { // v' * ln(u)
            type: 'Multiply',
            left: differentiateAST(node.right, wrt),
            right: { type: 'FunctionCall', name: 'ln', args: [node.left] }
          },
          right: { // v * u'/u
            type: 'Multiply',
            left: node.right,
            right: {
              type: 'Divide',
              left: differentiateAST(node.left, wrt),
              right: node.left
            }
          }
        }
      };

    case 'FunctionCall':
      // Basic chain rule: d/dx f(g(x)) = f'(g(x)) * g'(x)
      if (node.args.length !== 1) {
        // For simplicity, this basic differentiator only handles unary functions.
        // For functions like pow(base, exp), a more specific rule would be needed
        // or it should be handled as an Exponent node if parsed that way.
        throw new Error(`Differentiation for function ${node.name} with ${node.args.length} arguments not implemented.`);
      }
      const arg = node.args[0];
      const dArg = differentiateAST(arg, wrt); // g'(x)

      let derivativeOfF: ASTNode; // This will represent f'(g(x))

      switch (node.name.toLowerCase()) {
        case 'sin':
          // d/du sin(u) = cos(u) => f'(g(x)) = cos(g(x))
          derivativeOfF = { type: 'FunctionCall', name: 'cos', args: [arg] };
          break;
        case 'cos':
          // d/du cos(u) = -sin(u) => f'(g(x)) = -sin(g(x))
          derivativeOfF = { 
            type: 'UnaryMinus', 
            expression: { type: 'FunctionCall', name: 'sin', args: [arg] }
          };
          break;
        case 'tan':
            // d/du tan(u) = sec^2(u) or 1/cos^2(u)
            derivativeOfF = {
                type: 'Exponent',
                left: { type: 'FunctionCall', name: 'sec', args: [arg]}, // Assuming 'sec' is a known function or handled by evaluator
                right: { type: 'Number', value: 2}
            };
            // Alternative: 1 / (cos(arg))^2
            // derivativeOfF = { type: 'Divide', left: {type: 'Number', value: 1}, right: {type: 'Exponent', left: {type: 'FunctionCall', name: 'cos', args:[arg]}, right: {type:'Number', value:2}}};
            break;
        case 'ln': // Natural log
          // d/du ln(u) = 1/u => f'(g(x)) = 1/g(x)
          derivativeOfF = { type: 'Divide', left: { type: 'Number', value: 1 }, right: arg };
          break;
        case 'log10': // log base 10
        case 'log': // Assuming log is log10 if not specified
          // d/du log_b(u) = 1 / (u * ln(b)) => f'(g(x)) = 1 / (g(x) * ln(10))
          derivativeOfF = { 
            type: 'Divide', 
            left: { type: 'Number', value: 1 }, 
            right: { type: 'Multiply', left: arg, right: { type: 'FunctionCall', name: 'ln', args: [{ type: 'Number', value: 10 }] } }
          };
          break;
        case 'exp': // e^u
          // d/du e^u = e^u => f'(g(x)) = e^(g(x))
          derivativeOfF = { type: 'FunctionCall', name: 'exp', args: [arg] };
          break;
        case 'sqrt':
          // d/du sqrt(u) = d/du u^(1/2) = (1/2) * u^(-1/2) = 1 / (2 * sqrt(u))
          derivativeOfF = {
            type: 'Divide',
            left: { type: 'Number', value: 1 },
            right: {
              type: 'Multiply',
              left: { type: 'Number', value: 2 },
              right: { type: 'FunctionCall', name: 'sqrt', args: [arg] }
            }
          };
          break;
        case 'abs':
            // d/dx |u| = u/|u| * u' or sign(u) * u'
            // This is tricky because abs is not differentiable at u=0.
            // For symbolic purposes, sign(u) is often used.
            derivativeOfF = {type: 'FunctionCall', name: 'sign', args: [arg] }; // Assuming sign function exists
            break;
        default:
          // Generic chain rule for unknown function f: d/dx f(g(x)) = f'(g(x)) * g'(x)
          // We can't symbolically compute f'(g(x)) if f is unknown.
          // We can represent it as D(f)(g(x)) or similar.
          // For simplicity, this basic version will throw an error.
          throw new Error(`Differentiation of function '${node.name}' is not explicitly supported. Use standard functions like sin, cos, ln, exp, sqrt or pow/exponent operator.`);
      }
      // Apply chain rule: f'(g(x)) * g'(x)
      // If g'(x) is 0, derivative is 0. If g'(x) is 1, derivative is f'(g(x)).
      if (dArg.type === 'Number' && dArg.value === 0) return { type: 'Number', value: 0 };
      if (dArg.type === 'Number' && dArg.value === 1) return derivativeOfF;
      
      return { type: 'Multiply', left: derivativeOfF, right: dArg };

    default:
      // This should be caught by TypeScript if ASTNode is a discriminated union.
      const exhaustiveCheck: never = node;
      throw new Error(`Unknown AST Node type for differentiation: ${(exhaustiveCheck as any).type}`);
  }
}
