export class ParseError extends Error {
  constructor(message: string, public details?: string) {
    super(message);
    this.name = 'ParseError';
  }
}

export function handleParseError(error: unknown): ParseError {
  if (error instanceof ParseError) {
    return error;
  }

  const message = error instanceof Error ? error.message : String(error);
  
  // Common mathematical errors
  if (message.includes('division by zero')) {
    return new ParseError('Division by zero', 'Cannot divide by zero');
  }
  if (message.includes('undefined') || message.includes('NaN')) {
    return new ParseError('Undefined result', 'The expression leads to an undefined result');
  }
  if (message.includes('infinity') || message.includes('Infinity')) {
    return new ParseError('Infinite result', 'The expression leads to an infinite result');
  }

  // Syntax errors
  if (message.includes('unexpected token')) {
    return new ParseError('Syntax error', 'Check your expression for missing operators or parentheses');
  }
  if (message.includes('unexpected end')) {
    return new ParseError('Incomplete expression', 'The expression appears to be incomplete');
  }

  // Variable errors
  if (message.includes('undefined variable')) {
    return new ParseError('Undefined variable', 'Make sure all variables have values assigned');
  }

  // Function errors
  if (message.includes('not a function')) {
    return new ParseError('Invalid function', 'Check that you\'re using valid mathematical functions');
  }

  // Domain errors
  if (message.includes('domain error')) {
    return new ParseError('Domain error', 'The input is outside the valid domain for this operation');
  }

  // Fallback
  return new ParseError('Calculation error', message);
}

export function validateExpression(expression: string): { isValid: boolean; error?: ParseError } {
  // Basic validation
  if (!expression.trim()) {
    return {
      isValid: false,
      error: new ParseError('Empty expression', 'Please enter an expression')
    };
  }

  // Check for balanced parentheses
  const stack: string[] = [];
  for (const char of expression) {
    if (char === '(') {
      stack.push(char);
    } else if (char === ')') {
      if (stack.length === 0) {
        return {
          isValid: false,
          error: new ParseError('Unbalanced parentheses', 'Missing opening parenthesis')
        };
      }
      stack.pop();
    }
  }
  if (stack.length > 0) {
    return {
      isValid: false,
      error: new ParseError('Unbalanced parentheses', 'Missing closing parenthesis')
    };
  }

  // Check for invalid operators
  const operators = expression.match(/[+\-*/^%&|<>~]+/g);
  if (operators) {
    for (const op of operators) {
      if (!/^[+\-*/^%]$/.test(op)) {
        return {
          isValid: false,
          error: new ParseError('Invalid operator', `Operator "${op}" is not supported`)
        };
      }
    }
  }

  // Check for consecutive operators
  if (/[+\-*/^%]{2,}/.test(expression)) {
    return {
      isValid: false,
      error: new ParseError('Invalid syntax', 'Consecutive operators are not allowed')
    };
  }

  // Check for invalid function calls
  const functionCalls = expression.match(/\w+\s*\(/g);
  if (functionCalls) {
    for (const call of functionCalls) {
      const func = call.replace(/[\s(]/g, '');
      if (!/^(sin|cos|tan|log|ln|sqrt|abs|floor|ceil|round|max|min)$/.test(func)) {
        return {
          isValid: false,
          error: new ParseError('Invalid function', `Function "${func}" is not supported`)
        };
      }
    }
  }

  return { isValid: true };
}
