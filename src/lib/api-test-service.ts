/**
 * API Test Service - Test individual AI APIs
 */

export interface APITestResult {
  success: boolean;
  response?: string;
  error?: string;
  responseTime?: number;
  provider: string;
}

export class APITestService {
  /**
   * Test Groq API
   */
  static async testGroq(): Promise<APITestResult> {
    const startTime = Date.now();
    try {
      const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
      if (!apiKey) {
        return { success: false, error: 'Groq API key not found', provider: 'Groq' };
      }

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
              role: 'user',
              content: 'What is 2+2?'
            }
          ],
          max_tokens: 50,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        return { 
          success: false, 
          error: `Groq API error: ${response.status} ${response.statusText}`,
          provider: 'Groq',
          responseTime: Date.now() - startTime
        };
      }

      const data = await response.json();
      return { 
        success: true, 
        response: data.choices?.[0]?.message?.content || 'No response content',
        provider: 'Groq',
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'Groq',
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Test Hugging Face API
   */
  static async testHuggingFace(): Promise<APITestResult> {
    const startTime = Date.now();
    try {
      const apiKey = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;
      if (!apiKey) {
        return { success: false, error: 'Hugging Face API key not found', provider: 'Hugging Face' };
      }

      // Test with a simple text generation model
      const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-small', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: 'Hello, how are you?'
        })
      });

      if (!response.ok) {
        return { 
          success: false, 
          error: `Hugging Face API error: ${response.status} ${response.statusText}`,
          provider: 'Hugging Face',
          responseTime: Date.now() - startTime
        };
      }

      const data = await response.json();
      const result = Array.isArray(data) ? data[0]?.generated_text : data.generated_text;
      
      return { 
        success: true, 
        response: result || 'No response content',
        provider: 'Hugging Face',
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'Hugging Face',
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Test Google Gemini API
   */
  static async testGoogle(): Promise<APITestResult> {
    const startTime = Date.now();
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
      if (!apiKey) {
        return { success: false, error: 'Google API key not found', provider: 'Google Gemini' };
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Calculate 25 × 4 and explain the steps.'
            }]
          }]
        })
      });

      if (!response.ok) {
        return { 
          success: false, 
          error: `Google API error: ${response.status} ${response.statusText}`,
          provider: 'Google Gemini',
          responseTime: Date.now() - startTime
        };
      }

      const data = await response.json();
      const result = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      return { 
        success: true, 
        response: result || 'No response content',
        provider: 'Google Gemini',
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'Google Gemini',
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Test all APIs
   */
  static async testAllAPIs(): Promise<APITestResult[]> {
    const results = await Promise.allSettled([
      this.testGroq(),
      this.testHuggingFace(),
      this.testGoogle()
    ]);

    return results.map(result => 
      result.status === 'fulfilled' 
        ? result.value 
        : { success: false, error: 'Test failed to complete', provider: 'Unknown' }
    );
  }
}

export default APITestService;