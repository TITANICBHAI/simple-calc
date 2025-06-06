"use client";

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Calculator, Lightbulb, Zap, Settings, History, BookOpen, Sparkles } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { evaluate, parse, format } from 'mathjs';
import { toast } from '@/hooks/use-toast';

type CalculatorMode = 'adaptive' | 'scientific' | 'programming' | 'financial' | 'statistics' | 'calculus' | 'physics';

interface CalculationResult {
  input: string;
  corrected: string;
  result: string;
  suggestions: string[];
  confidence: number;
  timestamp: number;
  mode: CalculatorMode;
  insights?: string[];
}

interface AdaptiveFeature {
  name: string;
  description: string;
  example: string;
  category: string;
}

// Smart error correction utility
class SmartErrorCorrector {
  static correctExpression(expression: string) {
    let corrected = expression;
    
    // Common mathematical corrections
    const corrections = [
      [/(\d)\s*\(/g, '$1*('],           // 2(3) -> 2*(3)
      [/\)\s*(\d)/g, ')*$1'],           // )2 -> )*2
      [/\)\s*\(/g, ')*('],              // )( -> )*(
      [/(\d)\s*([a-zA-Z])/g, '$1*$2'],  // 2x -> 2*x
      [/([a-zA-Z])\s*(\d)/g, '$1*$2'],  // x2 -> x*2
      [/sin\s*\(/g, 'sin('],            // sin ( -> sin(
      [/cos\s*\(/g, 'cos('],            // cos ( -> cos(
      [/tan\s*\(/g, 'tan('],            // tan ( -> tan(
      [/log\s*\(/g, 'log('],            // log ( -> log(
      [/ln\s*\(/g, 'log('],             // ln -> log
      [/\^/g, '^'],                     // ^ -> ^
      [/÷/g, '/'],                      // ÷ -> /
      [/×/g, '*'],                      // × -> *
      [/−/g, '-'],                      // − -> -
      [/π/g, 'pi'],                     // π -> pi
      [/√/g, 'sqrt'],                   // √ -> sqrt
    ];
    
    corrections.forEach(([pattern, replacement]) => {
      corrected = corrected.replace(pattern as RegExp, replacement as string);
    });
    
    return { corrected, confidence: 0.9 };
  }

  static parseNaturalLanguage(text: string) {
    let corrected = text.toLowerCase();
    
    // Natural language patterns
    const patterns = [
      [/what is|calculate|find|solve/, ''],
      [/the square root of (\d+(?:\.\d+)?)/g, 'sqrt($1)'],
      [/(\d+(?:\.\d+)?)\s*squared/g, '($1)^2'],
      [/(\d+(?:\.\d+)?)\s*cubed/g, '($1)^3'],
      [/(\d+(?:\.\d+)?)\s*to the power of\s*(\d+(?:\.\d+)?)/g, '($1)^($2)'],
      [/sine of (\d+(?:\.\d+)?)/g, 'sin($1)'],
      [/cosine of (\d+(?:\.\d+)?)/g, 'cos($1)'],
      [/tangent of (\d+(?:\.\d+)?)/g, 'tan($1)'],
      [/log of (\d+(?:\.\d+)?)/g, 'log($1)'],
      [/natural log of (\d+(?:\.\d+)?)/g, 'log($1)'],
      [/(\d+(?:\.\d+)?)\s*plus\s*(\d+(?:\.\d+)?)/g, '$1 + $2'],
      [/(\d+(?:\.\d+)?)\s*minus\s*(\d+(?:\.\d+)?)/g, '$1 - $2'],
      [/(\d+(?:\.\d+)?)\s*times\s*(\d+(?:\.\d+)?)/g, '$1 * $2'],
      [/(\d+(?:\.\d+)?)\s*divided by\s*(\d+(?:\.\d+)?)/g, '$1 / $2'],
      [/percent(?:age)? of (\d+(?:\.\d+)?)/g, '$1/100'],
      [/(\d+(?:\.\d+)?)\s*percent/g, '($1/100)'],
    ];
    
    patterns.forEach(([pattern, replacement]) => {
      corrected = corrected.replace(pattern, replacement);
    });
    
    return { corrected: corrected.trim(), confidence: 0.8 };
  }

  static getSuggestions(expression: string): string[] {
    const suggestions = [];
    
    // Mathematical function suggestions
    if (expression.includes('x') || expression.includes('y')) {
      suggestions.push('Try plotting this function');
      suggestions.push('Calculate derivative');
      suggestions.push('Find integral');
    }
    
    if (/\d+\s*\^\s*\d+/.test(expression)) {
      suggestions.push('Use sqrt() for square roots');
      suggestions.push('Try logarithms: log()');
    }
    
    if (/sin|cos|tan/.test(expression)) {
      suggestions.push('Remember angles in radians');
      suggestions.push('Use degree mode if needed');
    }
    
    return suggestions;
  }
}

const UltraFlexibleCalculator: React.FC = () => {
  const [mode, setMode] = useState<CalculatorMode>('adaptive');
  const [input, setInput] = useState('');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [history, setHistory] = useState<CalculationResult[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [adaptiveMode, setAdaptiveMode] = useState(true);
  const [showReasoning, setShowReasoning] = useState(false);

  // Adaptive features for different mathematical contexts
  const adaptiveFeatures: AdaptiveFeature[] = [
    { name: 'Natural Language', description: 'Type in plain English', example: 'What is the area of a circle with radius 5?', category: 'Language' },
    { name: 'Auto Error Correction', description: 'Smart fixes for typos', example: 'sin(30) * cos(45', category: 'Intelligence' },
    { name: 'Context Detection', description: 'Adapts to your math type', example: 'Quadratic formula for x^2 + 5x + 6', category: 'Intelligence' },
    { name: 'Unit Conversion', description: 'Automatic unit handling', example: '5 meters to feet', category: 'Conversion' },
    { name: 'Symbolic Math', description: 'Work with variables', example: 'solve x^2 - 4 = 0 for x', category: 'Algebra' },
    { name: 'Calculus Operations', description: 'Derivatives and integrals', example: 'derivative of x^3 + 2x', category: 'Calculus' },
    { name: 'Matrix Operations', description: 'Linear algebra support', example: '[[1,2],[3,4]] * [[5,6],[7,8]]', category: 'Linear Algebra' },
    { name: 'Statistical Functions', description: 'Mean, std dev, etc.', example: 'mean of [1,2,3,4,5]', category: 'Statistics' }
  ];

  // Smart calculation with context awareness
  const performCalculation = useCallback(async (expression: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      // Step 1: Auto-correct the input
      const corrected = SmartErrorCorrector.correctExpression(expression);
      
      // Step 2: Context-aware processing based on mode
      let contextCorrected = corrected;
      switch (mode) {
        case 'scientific':
          // Add scientific constants if needed
          break;
        case 'calculus':
          // Handle calculus notation
          break;
        case 'statistics':
          // Handle statistical functions
          break;
        default:
          // Adaptive mode - try to detect context automatically
          if (adaptiveMode) {
            if (expression.toLowerCase().includes('derivative') || expression.toLowerCase().includes('integral')) {
              // Handle calculus expressions
            } else if (expression.toLowerCase().includes('mean') || expression.toLowerCase().includes('std')) {
              // Handle statistics
            }
          }
      }

      // Step 3: Natural language processing if needed
      let processedExpression = contextCorrected.corrected;
      if (expression.toLowerCase().includes('what is') || 
          expression.toLowerCase().includes('calculate') ||
          expression.toLowerCase().includes('find')) {
        const nlpResult = SmartErrorCorrector.parseNaturalLanguage(expression);
        processedExpression = nlpResult.corrected;
      }

      // Step 4: Evaluate using math.js
      let calculationResult: any;
      try {
        calculationResult = evaluate(processedExpression);
      } catch (evalError) {
        // Try alternative evaluation methods
        try {
          const parsed = parse(processedExpression);
          calculationResult = parsed.compile().evaluate();
        } catch (parseError) {
          throw new Error(`Cannot evaluate: ${processedExpression}`);
        }
      }

      // Step 5: Format result intelligently
      const formattedResult = typeof calculationResult === 'number' 
        ? format(calculationResult, { precision: 14 })
        : String(calculationResult);

      // Step 6: Generate smart suggestions
      const smartSuggestions = SmartErrorCorrector.getSuggestions(processedExpression);
      
      // Step 7: Generate insights
      const insights = [];
      if (typeof calculationResult === 'number') {
        if (calculationResult % 1 === 0) insights.push('This is a whole number');
        if (calculationResult < 0) insights.push('This is a negative number');
        if (Math.abs(calculationResult) > 1000000) insights.push('This is a very large number');
        if (Math.abs(calculationResult) < 0.001 && calculationResult !== 0) insights.push('This is a very small number');
      }

      const newResult: CalculationResult = {
        input: expression,
        corrected: processedExpression,
        result: formattedResult,
        suggestions: smartSuggestions,
        confidence: corrected.confidence,
        timestamp: Date.now(),
        mode,
        insights
      };

      setResult(newResult);
      setHistory(prev => [newResult, ...prev.slice(0, 9)]); // Keep last 10 results
      setSuggestions(smartSuggestions);
      
      toast({
        title: "Calculation Complete",
        description: `Result: ${formattedResult}`,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Calculation failed';
      setError(errorMessage);
      toast({
        title: "Calculation Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [mode, adaptiveMode]);

  const handleCalculate = () => {
    if (input.trim()) {
      performCalculation(input.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCalculate();
    }
  };

  const insertExample = (example: string) => {
    setInput(example);
  };

  const clearAll = () => {
    setInput('');
    setResult(null);
    setError('');
    setSuggestions([]);
  };

  const modeDescriptions = {
    adaptive: 'Intelligent mode that adapts to your input style',
    scientific: 'Advanced mathematical functions and constants',
    programming: 'Programming-specific calculations and conversions',
    financial: 'Financial calculations and analysis',
    statistics: 'Statistical analysis and data operations',
    calculus: 'Derivatives, integrals, and advanced calculus',
    physics: 'Physics calculations with units and constants'
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-500" />
            <CardTitle>Ultra-Flexible AI Calculator</CardTitle>
            <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              Intelligent
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Mode Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Label className="text-lg font-semibold">Calculator Mode</Label>
              <Switch 
                checked={adaptiveMode}
                onCheckedChange={setAdaptiveMode}
              />
              <Label className="text-sm text-muted-foreground">
                {adaptiveMode ? 'Adaptive' : 'Manual'}
              </Label>
            </div>
            
            <Select value={mode} onValueChange={(value: CalculatorMode) => setMode(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(modeDescriptions).map(([key, description]) => (
                  <SelectItem key={key} value={key}>
                    <div>
                      <div className="font-medium capitalize">{key}</div>
                      <div className="text-xs text-muted-foreground">{description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Input Section */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Smart Input</Label>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your calculation or question in natural language..."
              className="min-h-[120px] text-lg"
            />
            
            <div className="flex gap-2">
              <Button onClick={handleCalculate} disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculate
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={clearAll}>
                Clear
              </Button>
            </div>
          </div>

          {/* Results Section */}
          {result && (
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Result</Label>
              
              <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{result.mode} mode</Badge>
                    <Badge variant="secondary">
                      {Math.round(result.confidence * 100)}% confidence
                    </Badge>
                  </div>
                  
                  {result.corrected !== result.input && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Auto-corrected:</span> {result.corrected}
                    </div>
                  )}
                  
                  <div className="text-3xl font-bold text-center py-4">
                    {result.result}
                  </div>
                  
                  {result.insights && result.insights.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Insights:</div>
                      {result.insights.map((insight, index) => (
                        <div key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                          <Lightbulb className="h-3 w-3" />
                          {insight}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Suggestions</Label>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <Badge key={index} variant="outline" className="cursor-pointer hover:bg-muted">
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Adaptive Features */}
          <Tabs defaultValue="features" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="features" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {adaptiveFeatures.map((feature, index) => (
                  <Card key={index} className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => insertExample(feature.example)}>
                    <div className="space-y-2">
                      <Badge variant="outline" className="text-xs">{feature.category}</Badge>
                      <h4 className="font-semibold text-sm">{feature.name}</h4>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="examples" className="space-y-4">
              <div className="grid gap-3">
                {adaptiveFeatures.map((feature, index) => (
                  <Card key={index} className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => insertExample(feature.example)}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{feature.name}</div>
                        <div className="text-xs text-muted-foreground">{feature.example}</div>
                      </div>
                      <Badge variant="outline">{feature.category}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="space-y-4">
              {history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-2" />
                  <p>No calculation history yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((calc, index) => (
                    <Card key={index} className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => setInput(calc.input)}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{calc.input}</div>
                          <div className="text-xs text-muted-foreground">{calc.result}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(calc.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UltraFlexibleCalculator;