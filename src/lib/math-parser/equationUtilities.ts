// src/lib/math-parser/equationUtilities.ts
import { parse, simplify } from 'mathjs'; // Ensure mathjs is a dependency

export function rearrangeEquation(equation: string, solveFor?: string /* solveFor is not used by current simplify logic but kept for signature consistency with potential future symbolic solvers */) {
  const parts = equation.split('=');
  if (parts.length !== 2) {
    return { error: 'Equation must contain exactly one equals sign (=) to rearrange.' };
  }
  const lhs = parts[0].trim();
  const rhs = parts[1].trim();

  if (!lhs || !rhs) {
    return { error: 'Both sides of the equation must have content.'};
  }

  // Reconstruct as expression: lhs - (rhs) = 0
  // Parenthesize rhs to ensure correct subtraction order
  const exprStr = `${lhs} - (${rhs})`;

  try {
    // math.js simplify can handle basic algebraic simplifications
    const simplifiedNode = simplify(exprStr); 
    const simplifiedString = simplifiedNode.toString({parenthesis: 'auto', implicit: 'hide'});

    return {
      original: equation,
      rearranged: `${simplifiedString} = 0`,
      note: `Rearranged to the form 'expression = 0' and simplified using math.js.`
    };
  } catch (err: any) {
    console.error("Error rearranging/simplifying equation:", err);
    return { error: `Failed to rearrange or simplify: ${err.message || String(err)}` };
  }
}


export function generateCodeFromEquation(equation: string, lang: 'ts' | 'py' | 'latex') {
  const parts = equation.split('=').map(s => s.trim());
  if (parts.length !== 2) {
      return `// Invalid equation: ${equation}`;
  }
  const lhs = parts[0];
  const rhs = parts[1];

  const codeSnippets = {
    ts: `// Equation: ${lhs} = ${rhs}\n// Assuming variables are defined and rhs is an evaluable expression\nconst result = ${rhs};`,
    py: `# Equation: ${lhs} = ${rhs}\n# Assuming variables are defined and rhs is an evaluable expression\nresult = ${rhs}`,
    latex: `\\[ ${lhs} = ${rhs} \\]` // Using block display for LaTeX
  };

  return codeSnippets[lang] || `// Language ${lang} not supported for this simple generator.`;
}