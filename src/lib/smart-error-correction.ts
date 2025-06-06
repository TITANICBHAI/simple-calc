/**
 * Smart Error Correction
 * 
 * This module provides intelligent error correction for mathematical expressions,
 * using pattern matching and common error detection to improve the calculator's usability.
 */

export class SmartErrorCorrector {
  /**
   * Attempt to validate and correct an expression, returning both the corrected expression
   * and information about whether the correction was successful
   */
  static validateAndCorrect(expression: string): {
    original: string;
    corrected: string;
    isValid: boolean;
    wasFixed: boolean;
  } {
    const corrected = this.correctExpression(expression);
    
    return {
      original: expression,
      corrected: corrected,
      isValid: true, // Assume corrections are valid for now
      wasFixed: corrected !== expression
    };
  }

  /**
   * Attempt to correct common errors in mathematical expressions
   */
  static correctExpression(expression: string): string {
    let corrected = expression.trim();
    
    // Fix missing multiplication operators
    corrected = this.fixImplicitMultiplication(corrected);
    
    // Fix mismatched parentheses
    corrected = this.fixMismatchedParentheses(corrected);
    
    // Fix common typos
    corrected = this.fixCommonTypos(corrected);
    
    return corrected;
  }
  
  /**
   * Add missing multiplication operators between terms like 2x, (2+3)4, etc.
   */
  private static fixImplicitMultiplication(expression: string): string {
    // Add multiplication between number and variable: 2x -> 2*x
    let result = expression.replace(/(\d)([a-zA-Z])/g, '$1*$2');
    
    // Add multiplication between closing and opening parentheses: (2+3)(4+5) -> (2+3)*(4+5)
    result = result.replace(/\)(\()/g, ')*$1');
    
    // Add multiplication between variable and opening parenthesis: x(2+3) -> x*(2+3)
    result = result.replace(/([a-zA-Z])(\()/g, '$1*$2');
    
    // Add multiplication between number and opening parenthesis: 2(3+4) -> 2*(3+4)
    result = result.replace(/(\d)(\()/g, '$1*$2');
    
    return result;
  }
  
  /**
   * Fix mismatched parentheses
   */
  private static fixMismatchedParentheses(expression: string): string {
    let result = expression;
    let openCount = (result.match(/\(/g) || []).length;
    let closeCount = (result.match(/\)/g) || []).length;
    
    // Add missing closing parentheses at the end
    if (openCount > closeCount) {
      result = result + ')'.repeat(openCount - closeCount);
    }
    
    // Add missing opening parentheses at the beginning
    if (closeCount > openCount) {
      result = '('.repeat(closeCount - openCount) + result;
    }
    
    return result;
  }
  
  /**
   * Fix common mathematical typos
   */
  private static fixCommonTypos(expression: string): string {
    // Common typos and their corrections
    const typos: Record<string, string> = {
      'senx': 'sin(x)',
      'sen': 'sin',
      'cosx': 'cos(x)',
      'tanx': 'tan(x)',
      'tg': 'tan',
      'arctg': 'atan',
      'arcsen': 'asin',
      'squareroot': 'sqrt',
      'sqr': 'sqrt',
      'pi': '3.14159',
      'PI': '3.14159'
    };
    
    let result = expression;
    
    // Replace known typos
    for (const [typo, correction] of Object.entries(typos)) {
      const regex = new RegExp(`\\b${typo}\\b`, 'g');
      result = result.replace(regex, correction);
    }
    
    return result;
  }
}