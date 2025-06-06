"use client";

import React, { useState } from 'react';
import { Calculator, Brain, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KofiButton } from '@/components/ui/kofi-button';
import { SmartInputValidator } from '@/components/smart-input-validator';
import { SmartErrorFeedback } from '@/components/smart-error-feedback';
import { ContentAd } from '@/components/ui/adsense-ad';
import { Badge } from '@/components/ui/badge';

export function SmartCalculator() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  const handleCalculate = () => {
    try {
      setError('');
      // Using Function constructor for safe evaluation (better than eval)
      const calculation = new Function('return ' + expression)();
      const newResult = calculation.toString();
      setResult(newResult);
      setHistory(prev => [`${expression} = ${newResult}`, ...prev.slice(0, 9)]);
    } catch (err) {
      setError(`Invalid expression: ${expression}`);
      setResult('');
    }
  };

  const addToExpression = (value: string) => {
    setExpression(prev => prev + value);
  };

  const clearAll = () => {
    setExpression('');
    setResult('');
    setError('');
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

  const buttons = [
    ['C', '(', ')', '/'],
    ['7', '8', '9', '*'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '=']
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Donate Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calculator className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold">Smart Calculator</h2>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Brain className="h-3 w-3 mr-1" />
              AI Enhanced
            </Badge>
          </div>
        </div>
        <KofiButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Calculator */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Smart Input with AI Validation */}
              <SmartInputValidator
                value={expression}
                onChange={setExpression}
                onValidation={handleValidation}
                placeholder="Enter mathematical expression..."
                type="expression"
                showSuggestions={true}
              />

              {/* Result Display */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2">
                <div className="text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Result:</div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
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

              {/* Calculator Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {buttons.flat().map((button, index) => (
                  <Button
                    key={index}
                    variant={button === '=' ? 'default' : button === 'C' ? 'destructive' : 'outline'}
                    onClick={() => {
                      if (button === '=') {
                        handleCalculate();
                      } else if (button === 'C') {
                        clearAll();
                      } else {
                        addToExpression(button);
                      }
                    }}
                    className={`h-12 text-lg font-semibold ${
                      button === '=' ? 'col-span-2 bg-blue-600 hover:bg-blue-700' : ''
                    }`}
                  >
                    {button}
                  </Button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button onClick={handleCalculate} className="flex-1">
                  Calculate
                </Button>
                <Button variant="outline" onClick={clearAll}>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
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
                      className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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

          {/* Support Card */}
          <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
            <CardContent className="pt-6 text-center">
              <Coffee className="h-8 w-8 mx-auto mb-3 text-pink-600" />
              <h3 className="font-semibold mb-2">Enjoying the AI features?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Support the development of smart mathematical tools
              </p>
              <KofiButton className="w-full" />
            </CardContent>
          </Card>

          {/* Ad Space */}
          <ContentAd />
        </div>
      </div>
    </div>
  );
}

export default SmartCalculator;