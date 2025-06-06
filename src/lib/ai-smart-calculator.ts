/**
 * AI-Powered Smart Calculator Service
 * Integrates with Groq APIs (Mixtral / LLaMA3) for intelligent math processing
 */

import * as dotenv from 'dotenv';
dotenv.config();

interface ValidationResult {
  isValid: boolean;
  status: 'valid' | 'warning' | 'error' | 'empty';
  message: string;
  suggestions: string[];
  fixes: string[];
  confidence: number;
}

interface NLPResult {
  mathExpression: string;
  confidence: number;
  interpretation: string;
  suggestions: string[];
}

export class AISmartCalculator {
  private static groqApiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;

  /**
   * Real-time validation with AI-powered error detection
   */
  static async validateExpression(expression: string): Promise<ValidationResult> {
    if (!expression.trim()) {
      return {
        isValid: true,
        status: 'empty',
        message: 'Start typing...',
        suggestions: [],
        fixes: [],
        confidence: 0
      };
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.groqApiKey}`
        },
        body: JSON.stringify({
          model: 'mixtral-8x7b-32768',
          messages: [
            {
              role: 'system',
              content: `You are a precise and strict AI math assistant. You ONLY return structured JSON. Given a math expression or error, validate or correct it.

Always respond like:
{
  "isValid": true/false,
  "status": "valid" | "warning" | "error",
  "message": "...",
  "suggestions": [...],
  "fixes": [...],
  "confidence": 0.0-1.0
}

Don't respond with any greeting or explanation. Only return valid JSON.`
            },
            {
              role: 'user',
              content: `Validate this: "${expression}". Return only JSON.`
            }
          ],
          max_tokens: 512,
          temperature: 0.3,
          top_p: 0.9
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        try {
          const result = JSON.parse(content);
          return {
            isValid: result.isValid ?? false,
            status: result.status ?? 'error',
            message: result.message ?? 'Invalid expression',
            suggestions: result.suggestions ?? [],
            fixes: result.fixes ?? [],
            confidence: result.confidence ?? 0.5
          };
        } catch {
          return this.fallbackValidation(expression);
        }
      }
    } catch (error) {
      console.log('AI validation failed, using fallback');
    }

    return this.fallbackValidation(expression);
  }

  /**
   * Smart error correction with AI suggestions
   */
  static async correctExpression(expression: string, error: string): Promise<{
    corrected: string;
    explanation: string;
    confidence: number;
    alternatives: string[];
  }> {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.groqApiKey}`
        },
        body: JSON.stringify({
          model: 'mixtral-8x7b-32768',
          messages: [
            {
              role: 'system',
              content: `You are a math expression corrector. Fix math expressions and return only JSON:

{
  "corrected": "...",
  "explanation": "...",
  "confidence": 0.0-1.0,
  "alternatives": [...]
}`
            },
            {
              role: 'user',
              content: `Correct this expression: "${expression}" (Error: ${error})`
            }
          ],
          temperature: 0.3,
          max_tokens: 512,
          top_p: 0.9
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        try {
          const result = JSON.parse(content);
          return {
            corrected: result.corrected ?? expression,
            explanation: result.explanation ?? 'Applied basic correction',
            confidence: result.confidence ?? 0.5,
            alternatives: result.alternatives ?? []
          };
        } catch {
          return this.fallbackCorrection(expression);
        }
      }
    } catch (error) {
      console.log('AI correction failed, using fallback');
    }

    return this.fallbackCorrection(expression);
  }

  /**
   * Natural language to math expression conversion
   */
  static async parseNaturalLanguage(text: string): Promise<NLPResult> {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.groqApiKey}`
        },
        body: JSON.stringify({
          model: 'mixtral-8x7b-32768',
          messages: [
            {
              role: 'system',
              content: `You convert math-related natural language into expressions and respond with ONLY JSON:
{
  "mathExpression": "...",
  "confidence": 0.0-1.0,
  "interpretation": "...",
  "suggestions": [...]
}`
            },
            {
              role: 'user',
              content: `Convert this to a math expression: "${text}"`
            }
          ],
          temperature: 0.3,
          max_tokens: 512,
          top_p: 0.9
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        try {
          const result = JSON.parse(content);
          return {
            mathExpression: result.mathExpression ?? text,
            confidence: result.confidence ?? 0.3,
            interpretation: result.interpretation ?? 'Converted from natural language',
            suggestions: result.suggestions ?? []
          };
        } catch {
          return this.fallbackNLP(text);
        }
      }
    } catch (error) {
      console.log('NLP failed, using fallback');
    }

    return this.fallbackNLP(text);
  }

  // You can copy your original fallback methods here:
  private static fallbackValidation(expression: string): ValidationResult {
    return {
      isValid: false,
      status: 'error',
      message: 'Fallback: Unable to validate expression.',
      suggestions: [],
      fixes: [],
      confidence: 0.2
    };
  }

  private static fallbackCorrection(expression: string) {
    return {
      corrected: expression,
      explanation: 'Fallback: No correction applied.',
      confidence: 0.2,
      alternatives: []
    };
  }

  private static fallbackNLP(text: string): NLPResult {
    return {
      mathExpression: text,
      confidence: 0.2,
      interpretation: 'Fallback: No conversion applied.',
      suggestions: []
    };
  }
}
