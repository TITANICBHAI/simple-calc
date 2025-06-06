// src/lib/math-parser/multivariableSeries.ts
import { create, all } from 'mathjs'; // mathjs used for parsing, derivatives, evaluation
// const math = create(all); // It's often better to pass math instance or use a singleton. For now, creating locally.

type Point = Record<string, number>;

/**
 * Represents a term in the Taylor series expansion
 */
interface SeriesTermMultivariable {
  termString: string; // The full symbolic string of the term
  coefficientValue: number; // The numerical value of (f^(i,j,...)(a,b,...))/(i!j!...)
  powers: number[]; // The powers [i, j, ...] for each variable
  // We could add more properties if needed, e.g., the derivative expression itself
}

function factorial(n: number): number {
  if (n < 0) return NaN; // Factorial is not defined for negative numbers
  if (n === 0) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

// Generate all (i,j,...) tuples such that i+j+... ≤ order
function* generateMultiIndices(
  numVars: number,
  targetOrder: number,
  currentPowers: number[] = [],
  currentSum: number = 0
): Generator<number[]> {
  if (currentPowers.length === numVars) {
    if (currentSum <= targetOrder) {
      yield currentPowers;
    }
    return;
  }

  for (let p = 0; p <= targetOrder - currentSum; p++) {
    yield* generateMultiIndices(
      numVars,
      targetOrder,
      [...currentPowers, p],
      currentSum + p
    );
  }
}

/**
 * Generate the Multivariable Taylor Series expansion terms for a given expression.
 * @param exprStr - the input function string (e.g., 'x*y + sin(x)')
 * @param vars - array of variable names in order (e.g., ['x', 'y'])
 * @param at - point around which to expand (e.g., { x: 0, y: 0 })
 * @param order - maximum total order of terms to generate (e.g., 2)
 * @returns An array of SeriesTermMultivariable objects or a string error message.
 */
export function generateMultivariableTaylorSeries(
  exprStr: string,
  vars: string[],
  at: Point,
  order: number
): SeriesTermMultivariable[] | string {
  const math = create(all); // Create a mathjs instance
  let exprNode;
  try {
    exprNode = math.parse(exprStr);
  } catch (e) {
    return `Error parsing expression: ${e instanceof Error ? e.message : String(e)}`;
  }

  const terms: SeriesTermMultivariable[] = [];

  if (vars.some(v => at[v] === undefined)) {
    return "Error: Evaluation point 'at' is missing values for some variables.";
  }

  for (const powers of generateMultiIndices(vars.length, order)) {
    const totalOrder = powers.reduce((a, b) => a + b, 0);
    // This check is implicitly handled by generateMultiIndices logic if sum is passed correctly,
    // but good as a safeguard or if generateMultiIndices is less strict.
    if (totalOrder > order) continue;

    // Compute partial derivative
    let derivativeNode = exprNode.clone();
    try {
      for (let i = 0; i < vars.length; i++) {
        for (let j = 0; j < powers[i]; j++) {
          derivativeNode = math.derivative(derivativeNode, vars[i]);
        }
      }
    } catch (e) {
        console.error(`Error computing derivative for powers ${powers}: ${e}`);
        // Skip this term if derivative fails
        continue;
    }


    // Evaluate derivative at the point
    let evaluatedDerivativeValue: number;
    try {
      evaluatedDerivativeValue = derivativeNode.evaluate(at);
      if (typeof evaluatedDerivativeValue !== 'number' || isNaN(evaluatedDerivativeValue) || !isFinite(evaluatedDerivativeValue)) {
        // If derivative evaluates to something non-numeric or non-finite, this term is problematic.
        // Depending on requirements, could skip or represent as symbolic. For simplicity, we'll skip.
        console.warn(`Derivative for powers ${powers} evaluated to non-finite/NaN value at point ${JSON.stringify(at)}. Skipping term.`);
        continue;
      }
    } catch (e) {
      console.warn(`Error evaluating derivative for powers ${powers} at point ${JSON.stringify(at)}: ${e}. Skipping term.`);
      continue;
    }


    // Calculate product of factorials for the denominator
    const factorialsProduct = powers.map(factorial).reduce((a, b) => a * b, 1);
    if (factorialsProduct === 0 || isNaN(factorialsProduct)) { // Should not happen with non-negative powers
        console.warn(`Invalid factorial product for powers ${powers}. Skipping term.`);
        continue;
    }

    const coefficientValue = evaluatedDerivativeValue / factorialsProduct;

    // Build symbolic term string
    const varTermStrings = vars
      .map((v, i) => {
        if (powers[i] === 0) return "";
        // Ensure 'at[v]' is a number for string construction.
        const atVal = typeof at[v] === 'number' ? at[v] : 0;
        const base = `(${v} - ${atVal.toString()})`;
        return powers[i] === 1 ? base : `${base}^${powers[i]}`;
      })
      .filter(Boolean);

    let termString = coefficientValue.toString();
    if (varTermStrings.length > 0) {
      termString += " * " + varTermStrings.join(" * ");
    }
    
    // Attempt to simplify the term string itself (optional, for cleaner display)
    try {
        termString = math.simplify(termString).toString();
    } catch (e) {
        // If simplification fails, use the unsimplified string
        console.warn("Could not simplify term string:", termString, e);
    }


    terms.push({
      termString,
      coefficientValue,
      powers,
    });
  }

  return terms;
}

// === Example Usage (for testing in a Node environment or similar) ===
/*
function test() {
  const expr = "x*y + sin(x)";
  const vars = ["x", "y"];
  const point = { x: 0, y: 1 };
  const order = 2;

  const seriesTerms = generateMultivariableTaylorSeries(expr, vars, point, order);
  
  if (typeof seriesTerms === 'string') {
    console.error(seriesTerms);
  } else {
    console.log(`Multivariable Taylor series for "${expr}" around {x:${point.x}, y:${point.y}} up to order ${order}:`);
    seriesTerms.forEach(t => {
      console.log(`  Order Sum ${t.powers.reduce((a,b)=>a+b,0)}, Powers [${t.powers.join(',')}]: ${t.termString}`);
    });
    
    // Construct the full series string
    const fullSeries = seriesTerms.map(t => t.termString).join(" + ");
    console.log("\nFull series string (unsimplified sum):");
    console.log(fullSeries);

    try {
      const math = create(all);
      const simplifiedFullSeries = math.simplify(fullSeries).toString();
      console.log("\nFull series string (math.simplify on sum):");
      console.log(simplifiedFullSeries);
    } catch(e){
      console.error("\nError simplifying the full series sum:", e);
    }
  }
}

// test();
// Example Output for test():
// Multivariable Taylor series for "x*y + sin(x)" around {x:0, y:1} up to order 2:
//   Order Sum 0, Powers [0,0]: 0
//   Order Sum 1, Powers [0,1]: 0 * (y - 1)  (Simplified: 0)
//   Order Sum 1, Powers [1,0]: 2 * (x - 0)  (Simplified: 2x)
//   Order Sum 2, Powers [0,2]: 0 // (y - 1)^2 (Simplified: 0)
//   Order Sum 2, Powers [1,1]: 1 * (x - 0) * (y - 1) (Simplified: x * (y-1))
//   Order Sum 2, Powers [2,0]: 0 // (x - 0)^2 (Simplified: 0)

// Full series string (unsimplified sum):
// 0 + 0 * (y - 1) + 2 * (x - 0) + 0 + 1 * (x - 0) * (y - 1) + 0
//
// Full series string (math.simplify on sum):
// x * (y - 1) + 2x  (or similar, mathjs simplification can vary)
// which is xy - x + 2x = xy + x.
// Correct:
// f(0,1) = 0*1 + sin(0) = 0
// df/dx = y + cos(x) -> f_x(0,1) = 1 + cos(0) = 1+1 = 2
// df/dy = x          -> f_y(0,1) = 0
// d2f/dx2 = -sin(x)  -> f_xx(0,1) = 0
// d2f/dy2 = 0        -> f_yy(0,1) = 0
// d2f/dxdy = 1       -> f_xy(0,1) = 1
// Series: f(a,b) + f_x(a,b)(x-a) + f_y(a,b)(y-b) + 1/2! [f_xx(x-a)^2 + 2f_xy(x-a)(y-b) + f_yy(y-b)^2]
//       = 0      + 2(x-0)       + 0(y-1)      + 1/2 [0*(x-0)^2 + 2*1*(x-0)(y-1) + 0*(y-1)^2]
//       = 2x + (x)(y-1) = 2x + xy - x = xy + x
*/


    