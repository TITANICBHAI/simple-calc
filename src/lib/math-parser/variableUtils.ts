import { FUNCTIONS as PREDEFINED_FUNCTIONS, CONSTANTS as PREDEFINED_CONSTANTS } from '@/lib/math-parser/symbolicEvaluator';

const COMMON_VARIABLES = ['x', 'y', 'z', 't', 'a', 'b', 'c', 'm', 'n', 'k'];
const VARIABLE_REGEX = /\b[a-zA-Z_][a-zA-Z0-9_]*\b/g;

export interface VariableValidationResult {
  isValid: boolean;
  error?: string;
  value?: number;
}

export function detectVariables(expression: string): string[] {
  const knownFunctionsAndConstants = new Set(
    Object.keys(PREDEFINED_FUNCTIONS)
      .map(k => k.toLowerCase())
      .concat(Object.keys(PREDEFINED_CONSTANTS).map(k => k.toLowerCase()))
  );

  const matches = new Set<string>();
  let match;

  while ((match = VARIABLE_REGEX.exec(expression)) !== null) {
    const potentialVar = match[0];
    if (!knownFunctionsAndConstants.has(potentialVar.toLowerCase()) &&
        !/^\d+$/.test(potentialVar)) {
      matches.add(potentialVar);
    }
  }

  return Array.from(matches);
}

export function validateVariableValue(value: string): VariableValidationResult {
  if (!value.trim()) {
    return {
      isValid: false,
      error: "Value cannot be empty"
    };
  }

  const numValue = parseFloat(value);
  if (isNaN(numValue)) {
    return {
      isValid: false,
      error: "Must be a valid number"
    };
  }

  if (!isFinite(numValue)) {
    return {
      isValid: false,
      error: "Value must be finite"
    };
  }

  return {
    isValid: true,
    value: numValue
  };
}

export function getVariableScope(variables: Record<string, string>): Record<string, number> {
  const scope: Record<string, number> = {};
  
  for (const [name, value] of Object.entries(variables)) {
    const validation = validateVariableValue(value);
    if (validation.isValid && typeof validation.value === 'number') {
      scope[name] = validation.value;
    }
  }

  return scope;
}

export function suggestVariableValue(variable: string): string {
  // Common sensible defaults for certain variables
  const defaults: Record<string, string> = {
    x: '0',
    t: '0',
    n: '1',
    k: '1',
    r: '1',
    theta: '0',
    phi: '0',
    alpha: '1',
    beta: '1',
    gamma: '1',
  };

  return defaults[variable] || '0';
}

export function isComplexExpression(expression: string): boolean {
  // Check for indicators of complex expressions
  const complexityIndicators = [
    /\b(sin|cos|tan|log|ln)\b/, // Transcendental functions
    /\^[^2]/, // Powers other than squared
    /\bx\b.*\bx\b/, // Multiple occurrences of x
    /[a-zA-Z].*[a-zA-Z]/, // Multiple variables
    /\(.*\(/, // Nested parentheses
  ];

  return complexityIndicators.some(pattern => pattern.test(expression));
}
