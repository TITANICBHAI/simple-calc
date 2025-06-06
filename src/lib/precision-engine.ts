/**
 * Precision Mathematical Engine
 * High-precision calculations with custom formatting
 */

import { evaluate, format } from 'mathjs';

export interface PrecisionSettings {
  decimalPlaces: number;
  scientificNotation: boolean;
  thousandsSeparator: boolean;
  roundingMode: 'round' | 'floor' | 'ceil' | 'truncate';
  errorHandling: 'strict' | 'graceful' | 'silent';
}

export interface PrecisionResult {
  value: string;
  displayValue: string;
  scientificValue: string;
  engineeringValue: string;
  fractionValue?: string;
  precision: number;
  actualDigits: number;
  method: string;
  computationTime: number;
}

export class PrecisionEngine {
  private static settings: PrecisionSettings = {
    decimalPlaces: 15,
    roundingMode: 'round',
    scientificNotation: false,
    thousandsSeparator: true,
    errorHandling: 'graceful'
  };

  /**
   * Calculate with high precision and custom formatting
   */
  static calculateWithPrecision(
    expression: string, 
    customSettings?: Partial<PrecisionSettings>
  ): PrecisionResult {
    const startTime = performance.now();
    const config = { ...this.settings, ...customSettings };

    try {
      // Enhanced expression preprocessing
      const processedExpression = this.preprocessExpression(expression);
      
      // High-precision calculation
      const result = evaluate(processedExpression);
      
      // Format with specified precision
      const valueStr = this.formatWithPrecision(result, config.decimalPlaces);
      
      // Generate different representations
      const displayValue = this.formatForDisplay(valueStr, config);
      const scientificValue = this.toScientificNotation(result);
      const engineeringValue = this.toEngineeringNotation(result);
      const fractionValue = this.tryConvertToFraction(result);

      const endTime = performance.now();

      return {
        value: valueStr,
        displayValue,
        scientificValue,
        engineeringValue,
        fractionValue,
        precision: config.decimalPlaces,
        actualDigits: this.countSignificantDigits(valueStr),
        method: 'Enhanced Precision',
        computationTime: endTime - startTime
      };

    } catch (error) {
      if (config.errorHandling === 'strict') {
        throw error;
      } else if (config.errorHandling === 'graceful') {
        return this.createErrorResult(error instanceof Error ? error.message : 'Calculation failed');
      } else {
        return this.createErrorResult('Error');
      }
    }
  }

  /**
   * Preprocess mathematical expression for better accuracy
   */
  private static preprocessExpression(expression: string): string {
    let processed = expression;

    // Replace common mathematical constants with high-precision values
    processed = processed.replace(/\bpi\b|π/gi, Math.PI.toString());
    processed = processed.replace(/\be\b(?![0-9a-zA-Z])/gi, Math.E.toString());
    processed = processed.replace(/\bphi\b/gi, ((1 + Math.sqrt(5)) / 2).toString());

    // Normalize operators
    processed = processed.replace(/\s+/g, '');
    processed = processed.replace(/×/g, '*');
    processed = processed.replace(/÷/g, '/');
    processed = processed.replace(/\^/g, '^');

    // Handle implicit multiplication
    processed = processed.replace(/(\d)([a-zA-Z(])/g, '$1*$2');
    processed = processed.replace(/([a-zA-Z)])(\d)/g, '$1*$2');
    processed = processed.replace(/(\))(\()/g, '$1*$2');

    return processed;
  }

  /**
   * Format number with specified precision
   */
  private static formatWithPrecision(num: number, precision: number): string {
    if (!isFinite(num)) {
      return num.toString();
    }

    // Use toFixed for consistent decimal places
    return num.toFixed(precision);
  }

  /**
   * Format for display with user preferences
   */
  private static formatForDisplay(value: string, config: PrecisionSettings): string {
    let formatted = value;

    // Remove trailing zeros if not in scientific notation
    if (!config.scientificNotation) {
      formatted = parseFloat(formatted).toString();
    }

    // Add thousands separator
    if (config.thousandsSeparator) {
      const parts = formatted.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      formatted = parts.join('.');
    }

    return formatted;
  }

  /**
   * Convert to scientific notation
   */
  private static toScientificNotation(num: number): string {
    if (!isFinite(num)) return num.toString();
    return num.toExponential(6);
  }

  /**
   * Convert to engineering notation
   */
  private static toEngineeringNotation(num: number): string {
    if (!isFinite(num)) return num.toString();
    
    const exp = Math.floor(Math.log10(Math.abs(num)));
    const engExp = Math.floor(exp / 3) * 3;
    const mantissa = num / Math.pow(10, engExp);
    
    return `${mantissa.toFixed(3)}e${engExp >= 0 ? '+' : ''}${engExp}`;
  }

  /**
   * Try to convert decimal to fraction
   */
  private static tryConvertToFraction(num: number): string | undefined {
    if (!isFinite(num) || Math.abs(num) > 1000000) return undefined;

    // Simple fraction conversion for common decimals
    const fractions = [
      [0.5, '1/2'],
      [0.25, '1/4'], [0.75, '3/4'],
      [0.125, '1/8'], [0.375, '3/8'], [0.625, '5/8'], [0.875, '7/8'],
      [0.1, '1/10'], [0.2, '1/5'], [0.3, '3/10'], [0.4, '2/5'],
      [0.6, '3/5'], [0.7, '7/10'], [0.8, '4/5'], [0.9, '9/10'],
      [0.333333, '1/3'], [0.666667, '2/3'],
      [0.166667, '1/6'], [0.833333, '5/6']
    ];

    const tolerance = 0.000001;
    for (const [decimal, fraction] of fractions) {
      if (Math.abs(num - decimal) < tolerance) {
        return fraction;
      }
    }

    return undefined;
  }

  /**
   * Count significant digits in a number string
   */
  private static countSignificantDigits(numStr: string): number {
    const cleaned = numStr.replace(/[^\d.]/g, '');
    const parts = cleaned.split('.');
    
    if (parts.length === 1) {
      // Integer - count non-zero digits and trailing zeros after first non-zero
      const trimmed = parts[0].replace(/^0+/, '');
      return trimmed.length;
    } else {
      // Decimal - count all digits except leading zeros
      const allDigits = parts.join('');
      const trimmed = allDigits.replace(/^0+/, '');
      return trimmed.length;
    }
  }

  /**
   * Create error result
   */
  private static createErrorResult(message: string): PrecisionResult {
    return {
      value: 'Error',
      displayValue: message,
      scientificValue: 'Error',
      engineeringValue: 'Error',
      precision: 0,
      actualDigits: 0,
      method: 'Error',
      computationTime: 0
    };
  }

  /**
   * Update precision settings
   */
  static updateSettings(newSettings: Partial<PrecisionSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  /**
   * Get current settings
   */
  static getSettings(): PrecisionSettings {
    return { ...this.settings };
  }
}