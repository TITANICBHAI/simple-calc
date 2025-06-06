// src/lib/math-parser/symbolicEvaluator.ts
import { type ASTNode } from './symbolicParser';

export const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
};

// --- Combinatorics ---
function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) throw new Error('Factorial only defined for non-negative integers');
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}
function ncr(n: number, r: number): number {
  if (n < 0 || r < 0 || !Number.isInteger(n) || !Number.isInteger(r) || r > n) throw new Error('nCr only defined for non-negative integers with r ≤ n');
  return factorial(n) / (factorial(r) * factorial(n - r));
}
function npr(n: number, r: number): number {
  if (n < 0 || r < 0 || !Number.isInteger(n) || !Number.isInteger(r) || r > n) throw new Error('nPr only defined for non-negative integers with r ≤ n');
  return factorial(n) / factorial(n - r);
}

// --- Financial ---
function pv(fv: number, r: number, n: number): number { return fv / Math.pow(1 + r, n); }
function fv(pv: number, r: number, n: number): number { return pv * Math.pow(1 + r, n); }
function pmt(pv: number, r: number, n: number): number { return (pv * r) / (1 - Math.pow(1 + r, -n)); }
function npv(r: number, ...cashflows: number[]): number {
  return cashflows.reduce((acc, cf, i) => acc + cf / Math.pow(1 + r, i + 1), 0);
}
function irr(...cashflows: number[]): number {
  let guess = 0.1;
  for (let iter = 0; iter < 100; iter++) {
    let npvVal = 0, dnpv = 0;
    for (let i = 0; i < cashflows.length; i++) {
      npvVal += cashflows[i] / Math.pow(1 + guess, i);
      if (i > 0) dnpv -= i * cashflows[i] / Math.pow(1 + guess, i + 1);
    }
    const newGuess = guess - npvVal / dnpv;
    if (Math.abs(newGuess - guess) < 1e-7) return newGuess;
    guess = newGuess;
  }
  throw new Error('IRR did not converge');
}

// --- Statistics ---
function mean(...nums: number[]): number { return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : NaN; }
function median(...nums: number[]): number {
  if (!nums.length) return NaN;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}
function mode(...nums: number[]): number {
  if (!nums.length) return NaN;
  const freq: Record<number, number> = {};
  nums.forEach(n => freq[n] = (freq[n] || 0) + 1);
  let maxFreq = 0, modeVal = NaN;
  for (const n in freq) {
    if (freq[n] > maxFreq) { maxFreq = freq[n]; modeVal = Number(n); }
  }
  return modeVal;
}
function stddev(...nums: number[]): number {
  if (!nums.length) return NaN;
  const m = mean(...nums);
  return Math.sqrt(nums.reduce((acc, n) => acc + (n - m) ** 2, 0) / nums.length);
}
function variance(...nums: number[]): number {
  if (!nums.length) return NaN;
  const m = mean(...nums);
  return nums.reduce((acc, n) => acc + (n - m) ** 2, 0) / nums.length;
}

export const FUNCTIONS: Record<string, (...args: number[]) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  asinh: Math.asinh,
  acosh: Math.acosh,
  atanh: Math.atanh,
  ln: Math.log,      // Natural logarithm
  log10: Math.log10, // Base-10 logarithm
  log: Math.log10,   // Alias for log10
  log2: Math.log2,   // Base-2 logarithm
  sqrt: Math.sqrt,
  abs: Math.abs,
  exp: Math.exp,     // e^x
  pow: Math.pow,
  round: Math.round,
  floor: Math.floor,
  ceil: Math.ceil,
  min: Math.min,
  max: Math.max,
  // --- Combinatorics ---
  factorial,
  ncr,
  npr,
  // --- Financial ---
  pv,
  fv,
  pmt,
  npv,
  irr,
  // --- Statistics ---
  mean,
  median,
  mode,
  stddev,
  variance,
};

export type Scope = Record<string, number | undefined>;

// Complex number type
export interface Complex {
  re: number;
  im: number;
}

function isComplex(val: any): val is Complex {
  return val && typeof val === 'object' && typeof val.re === 'number' && typeof val.im === 'number';
}

function toComplex(val: number | Complex): Complex {
  if (typeof val === 'number') return { re: val, im: 0 };
  return val;
}

function complexAdd(a: Complex, b: Complex): Complex {
  return { re: a.re + b.re, im: a.im + b.im };
}
function complexSub(a: Complex, b: Complex): Complex {
  return { re: a.re - b.re, im: a.im - b.im };
}
function complexMul(a: Complex, b: Complex): Complex {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re
  };
}
function complexDiv(a: Complex, b: Complex): Complex {
  const denom = b.re * b.re + b.im * b.im;
  return {
    re: (a.re * b.re + a.im * b.im) / denom,
    im: (a.im * b.re - a.re * b.im) / denom
  };
}
function complexPow(a: Complex, b: Complex): Complex {
  // Only support real exponents for now
  if (b.im !== 0) throw new Error('Complex exponents not supported');
  const r = Math.sqrt(a.re * a.re + a.im * a.im);
  const theta = Math.atan2(a.im, a.re);
  const rn = Math.pow(r, b.re);
  const thetan = theta * b.re;
  return { re: rn * Math.cos(thetan), im: rn * Math.sin(thetan) };
}
function complexAbs(a: Complex): number {
  return Math.sqrt(a.re * a.re + a.im * a.im);
}
function complexArg(a: Complex): number {
  return Math.atan2(a.im, a.re);
}

export function evaluateAST(node: ASTNode, scope: Scope = {}): number | string {
  switch (node.type) {
    case 'Number':
      return node.value;
    case 'Complex':
      // Always serialize complex as a+bi string
      return `${node.re}${node.im >= 0 ? '+' : ''}${node.im}i`;
    case 'Assignment': {
      const val = evaluateAST(node.value, scope);
      if (typeof val === 'number') {
        scope[node.name.toLowerCase()] = val;
      }
      return val;
    }
    case 'FunctionDef': {
      // Only store string definition for now
      return `${node.name}(${Array.isArray(node.params) ? node.params.join(',') : ''}) defined`;
    }
    case 'Batch': {
      let last: any = null;
      for (const expr of node.expressions) {
        last = evaluateAST(expr, scope);
      }
      return last;
    }
    case 'Variable': {
      const varNameLower = node.name.toLowerCase();
      if (scope.hasOwnProperty(varNameLower) && typeof scope[varNameLower] === 'number') {
        return scope[varNameLower]!;
      }
      if (CONSTANTS.hasOwnProperty(varNameLower)) {
        return CONSTANTS[varNameLower];
      }
      return node.name;
    }
    case 'Add':
    case 'Subtract':
    case 'Multiply':
    case 'Divide':
    case 'Exponent': {
      const left = evaluateAST(node.left, scope);
      const right = evaluateAST(node.right, scope);
      if (typeof left === 'number' && typeof right === 'number') {
        switch (node.type) {
          case 'Add': return left + right;
          case 'Subtract': return left - right;
          case 'Multiply': return left * right;
          case 'Divide':
            if (right === 0) throw new Error("Division by zero.");
            return left / right;
          case 'Exponent': return left ** right;
        }
      }
      // If either operand is a complex string, just return symbolic string
      if ((typeof left === 'string' && left.match(/^[\d.\-+]+[\-+]\d+i$/)) || (typeof right === 'string' && right.match(/^[\d.\-+]+[\-+]\d+i$/))) {
        const opSymbol = ({ Add: '+', Subtract: '-', Multiply: '*', Divide: '/', Exponent: '^' } as Record<string, string>)[node.type];
        return `(${left} ${opSymbol} ${right})`;
      }
      const opSymbol = ({ Add: '+', Subtract: '-', Multiply: '*', Divide: '/', Exponent: '^' } as Record<string, string>)[node.type];
      return `(${left} ${opSymbol} ${right})`;
    }
    case 'FunctionCall': {
      const funcNameLower = node.name.toLowerCase();
      const func = FUNCTIONS[funcNameLower];
      const evaluatedArgs = node.args.map(arg => evaluateAST(arg, scope));
      if (!func) {
        return `${node.name}(${evaluatedArgs.join(', ')})`;
      }
      if (evaluatedArgs.some(arg => typeof arg !== 'number')) {
        return `${node.name}(${evaluatedArgs.join(', ')})`;
      }
      const numericArgs = evaluatedArgs as number[];
      try {
        return func(...numericArgs);
      } catch (e) {
        if (e instanceof Error) {
          throw new Error(`Error in function ${node.name}: ${e.message}`);
        }
        throw new Error(`Unknown error in function ${node.name}`);
      }
    }
    default:
      throw new Error(`Unhandled AST node type: ${(node as any).type}`);
  }
}
