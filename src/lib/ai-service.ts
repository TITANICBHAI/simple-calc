/**
 * Smart AI Fallback System
 * Multiple providers with automatic failover
 */

import * as dotenv from 'dotenv';
dotenv.config();

interface AIProvider {
  name: string;
  endpoint: string;
  headers: Record<string, string>;
  model: string;
  available: boolean;
}

interface AIResponse {
  success: boolean;
  result?: string;
  error?: string;
  provider?: string;
}

class SmartAIService {
  private providers: AIProvider[] = [
    {
      name: 'Groq Primary',
      endpoint: 'https://api.groq.com/openai/v1/chat/completions',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      model: 'mixtral-8x7b-32768',
      available: true
    },
    {
      name: 'Groq Backup',
      endpoint: 'https://api.groq.com/openai/v1/chat/completions',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_BACKUP_API_KEY}`,
        'Content-Type': 'application/json'
      },
      model: 'llama3-8b-8192',
      available: true
    },
    {
      name: 'Google Gemini',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      headers: {
        'Content-Type': 'application/json'
      },
      model: 'gemini-pro',
      available: true
    },
    {
      name: 'Hugging Face',
      endpoint: 'https://api-inference.huggingface.co/models/openchat/openchat-3.5',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      model: 'openchat-3.5',
      available: true
    }
  ];

  private currentProviderIndex = 0;

  async validateExpression(expression: string): Promise<AIResponse> {
    const prompt = `Analyze this mathematical expression and provide feedback: "${expression}"

Please respond with:
1. ✅ if correct, ❌ if incorrect
2. Brief explanation of any errors
3. Suggested correction if needed
4. Keep response under 100 words`;

    return await this.makeRequest(prompt);
  }

  async getErrorCorrection(input: string, errorType: string): Promise<AIResponse> {
    const prompt = `Help correct this mathematical input error:
Input: "${input}"
Error Type: ${errorType}

Provide:
1. What's wrong
2. Corrected version
3. Brief explanation
Keep response concise and helpful.`;

    return await this.makeRequest(prompt);
  }

  async explainConcept(concept: string, level: 'basic' | 'intermediate' | 'advanced' = 'intermediate'): Promise<AIResponse> {
    const prompt = `Explain the mathematical concept "${concept}" at ${level} level.

Provide:
1. Clear definition
2. Key properties
3. Simple example
4. Common applications
Keep explanation concise but informative.`;

    return await this.makeRequest(prompt);
  }

  async suggestOperations(context: string): Promise<AIResponse> {
    const prompt = `Based on this mathematical context: "${context}"

Suggest 3–5 relevant operations or calculations the user might want to perform.
Format as a simple list with brief descriptions.`;

    return await this.makeRequest(prompt);
  }

  private async makeRequest(prompt: string, retryCount = 0): Promise<AIResponse> {
    if (retryCount >= this.providers.length) {
      return {
        success: false,
        error: 'All AI providers are currently unavailable'
      };
    }

    const provider = this.providers[this.currentProviderIndex];

    try {
      let response;

      if (provider.name.includes('Groq')) {
        response = await this.makeGroqRequest(provider, prompt);
      } else if (provider.name.includes('Gemini')) {
        response = await this.makeGeminiRequest(provider, prompt);
      } else if (provider.name.includes('Hugging Face')) {
        response = await this.makeHuggingFaceRequest(provider, prompt);
      }

      if (response && response.success) {
        return { ...response, provider: provider.name };
      }

      throw new Error('Request failed');
    } catch (error) {
      console.log(`${provider.name} failed, trying next provider...`);
      this.currentProviderIndex = (this.currentProviderIndex + 1) % this.providers.length;
      return await this.makeRequest(prompt, retryCount + 1);
    }
  }

  private async makeGroqRequest(provider: AIProvider, prompt: string): Promise<AIResponse> {
    const response = await fetch(provider.endpoint, {
      method: 'POST',
      headers: provider.headers,
      body: JSON.stringify({
        model: provider.model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 512,
        temperature: 0.3,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      result: data.choices[0]?.message?.content || 'No response generated'
    };
  }

  private async makeGeminiRequest(provider: AIProvider, prompt: string): Promise<AIResponse> {
    const response = await fetch(`${provider.endpoint}?key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY_2}`, {
      method: 'POST',
      headers: provider.headers,
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          maxOutputTokens: 300,
          temperature: 0.3
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      result: data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated'
    };
  }

  private async makeHuggingFaceRequest(provider: AIProvider, prompt: string): Promise<AIResponse> {
    const response = await fetch(provider.endpoint, {
      method: 'POST',
      headers: provider.headers,
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: 200,
          temperature: 0.3,
          return_full_text: false
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      result: data[0]?.generated_text || 'No response generated'
    };
  }

  getProviderStatus() {
    return {
      current: this.providers[this.currentProviderIndex].name,
      available: this.providers.filter(p => p.available).length,
      total: this.providers.length
    };
  }
}

export const aiService = new SmartAIService();
export type { AIResponse };
