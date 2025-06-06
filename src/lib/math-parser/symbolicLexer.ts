// src/lib/math-parser/symbolicLexer.ts
export enum TokenType {
  Number = 'Number',
  Identifier = 'Identifier',
  Operator = 'Operator',
  ParenOpen = 'ParenOpen',
  ParenClose = 'ParenClose',
  Comma = 'Comma'
}

export interface Token {
  type: TokenType; // Now uses the enum for type safety
  value: string;
  position: number;
}

const operatorSet = new Set(['+', '-', '*', '/', '^', '=', '<', '>', '!', '%']);
// No need for singleCharTokens map if we use enum values directly for types
// but the parser can still match string values for operators.

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  const isDigit = (char: string) => /\d/.test(char);
  const isLetter = (char: string) => /[a-zA-Z_]/.test(char); // Allow underscore at start

  while (i < input.length) {
    const char = input[i];
    const position = i;

    if (char === ' ' || char === '\t' || char === '\n') {
      i++;
      continue;
    }

    if (isDigit(char) || (char === '.' && i + 1 < input.length && isDigit(input[i + 1]))) {
      let num = '';
      if (char === '.' && (i === 0 || (i > 0 && !isDigit(input[i-1])) ) ) {
          // Allow numbers starting with a decimal point, e.g., .5
          // No change needed here as the loop below handles it.
      }
      const start = i;
      while (i < input.length && (isDigit(input[i]) || input[i] === '.')) {
        num += input[i++];
      }
      if ((num.match(/\./g) || []).length > 1 || num === '.' ) {
         throw new Error(`Invalid number format '${num}' at position ${start}`);
      }
      // Handle cases like "0." without a following digit if that's an error for you.
      // For now, it's accepted.
      tokens.push({ type: TokenType.Number, value: num, position: start });
      continue;
    }

    if (isLetter(char)) {
      let id = '';
      const start = i;
      while (i < input.length && (isLetter(input[i]) || isDigit(input[i]) || input[i] === '_')) {
        id += input[i++];
      }
      // Support 'i' as imaginary unit for complex numbers
      if (id === 'i') {
        tokens.push({ type: TokenType.Identifier, value: id, position: start });
        continue;
      }
      tokens.push({ type: TokenType.Identifier, value: id, position: start });
      continue;
    }

    if (operatorSet.has(char) || char === ';') {
      tokens.push({ type: TokenType.Operator, value: char, position });
      i++;
      continue;
    }

    if (char === '(') {
      tokens.push({ type: TokenType.ParenOpen, value: char, position });
      i++;
      continue;
    }
    if (char === ')') {
      tokens.push({ type: TokenType.ParenClose, value: char, position });
      i++;
      continue;
    }
    if (char === ',') {
      tokens.push({ type: TokenType.Comma, value: char, position });
      i++;
      continue;
    }

    throw new Error(`Unknown character '${char}' at position ${position}`);
  }

  return tokens;
}
