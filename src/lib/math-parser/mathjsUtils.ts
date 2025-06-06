// src/lib/math-parser/mathjsUtils.ts
import { parse, simplify } from 'mathjs';

export function expandExpression(expr: string): string {
  try {
    const parsed = parse(expr);
    // Math.js .expand() method is available on Node objects
    const expandedNode = parsed.expand();
    return expandedNode.toString();
  } catch (err: any) {
    console.error("Math.js expansion error:", err);
    return `Failed to expand expression: ${err.message || String(err)}`;
  }
}

export function factorExpression(expr: string): string {
  try {
    // math.simplify can perform some factoring, but it's not a dedicated factoring function for complex polynomials.
    // For more advanced factoring, a dedicated CAS or specific algorithms would be needed.
    // The options for simplify can be complex, e.g., to control which rules are applied.
    const simplifiedNode = simplify(expr, {}, { exactFractions: false }); // Added empty scope object as per some simplify signatures
    return simplifiedNode.toString();
  } catch (err: any) {
    console.error("Math.js factoring/simplification error:", err);
    return `Failed to factor/simplify expression: ${err.message || String(err)}`;
  }
}
