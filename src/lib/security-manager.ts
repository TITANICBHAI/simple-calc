/**
 * Security Manager - Comprehensive security layer for mathematical engines
 */

interface SecurityConfig {
  maxExpressionLength: number;
  maxParseDepth: number;
  maxExecutionTime: number;
  allowedFunctions: Set<string>;
  blockedPatterns: RegExp[];
  maxMemoryUsage: number;
}

interface ValidationResult {
  isValid: boolean;
  sanitized: string;
  warnings: string[];
  blocked: string[];
}

export class SecurityManager {
  private static readonly DEFAULT_CONFIG: SecurityConfig = {
    maxExpressionLength: 1000,
    maxParseDepth: 50,
    maxExecutionTime: 5000,
    allowedFunctions: new Set([
      'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2',
      'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
      'log', 'ln', 'log10', 'log2', 'exp', 'sqrt', 'cbrt',
      'abs', 'ceil', 'floor', 'round', 'max', 'min',
      'pow', 'factorial', 'gamma', 'derivative', 'integral'
    ]),
    blockedPatterns: [
      /eval\s*\(/i,
      /function\s*\(/i,
      /new\s+Function/i,
      /constructor/i,
      /prototype/i,
      /__proto__/i,
      /import\s/i,
      /require\s*\(/i,
      /process\./i,
      /global\./i,
      /window\./i,
      /document\./i,
      /location\./i,
      /setTimeout/i,
      /setInterval/i,
      /fetch\s*\(/i,
      /XMLHttpRequest/i,
      /\.constructor/i,
    ],
    maxMemoryUsage: 50 * 1024 * 1024 // 50MB
  };

  /**
   * Validate and sanitize mathematical expression
   */
  static validateExpression(expression: string): ValidationResult {
    const warnings: string[] = [];
    const blocked: string[] = [];
    let sanitized = expression.trim();

    // Length check
    if (sanitized.length > this.DEFAULT_CONFIG.maxExpressionLength) {
      return {
        isValid: false,
        sanitized: '',
        warnings: ['Expression too long'],
        blocked: ['Length limit exceeded']
      };
    }

    // Check for blocked patterns
    for (const pattern of this.DEFAULT_CONFIG.blockedPatterns) {
      if (pattern.test(sanitized)) {
        blocked.push(`Blocked pattern: ${pattern.source}`);
      }
    }

    if (blocked.length > 0) {
      return {
        isValid: false,
        sanitized: '',
        warnings,
        blocked
      };
    }

    // Sanitize the expression
    sanitized = this.sanitizeExpression(sanitized);

    // Check for potentially dangerous sequences
    this.checkForWarnings(sanitized, warnings);

    return {
      isValid: true,
      sanitized,
      warnings,
      blocked
    };
  }

  /**
   * Sanitize mathematical expression
   */
  private static sanitizeExpression(expression: string): string {
    let sanitized = expression;

    // Remove comments
    sanitized = sanitized.replace(/\/\*[\s\S]*?\*\//g, '');
    sanitized = sanitized.replace(/\/\/.*$/gm, '');

    // Normalize whitespace
    sanitized = sanitized.replace(/\s+/g, ' ').trim();

    // Remove null bytes and control characters
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

    // Escape potentially dangerous characters
    sanitized = sanitized.replace(/[<>\"'`]/g, '');

    return sanitized;
  }

  /**
   * Check for potential security warnings
   */
  private static checkForWarnings(expression: string, warnings: string[]): void {
    // Check for very long chains of operations
    if ((expression.match(/[\+\-\*\/\^]/g) || []).length > 100) {
      warnings.push('Expression contains many operations - may impact performance');
    }

    // Check for deep nesting
    const openParens = (expression.match(/\(/g) || []).length;
    const closeParens = (expression.match(/\)/g) || []).length;
    
    if (openParens !== closeParens) {
      warnings.push('Unmatched parentheses detected');
    }

    if (openParens > 20) {
      warnings.push('Deep nesting detected - may impact performance');
    }

    // Check for unusual character sequences
    if (/[^\w\s\+\-\*\/\^\(\)\.,=<>]/g.test(expression)) {
      warnings.push('Contains unusual characters');
    }
  }

  /**
   * Secure API key management
   */
  static async getSecureAPIKey(provider: string): Promise<string | null> {
    const envKeys = {
      groq: process.env.NEXT_PUBLIC_GROQ_API_KEY,
      google: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
      huggingface: process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY,
      openai: process.env.NEXT_PUBLIC_OPENAI_API_KEY
    };

    const key = envKeys[provider as keyof typeof envKeys];
    
    if (!key) {
      return null;
    }

    // Validate key format
    if (!this.validateAPIKeyFormat(key, provider)) {
      console.warn(`Invalid API key format for ${provider}`);
      return null;
    }

    return key;
  }

  /**
   * Validate API key format
   */
  private static validateAPIKeyFormat(key: string, provider: string): boolean {
    const patterns = {
      groq: /^gsk_[a-zA-Z0-9_-]+$/,
      google: /^AIza[0-9A-Za-z_-]{35}$/,
      huggingface: /^hf_[a-zA-Z0-9_-]+$/,
      openai: /^sk-[a-zA-Z0-9_-]+$/
    };

    const pattern = patterns[provider as keyof typeof patterns];
    return pattern ? pattern.test(key) : false;
  }

  /**
   * Rate limiting for API calls
   */
  private static rateLimitStore = new Map<string, number[]>();

  static checkRateLimit(provider: string, limit: number = 60): boolean {
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window

    let requests = this.rateLimitStore.get(provider) || [];
    requests = requests.filter(timestamp => timestamp > windowStart);

    if (requests.length >= limit) {
      return false;
    }

    requests.push(now);
    this.rateLimitStore.set(provider, requests);
    return true;
  }

  /**
   * Secure timeout wrapper for async operations
   */
  static async withTimeout<T>(
    promise: Promise<T>, 
    timeoutMs: number = this.DEFAULT_CONFIG.maxExecutionTime
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  /**
   * Memory usage monitoring
   */
  static checkMemoryUsage(): { usage: number; isWithinLimit: boolean } {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memUsage = process.memoryUsage();
      const totalUsage = memUsage.heapUsed + memUsage.external;
      
      return {
        usage: totalUsage,
        isWithinLimit: totalUsage < this.DEFAULT_CONFIG.maxMemoryUsage
      };
    }

    return { usage: 0, isWithinLimit: true };
  }

  /**
   * Secure error handling
   */
  static sanitizeError(error: unknown): string {
    if (error instanceof Error) {
      // Remove potentially sensitive information from error messages
      let message = error.message;
      
      // Remove file paths
      message = message.replace(/\/[^\s]+/g, '[PATH]');
      
      // Remove API keys or tokens
      message = message.replace(/[a-zA-Z0-9_-]{20,}/g, '[TOKEN]');
      
      // Remove internal details
      message = message.replace(/at [^\n]+/g, '');
      
      return message.trim();
    }

    return 'An unknown error occurred';
  }

  /**
   * Log security events
   */
  static logSecurityEvent(event: string, details: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      event,
      details: this.sanitizeLogData(details)
    };

    // In production, send to security monitoring service
    if (process.env.NODE_ENV === 'development') {
      console.warn('[SECURITY]', logEntry);
    }
  }

  /**
   * Sanitize log data to prevent information leakage
   */
  private static sanitizeLogData(data: any): any {
    if (typeof data === 'string') {
      return data.replace(/[a-zA-Z0-9_-]{20,}/g, '[REDACTED]');
    }

    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        if (key.toLowerCase().includes('key') || key.toLowerCase().includes('token')) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = this.sanitizeLogData(value);
        }
      }
      return sanitized;
    }

    return data;
  }

  /**
   * Get security configuration
   */
  static getConfig(): SecurityConfig {
    return { ...this.DEFAULT_CONFIG };
  }

  /**
   * Update security configuration
   */
  static updateConfig(updates: Partial<SecurityConfig>): void {
    Object.assign(this.DEFAULT_CONFIG, updates);
  }
}