// src/lib/math-parser/seriesAnalysis.ts

// Define the structure for known series patterns
interface KnownSeriesPattern {
  match: (expr: string) => RegExpExecArray | null;
  name: string;
  expansion: string; // LaTeX format for series expansion
  domain: string;    // LaTeX format for domain of convergence
  innerExpressionVariable?: string; // e.g., 'x' if the pattern is for f(x)
}

interface KnownSeriesMatchResult {
  matched: boolean;
  name?: string;
  expansion?: string;
  domain?: string;
  inner?: string; // The captured inner part of the expression
}

const knownPatterns: KnownSeriesPattern[] = [
  {
    match: (expr: string) => /^exp\((.+)\)$/i.exec(expr),
    name: "Exponential Series (e^x)",
    expansion: "\\sum_{n=0}^{\\infty} \\frac{x^n}{n!}",
    domain: "x \\in \\mathbb{R}",
    innerExpressionVariable: 'x',
  },
  {
    match: (expr: string) => /^ln\(1 \+ (.+)\)$/i.exec(expr) || /^log\(1 \+ (.+)\)$/i.exec(expr), // Allow log or ln
    name: "Natural Logarithm Series (ln(1+x))",
    expansion: "\\sum_{n=1}^{\\infty} \\frac{(-1)^{n+1} x^n}{n}",
    domain: "|x| < 1, x=1",
    innerExpressionVariable: 'x',
  },
  {
    match: (expr: string) => /^1 \/ \(1 - (.+)\)$/i.exec(expr),
    name: "Geometric Series (1/(1-x))",
    expansion: "\\sum_{n=0}^{\\infty} x^n",
    domain: "|x| < 1",
    innerExpressionVariable: 'x',
  },
  {
    match: (expr: string) => /^sin\((.+)\)$/i.exec(expr),
    name: "Sine Series (sin(x))",
    expansion: "\\sum_{n=0}^{\\infty} \\frac{(-1)^n x^{2n+1}}{(2n+1)!}",
    domain: "x \\in \\mathbb{R}",
    innerExpressionVariable: 'x',
  },
  {
    match: (expr: string) => /^cos\((.+)\)$/i.exec(expr),
    name: "Cosine Series (cos(x))",
    expansion: "\\sum_{n=0}^{\\infty} \\frac{(-1)^n x^{2n}}{(2n)!}",
    domain: "x \\in \\mathbb{R}",
    innerExpressionVariable: 'x',
  },
  // Binomial series (1+x)^k could be added but is more complex due to 'k'
];

export function matchKnownSeries(expr: string): KnownSeriesMatchResult {
  const cleanedExpr = expr.replace(/\s+/g, "").toLowerCase(); // Standardize for matching
  for (const pattern of knownPatterns) {
    const matchResult = pattern.match(cleanedExpr);
    if (matchResult && matchResult[1]) { // matchResult[1] is the captured inner expression
      return {
        matched: true,
        name: pattern.name,
        expansion: pattern.expansion.replace(new RegExp(pattern.innerExpressionVariable || 'x', 'g'), matchResult[1]), // Substitute inner expression
        domain: pattern.domain.replace(new RegExp(pattern.innerExpressionVariable || 'x', 'g'), matchResult[1]),     // Substitute inner expression
        inner: matchResult[1]
      };
    }
  }
  return { matched: false };
}

interface RatioTestSetupResult {
  ratioExpr: string; // LaTeX format for |a_{n+1}/a_n|
  limitExpr: string; // LaTeX format for lim |a_{n+1}/a_n|
}

export function symbolicRatioTest(anExpr: string, variable: string = "n"): RatioTestSetupResult {
  // Sanitize variable for regex: escape special characters
  const escapedVar = variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Replace the variable 'n' (or user-specified) with '(n+1)'
  // Using a regex with word boundaries to avoid partial replacements (e.g. 'sin' becoming 'si(n+1)')
  const nextTermNumerator = anExpr.replace(new RegExp(`\\b${escapedVar}\\b`, 'g'), `(${variable} + 1)`);

  // Using an actual division symbol for LaTeX might be better than '/',
  // but for string representation for limit input, '/' is fine.
  // The KaTeXDisplay component will handle LaTeX rendering later.
  const ratioString = `abs((${nextTermNumerator}) / (${anExpr}))`;
  const ratioLatex = `\\left| \\frac{${nextTermNumerator.replace(new RegExp(`\\b${escapedVar}\\b`, 'g'), `{${variable}+1}`) /* for display */}}{${anExpr}} \\right|`;
  
  return {
    ratioExpr: ratioLatex, // For KaTeX display
    limitExpr: `\\lim_{${variable} \\to \\infty} ${ratioLatex}` // For KaTeX display of the limit setup
    // The actual expression to pass to the limit function would be `ratioString`
  };
}