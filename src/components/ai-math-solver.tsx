'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Brain, Calculator, Loader2, CheckCircle, Lightbulb } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AIMathSolverProps {
  onSolutionFound?: (solution: string) => void;
}

interface AIResponse {
  solution: string;
  explanation: string;
  steps: string[];
  confidence: number;
}

export default function AIMathSolver({ onSolutionFound }: AIMathSolverProps) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<AIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const solveProblem = async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content: 'You are a mathematical assistant. Solve math problems step by step. Format your response as: SOLUTION: [final answer] | EXPLANATION: [brief explanation] | STEPS: [step 1], [step 2], [step 3]... Keep it concise but clear.'
            },
            {
              role: 'user',
              content: `Solve this math problem: ${input}`
            }
          ],
          max_tokens: 300,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const responseText = data.choices?.[0]?.message?.content || '';
      
      // Parse the structured response
      const solutionMatch = responseText.match(/SOLUTION:\s*([^|]+)/);
      const explanationMatch = responseText.match(/EXPLANATION:\s*([^|]+)/);
      const stepsMatch = responseText.match(/STEPS:\s*(.+)/);
      
      const parsedResult: AIResponse = {
        solution: solutionMatch ? solutionMatch[1].trim() : responseText.split('\n')[0] || 'Unable to determine solution',
        explanation: explanationMatch ? explanationMatch[1].trim() : 'AI provided a detailed mathematical solution',
        steps: stepsMatch ? stepsMatch[1].split(',').map((s: string) => s.trim()) : [responseText],
        confidence: 0.9
      };

      setResult(parsedResult);
      onSolutionFound?.(parsedResult.solution);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to solve problem');
    } finally {
      setIsLoading(false);
    }
  };

  const exampleProblems = [
    "What is 25 × 17?",
    "Solve x² - 5x + 6 = 0",
    "Find the derivative of x³ + 2x²",
    "Calculate 15% of 240",
    "What is the area of a circle with radius 8?"
  ];

  const handleExampleClick = (example: string) => {
    setInput(example);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      solveProblem();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          AI Math Solver
          <Badge variant="outline" className="ml-auto">
            Powered by Groq
          </Badge>
        </CardTitle>
        <CardDescription>
          Ask me any math question and I'll solve it step by step
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Input Section */}
        <div className="space-y-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your math problem here... (e.g., What is 15% of 200? or Solve x² - 4x + 3 = 0)"
            className="min-h-[80px] font-mono"
            disabled={isLoading}
          />
          
          <div className="flex gap-2">
            <Button 
              onClick={solveProblem}
              disabled={!input.trim() || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Solving...
                </>
              ) : (
                <>
                  <Calculator className="mr-2 h-4 w-4" />
                  Solve Problem
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => { setInput(''); setResult(null); setError(''); }}
              disabled={isLoading}
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Example Problems */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Try these examples:</p>
          <div className="flex flex-wrap gap-2">
            {exampleProblems.map((example, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleExampleClick(example)}
                className="text-xs"
                disabled={isLoading}
              >
                {example}
              </Button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results Display */}
        {result && (
          <div className="space-y-4 border-t pt-4">
            <div className="space-y-3">
              {/* Solution */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-800">Solution</h3>
                </div>
                <p className="text-lg font-mono text-green-700">{result.solution}</p>
              </div>

              {/* Explanation */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Explanation</h3>
                </div>
                <p className="text-blue-700">{result.explanation}</p>
              </div>

              {/* Steps */}
              {result.steps.length > 1 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-800 mb-2">Solution Steps</h3>
                  <ol className="list-decimal list-inside space-y-1 text-purple-700">
                    {result.steps.map((step, index) => (
                      <li key={index} className="text-sm">{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}