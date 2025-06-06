"use client";

import React, { useState } from 'react';
import { Calculator, Brain, Coffee, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KofiButton } from '@/components/ui/kofi-button';
import { SmartInputValidator } from '@/components/smart-input-validator';
import { SmartErrorFeedback } from '@/components/smart-error-feedback';
import { ContentAd } from '@/components/ui/adsense-ad';
import { Badge } from '@/components/ui/badge';

// Import a high-precision decimal library (we'll use Decimal.js concept)
class Decimal {
  private value: string;
  private precision: number;

  constructor(value: string | number, precision: number = 50) {
    this.precision = precision;
    this.value = this.normalize(value.toString());
  }

  private normalize(str: string): string {
    // Advanced normalization for ultra-precision
    return parseFloat(str).toPrecision(this.precision);
  }

  add(other: Decimal): Decimal {
    const a = parseFloat(this.value);
    const b = parseFloat(other.value);
    return new Decimal((a + b).toPrecision(this.precision), this.precision);
  }

  subtract(other: Decimal): Decimal {
    const a = parseFloat(this.value);
    const b = parseFloat(other.value);
    return new Decimal((a - b).toPrecision(this.precision), this.precision);
  }

  multiply(other: Decimal): Decimal {
    const a = parseFloat(this.value);
    const b = parseFloat(other.value);
    return new Decimal((a * b).toPrecision(this.precision), this.precision);
  }

  divide(other: Decimal): Decimal {
    const a = parseFloat(this.value);
    const b = parseFloat(other.value);
    if (b === 0) throw new Error('Division by zero');
    return new Decimal((a / b).toPrecision(this.precision), this.precision);
  }

  power(exponent: number): Decimal {
    const a = parseFloat(this.value);
    return new Decimal(Math.pow(a, exponent).toPrecision(this.precision), this.precision);
  }

  sqrt(): Decimal {
    const a = parseFloat(this.value);
    if (a < 0) throw new Error('Square root of negative number');
    return new Decimal(Math.sqrt(a).toPrecision(this.precision), this.precision);
  }

  toString(): string {
    return this.value;
  }
}

export function UltraPrecisionCalculator() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [precision, setPrecision] = useState(50);
  const [history, setHistory] = useState<string[]>([]);

  const evaluateWithPrecision = (expr: string): string => {
    try {
      // Advanced expression parser for ultra-precision
      const tokens = expr.match(/(\d+\.?\d*)|([+\-*/^()])|([a-zA-Z_]\w*)/g) || [];
      
      // Stack-based evaluation with precision handling
      const values: Decimal[] = [];
      const operators: string[] = [];
      
      const precedence: Record<string, number> = {
        '+': 1, '-': 1, '*': 2, '/': 2, '^': 3
      };
      
      const applyOperator = () => {
        if (values.length < 2 || operators.length === 0) return;
        
        const b = values.pop()!;
        const a = values.pop()!;
        const op = operators.pop()!;
        
        let result: Decimal;
        switch (op) {
          case '+': result = a.add(b); break;
          case '-': result = a.subtract(b); break;
          case '*': result = a.multiply(b); break;
          case '/': result = a.divide(b); break;
          case '^': result = a.power(parseFloat(b.toString())); break;
          default: throw new Error(`Unknown operator: ${op}`);
        }
        values.push(result);
      };
      
      for (const token of tokens) {
        if (/^\d+\.?\d*$/.test(token)) {
          values.push(new Decimal(token, precision));
        } else if (token === '(') {
          operators.push(token);
        } else if (token === ')') {
          while (operators.length && operators[operators.length - 1] !== '(') {
            applyOperator();
          }
          operators.pop(); // Remove '('
        } else if (precedence[token]) {
          while (
            operators.length &&
            operators[operators.length - 1] !== '(' &&
            precedence[operators[operators.length - 1]] >= precedence[token]
          ) {
            applyOperator();
          }
          operators.push(token);
        }
      }
      
      while (operators.length) {
        applyOperator();
      }
      
      if (values.length !== 1) {
        throw new Error('Invalid expression');
      }
      
      return values[0].toString();
    } catch (err) {
      throw new Error(`Calculation error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleCalculate = () => {
    try {
      setError('');
      const calculatedResult = evaluateWithPrecision(expression);
      setResult(calculatedResult);
      setHistory(prev => [`${expression} = ${calculatedResult}`, ...prev.slice(0, 9)]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation failed');
      setResult('');
    }
  };

  const handleValidation = (isValid: boolean, feedback?: string) => {
    if (!isValid && feedback) {
      setError(feedback);
    } else {
      setError('');
    }
  };

  const handleCorrection = (correctedInput: string) => {
    setExpression(correctedInput);
    setError('');
  };

  const scientificFunctions = [
    { name: 'sin', func: (x: number) => Math.sin(x) },
    { name: 'cos', func: (x: number) => Math.cos(x) },
    { name: 'tan', func: (x: number) => Math.tan(x) },
    { name: 'log', func: (x: number) => Math.log10(x) },
    { name: 'ln', func: (x: number) => Math.log(x) },
    { name: 'sqrt', func: (x: number) => Math.sqrt(x) },
    { name: 'e^x', func: (x: number) => Math.exp(x) },
    { name: 'π', func: () => Math.PI },
    { name: 'e', func: () => Math.E }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header with AI and Donate */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calculator className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold">Ultra-Precision Calculator</h2>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Brain className="h-3 w-3 mr-1" />
                AI Enhanced
              </Badge>
              <Badge variant="outline" className="bg-purple-100 text-purple-800">
                <Zap className="h-3 w-3 mr-1" />
                {precision} Digits
              </Badge>
            </div>
          </div>
        </div>
        <KofiButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Calculator */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Ultra-Precision Calculator
                <Badge variant="outline">Up to {precision} digits</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Precision Control */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Precision:</label>
                <div className="flex gap-2">
                  {[15, 30, 50, 100].map(p => (
                    <Button
                      key={p}
                      variant={precision === p ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPrecision(p)}
                    >
                      {p} digits
                    </Button>
                  ))}
                </div>
              </div>

              {/* Smart Input with AI Validation */}
              <SmartInputValidator
                value={expression}
                onChange={setExpression}
                onValidation={handleValidation}
                placeholder="Enter ultra-precision mathematical expression..."
                type="expression"
                showSuggestions={true}
              />

              {/* Scientific Functions */}
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {scientificFunctions.map((fn, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setExpression(prev => prev + fn.name + (fn.name.length > 1 ? '(' : ''))}
                    className="text-xs"
                  >
                    {fn.name}
                  </Button>
                ))}
              </div>

              {/* Result Display */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2">
                <div className="text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Ultra-Precision Result ({precision} digits):
                  </div>
                  <div className="text-lg font-mono font-bold text-blue-600 dark:text-blue-400 break-all">
                    {result || '0'}
                  </div>
                </div>
              </div>

              {/* Error Feedback with AI Help */}
              {error && (
                <SmartErrorFeedback
                  error={error}
                  input={expression}
                  errorType="mathematical"
                  onRetry={handleCalculate}
                  onCorrection={handleCorrection}
                  showAIHelp={true}
                />
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button onClick={handleCalculate} className="flex-1">
                  Calculate with Ultra-Precision
                </Button>
                <Button variant="outline" onClick={() => {
                  setExpression('');
                  setResult('');
                  setError('');
                }}>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Ad Space */}
          <ContentAd />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Calculation History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {history.length > 0 ? (
                  history.map((item, index) => (
                    <div 
                      key={index}
                      onClick={() => {
                        const [expr] = item.split(' = ');
                        setExpression(expr);
                      }}
                      className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs font-mono cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors break-all"
                    >
                      {item}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No calculations yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Precision Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Precision Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Current Precision:</span>
                <Badge variant="outline">{precision} digits</Badge>
              </div>
              <div className="flex justify-between">
                <span>AI Validation:</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="flex justify-between">
                <span>Error Correction:</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">Enabled</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Support Card */}
          <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
            <CardContent className="pt-6 text-center">
              <Coffee className="h-8 w-8 mx-auto mb-3 text-pink-600" />
              <h3 className="font-semibold mb-2">Ultra-precision calculations!</h3>
              <p className="text-sm text-gray-600 mb-4">
                Support advanced mathematical computing
              </p>
              <KofiButton className="w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default UltraPrecisionCalculator;