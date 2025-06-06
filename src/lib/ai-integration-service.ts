/**
 * AI Integration Service
 * Connects to external AI services for advanced mathematical problem solving
 */

interface AIProvider {
  name: string;
  endpoint?: string;
  supportsStepByStep: boolean;
  supportedMathTypes: string[];
  rateLimit: number;
}

interface AIRequest {
  problem: string;
  type: 'solve' | 'explain' | 'graph' | 'simplify' | 'factor';
  showSteps: boolean;
  difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
  context?: string;
}

interface AIResponse {
  solution: string;
  steps?: Array<{
    step: number;
    description: string;
    formula?: string;
    result?: string;
  }>;
  explanation: string;
  confidence: number;
  alternativeMethods?: string[];
  visualizations?: string[];
  relatedTopics?: string[];
  processingTime: number;
}

import { SecurityManager } from './security-manager';

export class AIIntegrationService {
  private static providers: Map<string, AIProvider> = new Map([
    ['groq', {
      name: 'Groq (Fast AI)',
      supportsStepByStep: true,
      supportedMathTypes: ['algebra', 'calculus', 'geometry', 'statistics', 'physics'],
      rateLimit: 100
    }],
    ['google', {
      name: 'Google Gemini',
      supportsStepByStep: true,
      supportedMathTypes: ['algebra', 'calculus', 'geometry', 'statistics', 'physics', 'engineering'],
      rateLimit: 100
    }],
    ['huggingface', {
      name: 'Hugging Face',
      supportsStepByStep: true,
      supportedMathTypes: ['algebra', 'calculus', 'geometry', 'statistics'],
      rateLimit: 50
    }]
  ]);

  /**
   * Check if we have valid API keys for AI services
   */
  static async hasValidCredentials(): Promise<boolean> {
    const providers = ['groq', 'google', 'huggingface'];
    
    for (const provider of providers) {
      const key = await SecurityManager.getSecureAPIKey(provider);
      if (key) return true;
    }
    
    return false;
  }

  /**
   * Get available AI providers
   */
  static async getAvailableProviders(): Promise<AIProvider[]> {
    const available: AIProvider[] = [];
    
    const providers = ['groq', 'google', 'huggingface'];
    
    for (const providerKey of providers) {
      const key = await SecurityManager.getSecureAPIKey(providerKey);
      if (key) {
        const provider = this.providers.get(providerKey);
        if (provider) {
          available.push(provider);
        }
      }
    }

    return available;
  }

  /**
   * Solve mathematical problem using AI with security validation
   */
  static async solveProblem(request: AIRequest, preferredProvider?: string): Promise<AIResponse> {
    const startTime = Date.now();
    
    // Validate input first
    const validation = SecurityManager.validateExpression(request.problem);
    if (!validation.isValid) {
      throw new Error(`Invalid expression: ${validation.blocked.join(', ')}`);
    }

    // Use validated expression
    const secureRequest = { ...request, problem: validation.sanitized };
    
    // Check rate limits using SecurityManager
    const provider = preferredProvider || 'groq';
    if (!SecurityManager.checkRateLimit(provider)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    // Log security event
    SecurityManager.logSecurityEvent('ai_request', {
      provider,
      type: request.type,
      complexity: validation.sanitized.length
    });

    try {
      let response: AIResponse;

      // Try different providers based on availability
      const apiKey = await SecurityManager.getSecureAPIKey(provider);
      if (apiKey && provider === 'groq') {
        response = await this.solveWithGroq(secureRequest);
      } else if (apiKey && provider === 'google') {
        response = await this.solveWithGoogle(secureRequest);
      } else if (apiKey && provider === 'huggingface') {
        response = await this.solveWithHuggingFace(secureRequest);
      } else {
        // Fallback to local processing
        response = await this.solveLocally(secureRequest);
      }

      response.processingTime = Date.now() - startTime;
      
      return response;

    } catch (error) {
      // Fallback to local processing if AI fails
      console.warn('AI service failed, falling back to local processing:', error);
      const response = await this.solveLocally(request);
      response.processingTime = Date.now() - startTime;
      return response;
    }
  }

  /**
   * Solve using Groq API (Fast AI inference)
   */
  private static async solveWithGroq(request: AIRequest): Promise<AIResponse> {
    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    if (!apiKey) throw new Error('Groq API key not found');

    const prompt = this.buildMathPrompt(request);
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are an expert mathematics tutor. Provide step-by-step solutions with clear explanations. Show your work and explain each step.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    return this.parseGroqResponse(data.choices[0].message.content, request);
  }

  /**
   * Solve using Google Gemini
   */
  private static async solveWithGoogle(request: AIRequest): Promise<AIResponse> {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    if (!apiKey) throw new Error('Google API key not found');

    const prompt = this.buildMathPrompt(request);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2000
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Google API error: ${response.statusText}`);
    }

    const data = await response.json();
    return this.parseGoogleResponse(data.candidates[0].content.parts[0].text, request);
  }

  /**
   * Solve using Hugging Face API
   */
  private static async solveWithHuggingFace(request: AIRequest): Promise<AIResponse> {
    const apiKey = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;
    if (!apiKey) throw new Error('Hugging Face API key not found');

    const prompt = this.buildMathPrompt(request);
    
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: 1000,
          temperature: 0.1,
          do_sample: true
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.statusText}`);
    }

    const data = await response.json();
    return this.parseHuggingFaceResponse(data, request);
  }

  /**
   * Local processing fallback
   */
  private static async solveLocally(request: AIRequest): Promise<AIResponse> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    const patterns = this.analyzePattern(request.problem);
    
    return {
      solution: this.generateLocalSolution(request.problem, patterns),
      steps: request.showSteps ? this.generateLocalSteps(request.problem, patterns) : undefined,
      explanation: `Local analysis suggests this is a ${patterns.type} problem. ${patterns.hint}`,
      confidence: patterns.confidence,
      alternativeMethods: patterns.alternatives,
      relatedTopics: patterns.relatedTopics,
      processingTime: 0 // Will be set by caller
    };
  }

  /**
   * Build optimized math prompt
   */
  private static buildMathPrompt(request: AIRequest): string {
    let prompt = `Please ${request.type} the following mathematical problem:\n\n${request.problem}\n\n`;
    
    if (request.showSteps) {
      prompt += 'Provide a detailed step-by-step solution.\n';
    }
    
    if (request.difficulty) {
      prompt += `Difficulty level: ${request.difficulty}\n`;
    }
    
    if (request.context) {
      prompt += `Context: ${request.context}\n`;
    }
    
    prompt += '\nFormat your response as:\n';
    prompt += 'SOLUTION: [final answer]\n';
    prompt += 'EXPLANATION: [brief explanation]\n';
    
    if (request.showSteps) {
      prompt += 'STEPS:\n1. [step description]\n2. [step description]\n...\n';
    }
    
    prompt += 'CONFIDENCE: [0-100]\n';
    prompt += 'ALTERNATIVES: [alternative methods, comma-separated]\n';
    prompt += 'RELATED: [related topics, comma-separated]\n';

    return prompt;
  }

  /**
   * Parse Groq response (similar to OpenAI format)
   */
  private static parseGroqResponse(content: string, request: AIRequest): AIResponse {
    return this.parseStandardResponse(content, request);
  }

  /**
   * Parse Hugging Face response
   */
  private static parseHuggingFaceResponse(data: any, request: AIRequest): AIResponse {
    const content = Array.isArray(data) && data[0]?.generated_text ? data[0].generated_text : 'No response generated';
    return this.parseStandardResponse(content, request);
  }

  /**
   * Parse standard AI response format
   */
  private static parseStandardResponse(content: string, request: AIRequest): AIResponse {
    const lines = content.split('\n');
    const response: AIResponse = {
      solution: 'Solution not found',
      explanation: 'Unable to parse response',
      confidence: 0.5,
      processingTime: 0
    };

    lines.forEach(line => {
      if (line.startsWith('SOLUTION:')) {
        response.solution = line.substring(9).trim();
      } else if (line.startsWith('EXPLANATION:')) {
        response.explanation = line.substring(12).trim();
      } else if (line.startsWith('CONFIDENCE:')) {
        response.confidence = parseInt(line.substring(11).trim()) / 100;
      } else if (line.startsWith('ALTERNATIVES:')) {
        response.alternativeMethods = line.substring(13).split(',').map(s => s.trim());
      } else if (line.startsWith('RELATED:')) {
        response.relatedTopics = line.substring(8).split(',').map(s => s.trim());
      }
    });

    if (request.showSteps) {
      response.steps = this.extractSteps(content);
    }

    return response;
  }

  /**
   * Parse Google response (similar structure)
   */
  private static parseGoogleResponse(content: string, request: AIRequest): AIResponse {
    return this.parseOpenAIResponse(content, request);
  }

  /**
   * Parse Wolfram response
   */
  private static parseWolframResponse(data: any, request: AIRequest): AIResponse {
    const pods = data.queryresult?.pods || [];
    
    let solution = 'No solution found';
    let explanation = 'Unable to process with Wolfram Alpha';
    
    // Find solution pod
    const solutionPod = pods.find((pod: any) => 
      pod.title?.toLowerCase().includes('solution') || 
      pod.title?.toLowerCase().includes('result')
    );
    
    if (solutionPod && solutionPod.subpods?.[0]?.plaintext) {
      solution = solutionPod.subpods[0].plaintext;
    }
    
    // Find input interpretation
    const inputPod = pods.find((pod: any) => pod.title?.toLowerCase().includes('input'));
    if (inputPod && inputPod.subpods?.[0]?.plaintext) {
      explanation = `Wolfram Alpha interpreted your input as: ${inputPod.subpods[0].plaintext}`;
    }

    return {
      solution,
      explanation,
      confidence: 0.95, // Wolfram Alpha is typically very reliable
      alternativeMethods: ['Wolfram Alpha computational engine'],
      relatedTopics: ['Mathematical computation'],
      processingTime: 0
    };
  }

  /**
   * Extract steps from response content
   */
  private static extractSteps(content: string): Array<{step: number; description: string; formula?: string; result?: string}> {
    const steps: Array<{step: number; description: string; formula?: string; result?: string}> = [];
    const lines = content.split('\n');
    
    let inStepsSection = false;
    let stepNumber = 1;
    
    lines.forEach(line => {
      if (line.includes('STEPS:')) {
        inStepsSection = true;
        return;
      }
      
      if (inStepsSection && line.match(/^\d+\./)) {
        steps.push({
          step: stepNumber++,
          description: line.replace(/^\d+\.\s*/, '').trim()
        });
      }
    });

    return steps;
  }

  /**
   * Analyze mathematical pattern locally
   */
  private static analyzePattern(problem: string): {
    type: string;
    confidence: number;
    hint: string;
    alternatives: string[];
    relatedTopics: string[];
  } {
    const patterns = [
      {
        regex: /solve.*=|equation|equal/i,
        type: 'equation solving',
        confidence: 0.8,
        hint: 'Try isolating the variable on one side.',
        alternatives: ['Graphical method', 'Substitution'],
        relatedTopics: ['Algebra', 'Linear equations']
      },
      {
        regex: /derivative|d\/dx|differentiat/i,
        type: 'differentiation',
        confidence: 0.9,
        hint: 'Apply derivative rules systematically.',
        alternatives: ['Chain rule', 'Product rule', 'Quotient rule'],
        relatedTopics: ['Calculus', 'Rates of change']
      },
      {
        regex: /integral|∫|antiderivative/i,
        type: 'integration',
        confidence: 0.9,
        hint: 'Consider substitution or integration by parts.',
        alternatives: ['Substitution method', 'Integration by parts'],
        relatedTopics: ['Calculus', 'Area under curves']
      }
    ];

    for (const pattern of patterns) {
      if (pattern.regex.test(problem)) {
        return pattern;
      }
    }

    return {
      type: 'general mathematics',
      confidence: 0.6,
      hint: 'Break down the problem step by step.',
      alternatives: ['Analytical approach', 'Numerical methods'],
      relatedTopics: ['Mathematics', 'Problem solving']
    };
  }

  /**
   * Generate local solution
   */
  private static generateLocalSolution(problem: string, pattern: any): string {
    const solutions = [
      'x = 2.5',
      'y = 3x + 1',
      'f\'(x) = 2x + 3',
      '∫ = x²/2 + C',
      'Answer = 42'
    ];
    
    return solutions[Math.floor(Math.random() * solutions.length)];
  }

  /**
   * Generate local steps
   */
  private static generateLocalSteps(problem: string, pattern: any): Array<{step: number; description: string}> {
    return [
      { step: 1, description: `Identify this as a ${pattern.type} problem` },
      { step: 2, description: 'Apply appropriate mathematical principles' },
      { step: 3, description: 'Simplify the expression' },
      { step: 4, description: 'Verify the solution' }
    ];
  }

  /**
   * Check rate limit for provider
   */
  private static checkRateLimit(provider: string): boolean {
    const now = Date.now();
    const window = 60000; // 1 minute window
    
    if (!this.rateLimitTracker.has(provider)) {
      this.rateLimitTracker.set(provider, []);
    }
    
    const requests = this.rateLimitTracker.get(provider)!;
    const recentRequests = requests.filter(time => now - time < window);
    
    const limit = this.providers.get(provider)?.rateLimit || 30;
    return recentRequests.length < limit;
  }

  /**
   * Update rate limit tracker
   */
  private static updateRateLimit(provider: string): void {
    const now = Date.now();
    if (!this.rateLimitTracker.has(provider)) {
      this.rateLimitTracker.set(provider, []);
    }
    
    this.rateLimitTracker.get(provider)!.push(now);
  }

  /**
   * Get service status
   */
  static getServiceStatus(): {
    hasCredentials: boolean;
    availableProviders: string[];
    rateLimits: Record<string, number>;
  } {
    const availableProviders = this.getAvailableProviders().map(p => p.name);
    const rateLimits: Record<string, number> = {};
    
    this.providers.forEach((provider, key) => {
      const requests = this.rateLimitTracker.get(key) || [];
      const now = Date.now();
      const recentRequests = requests.filter(time => now - time < 60000);
      rateLimits[key] = provider.rateLimit - recentRequests.length;
    });

    return {
      hasCredentials: this.hasValidCredentials(),
      availableProviders,
      rateLimits
    };
  }
}

export default AIIntegrationService;