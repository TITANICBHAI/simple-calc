
// src/lib/math-parser/symbolicLimiter.ts
import { type ASTNode, parseExpression } from './symbolicParser'; // parseExpression might not be needed if AST is passed directly
import { evaluateAST, type Scope } from './symbolicEvaluator';

/**
 * Numerically approximates the limit of an expression.
 * @param ast The Abstract Syntax Tree of the expression.
 * @param variable The variable name string.
 * @param approaching The value the variable is approaching (number, '∞', or '-∞').
 * @returns A string representing the calculated limit or an error/info message.
 */
export function limit(ast: ASTNode, variable: string, approaching: number | '∞' | '-∞'): string {
  const delta = 1e-7; // A small value for approximation
  let point1: number;
  let point2: number;

  if (approaching === '∞') {
    point1 = 1 / delta; // Large number
    point2 = 2 / delta; // Even larger number (can also use point1 - delta_for_infinity)
                         // This might not be the best for infinity, often one point is enough or a sequence.
                         // For simplicity, we'll use one very large point.
    const valAtInfinity = evaluateAST(ast, { [variable.toLowerCase()]: point1 } as Scope);
    if (typeof valAtInfinity === 'number') {
      if (isNaN(valAtInfinity)) return "Result is NaN at large values";
      if (!isFinite(valAtInfinity)) return valAtInfinity > 0 ? "∞" : "-∞";
      return valAtInfinity.toPrecision(7); // Use toPrecision for better formatting
    }
    return `Cannot evaluate symbolically at large values: ${valAtInfinity}`;

  } else if (approaching === '-∞') {
    point1 = -1 / delta; // Large negative number
    const valAtNegativeInfinity = evaluateAST(ast, { [variable.toLowerCase()]: point1 } as Scope);
     if (typeof valAtNegativeInfinity === 'number') {
      if (isNaN(valAtNegativeInfinity)) return "Result is NaN at large negative values";
      if (!isFinite(valAtNegativeInfinity)) return valAtNegativeInfinity > 0 ? "∞" : "-∞";
      return valAtNegativeInfinity.toPrecision(7);
    }
    return `Cannot evaluate symbolically at large negative values: ${valAtNegativeInfinity}`;
  } else {
    // For finite points, check from left and right
    point1 = approaching - delta;
    point2 = approaching + delta;
  }

  const valueBefore = evaluateAST(ast, { [variable.toLowerCase()]: point1 } as Scope);
  const valueAfter = evaluateAST(ast, { [variable.toLowerCase()]: point2 } as Scope);

  if (typeof valueBefore !== 'number' || typeof valueAfter !== 'number') {
    let message = "Limit could not be numerically determined. ";
    if (typeof valueBefore !== 'number') message += `Evaluation at ${variable}=${point1} resulted in: ${valueBefore}. `;
    if (typeof valueAfter !== 'number') message += `Evaluation at ${variable}=${point2} resulted in: ${valueAfter}.`;
    return message.trim();
  }
  
  if (isNaN(valueBefore) || isNaN(valueAfter)) {
    return "Result is NaN near the limit point.";
  }
  if (!isFinite(valueBefore) || !isFinite(valueAfter)) {
    if (!isFinite(valueBefore) && !isFinite(valueAfter) && Math.sign(valueBefore) === Math.sign(valueAfter)) {
        return valueBefore > 0 ? "∞" : "-∞";
    }
    return "Limit approaches Infinity or is undefined due to non-finite values near the point.";
  }


  // Check if the values from left and right are close enough
  if (Math.abs(valueBefore - valueAfter) < (delta * 100)) { // Increased tolerance slightly
    const averageValue = (valueBefore + valueAfter) / 2;
    return averageValue.toPrecision(7); // Use toPrecision for better formatting
  } else {
    // More detailed info if they are different
    const beforeStr = valueBefore.toPrecision(7);
    const afterStr = valueAfter.toPrecision(7);
    return `Limit may not exist or is a jump discontinuity (approaching ${beforeStr} from one side, ${afterStr} from the other).`;
  }
}
