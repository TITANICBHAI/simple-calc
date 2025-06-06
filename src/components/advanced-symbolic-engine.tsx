"use client";

import React, { useState } from 'react';
import { Brain, Coffee, Zap, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KofiButton } from '@/components/ui/kofi-button';
import { SmartInputValidator } from '@/components/smart-input-validator';
import { SmartErrorFeedback } from '@/components/smart-error-feedback';
import { ContentAd } from '@/components/ui/adsense-ad';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Advanced symbolic mathematics engine
class SymbolicExpression {
  type: 'number' | 'variable' | 'operation' | 'function';
  value?: number | string;
  operator?: string;
  operands?: SymbolicExpression[];
  
  constructor(type: SymbolicExpression['type'], value?: number | string, operator?: string, operands?: SymbolicExpression[]) {
    this.type = type;
    this.value = value;
    this.operator = operator;
    this.operands = operands || [];
  }

  // Symbolic differentiation
  derivative(variable: string): SymbolicExpression {
    switch (this.type) {
      case 'number':
        return new SymbolicExpression('number', 0);
      
      case 'variable':
        return new SymbolicExpression('number', this.value === variable ? 1 : 0);
      
      case 'operation':
        switch (this.operator) {
          case '+':
          case '-':
            return new SymbolicExpression('operation', undefined, this.operator, 
              this.operands!.map(op => op.derivative(variable)));
          
          case '*':
            // Product rule: (uv)' = u'v + uv'
            if (this.operands!.length === 2) {
              const [u, v] = this.operands!;
              const uPrime = u.derivative(variable);
              const vPrime = v.derivative(variable);
              return new SymbolicExpression('operation', undefined, '+', [
                new SymbolicExpression('operation', undefined, '*', [uPrime, v]),
                new SymbolicExpression('operation', undefined, '*', [u, vPrime])
              ]);
            }
            break;
          
          case '/':
            // Quotient rule: (u/v)' = (u'v - uv')/v²
            if (this.operands!.length === 2) {
              const [u, v] = this.operands!;
              const uPrime = u.derivative(variable);
              const vPrime = v.derivative(variable);
              const numerator = new SymbolicExpression('operation', undefined, '-', [
                new SymbolicExpression('operation', undefined, '*', [uPrime, v]),
                new SymbolicExpression('operation', undefined, '*', [u, vPrime])
              ]);
              const denominator = new SymbolicExpression('operation', undefined, '^', [
                v, new SymbolicExpression('number', 2)
              ]);
              return new SymbolicExpression('operation', undefined, '/', [numerator, denominator]);
            }
            break;
          
          case '^':
            // Power rule: (u^n)' = n*u^(n-1)*u'
            if (this.operands!.length === 2) {
              const [base, exponent] = this.operands!;
              const basePrime = base.derivative(variable);
              
              if (exponent.type === 'number') {
                const n = exponent.value as number;
                const coefficient = new SymbolicExpression('number', n);
                const newPower = new SymbolicExpression('operation', undefined, '^', [
                  base, new SymbolicExpression('number', n - 1)
                ]);
                return new SymbolicExpression('operation', undefined, '*', [
                  coefficient,
                  new SymbolicExpression('operation', undefined, '*', [newPower, basePrime])
                ]);
              }
            }
            break;
        }
        break;
      
      case 'function':
        switch (this.value) {
          case 'sin':
            return new SymbolicExpression('operation', undefined, '*', [
              new SymbolicExpression('function', 'cos', undefined, this.operands),
              this.operands![0].derivative(variable)
            ]);
          
          case 'cos':
            return new SymbolicExpression('operation', undefined, '*', [
              new SymbolicExpression('number', -1),
              new SymbolicExpression('operation', undefined, '*', [
                new SymbolicExpression('function', 'sin', undefined, this.operands),
                this.operands![0].derivative(variable)
              ])
            ]);
          
          case 'ln':
            return new SymbolicExpression('operation', undefined, '/', [
              this.operands![0].derivative(variable),
              this.operands![0]
            ]);
          
          case 'exp':
            return new SymbolicExpression('operation', undefined, '*', [
              new SymbolicExpression('function', 'exp', undefined, this.operands),
              this.operands![0].derivative(variable)
            ]);
        }
        break;
    }
    
    return new SymbolicExpression('number', 0);
  }

  // Symbolic integration (basic cases)
  integrate(variable: string): SymbolicExpression {
    switch (this.type) {
      case 'number':
        return new SymbolicExpression('operation', undefined, '*', [
          new SymbolicExpression('number', this.value),
          new SymbolicExpression('variable', variable)
        ]);
      
      case 'variable':
        if (this.value === variable) {
          return new SymbolicExpression('operation', undefined, '/', [
            new SymbolicExpression('operation', undefined, '^', [
              new SymbolicExpression('variable', variable),
              new SymbolicExpression('number', 2)
            ]),
            new SymbolicExpression('number', 2)
          ]);
        }
        return new SymbolicExpression('operation', undefined, '*', [
          new SymbolicExpression('variable', this.value),
          new SymbolicExpression('variable', variable)
        ]);
      
      case 'operation':
        switch (this.operator) {
          case '+':
          case '-':
            return new SymbolicExpression('operation', undefined, this.operator,
              this.operands!.map(op => op.integrate(variable)));
          
          case '*':
            // Handle constant multiplication
            if (this.operands!.length === 2) {
              const [first, second] = this.operands!;
              if (first.type === 'number') {
                return new SymbolicExpression('operation', undefined, '*', [
                  first,
                  second.integrate(variable)
                ]);
              }
              if (second.type === 'number') {
                return new SymbolicExpression('operation', undefined, '*', [
                  second,
                  first.integrate(variable)
                ]);
              }
            }
            break;
          
          case '^':
            // Power rule for integration: ∫x^n dx = x^(n+1)/(n+1)
            if (this.operands!.length === 2) {
              const [base, exponent] = this.operands!;
              if (base.type === 'variable' && base.value === variable && exponent.type === 'number') {
                const n = exponent.value as number;
                if (n !== -1) {
                  return new SymbolicExpression('operation', undefined, '/', [
                    new SymbolicExpression('operation', undefined, '^', [
                      base,
                      new SymbolicExpression('number', n + 1)
                    ]),
                    new SymbolicExpression('number', n + 1)
                  ]);
                } else {
                  return new SymbolicExpression('function', 'ln', undefined, [base]);
                }
              }
            }
            break;
        }
        break;
      
      case 'function':
        switch (this.value) {
          case 'sin':
            if (this.operands![0].type === 'variable' && this.operands![0].value === variable) {
              return new SymbolicExpression('operation', undefined, '*', [
                new SymbolicExpression('number', -1),
                new SymbolicExpression('function', 'cos', undefined, this.operands)
              ]);
            }
            break;
          
          case 'cos':
            if (this.operands![0].type === 'variable' && this.operands![0].value === variable) {
              return new SymbolicExpression('function', 'sin', undefined, this.operands);
            }
            break;
        }
        break;
    }
    
    return new SymbolicExpression('function', 'integral', undefined, [this, new SymbolicExpression('variable', variable)]);
  }

  // Simplification
  simplify(): SymbolicExpression {
    if (this.type === 'operation' && this.operands) {
      const simplifiedOperands = this.operands.map(op => op.simplify());
      
      switch (this.operator) {
        case '+':
          // Combine constants
          let constantSum = 0;
          const nonConstants: SymbolicExpression[] = [];
          for (const op of simplifiedOperands) {
            if (op.type === 'number') {
              constantSum += op.value as number;
            } else {
              nonConstants.push(op);
            }
          }
          
          const result: SymbolicExpression[] = [];
          if (constantSum !== 0 || nonConstants.length === 0) {
            result.push(new SymbolicExpression('number', constantSum));
          }
          result.push(...nonConstants);
          
          if (result.length === 1) return result[0];
          return new SymbolicExpression('operation', undefined, '+', result);
        
        case '*':
          // Handle multiplication by zero
          if (simplifiedOperands.some(op => op.type === 'number' && op.value === 0)) {
            return new SymbolicExpression('number', 0);
          }
          
          // Combine constants
          let constantProduct = 1;
          const nonConstantFactors: SymbolicExpression[] = [];
          for (const op of simplifiedOperands) {
            if (op.type === 'number') {
              constantProduct *= op.value as number;
            } else {
              nonConstantFactors.push(op);
            }
          }
          
          const factors: SymbolicExpression[] = [];
          if (constantProduct !== 1 || nonConstantFactors.length === 0) {
            factors.push(new SymbolicExpression('number', constantProduct));
          }
          factors.push(...nonConstantFactors);
          
          if (factors.length === 1) return factors[0];
          return new SymbolicExpression('operation', undefined, '*', factors);
      }
      
      return new SymbolicExpression('operation', undefined, this.operator, simplifiedOperands);
    }
    
    return this;
  }

  toString(): string {
    switch (this.type) {
      case 'number':
        return this.value!.toString();
      case 'variable':
        return this.value!.toString();
      case 'operation':
        if (this.operands!.length === 2) {
          const [left, right] = this.operands!;
          return `(${left.toString()} ${this.operator} ${right.toString()})`;
        }
        return `${this.operator}(${this.operands!.map(op => op.toString()).join(', ')})`;
      case 'function':
        return `${this.value}(${this.operands!.map(op => op.toString()).join(', ')})`;
      default:
        return '';
    }
  }
}

// Expression parser
function parseExpression(input: string): SymbolicExpression {
  // Tokenize the input
  const tokens = input.match(/([a-zA-Z_]\w*)|(\d+\.?\d*)|([+\-*/^()])/g) || [];
  let index = 0;

  function parseAddSub(): SymbolicExpression {
    let expr = parseMulDiv();
    
    while (index < tokens.length && (tokens[index] === '+' || tokens[index] === '-')) {
      const op = tokens[index++];
      const right = parseMulDiv();
      expr = new SymbolicExpression('operation', undefined, op, [expr, right]);
    }
    
    return expr;
  }

  function parseMulDiv(): SymbolicExpression {
    let expr = parsePower();
    
    while (index < tokens.length && (tokens[index] === '*' || tokens[index] === '/')) {
      const op = tokens[index++];
      const right = parsePower();
      expr = new SymbolicExpression('operation', undefined, op, [expr, right]);
    }
    
    return expr;
  }

  function parsePower(): SymbolicExpression {
    let expr = parseFactor();
    
    if (index < tokens.length && tokens[index] === '^') {
      index++;
      const right = parseFactor();
      expr = new SymbolicExpression('operation', undefined, '^', [expr, right]);
    }
    
    return expr;
  }

  function parseFactor(): SymbolicExpression {
    if (index >= tokens.length) {
      throw new Error('Unexpected end of expression');
    }

    const token = tokens[index++];
    
    if (token === '(') {
      const expr = parseAddSub();
      if (index >= tokens.length || tokens[index] !== ')') {
        throw new Error('Missing closing parenthesis');
      }
      index++;
      return expr;
    }
    
    if (/^\d+\.?\d*$/.test(token)) {
      return new SymbolicExpression('number', parseFloat(token));
    }
    
    if (/^[a-zA-Z_]\w*$/.test(token)) {
      // Check if it's a function
      if (index < tokens.length && tokens[index] === '(') {
        index++; // consume '('
        const args: SymbolicExpression[] = [];
        
        if (tokens[index] !== ')') {
          args.push(parseAddSub());
          while (index < tokens.length && tokens[index] === ',') {
            index++; // consume ','
            args.push(parseAddSub());
          }
        }
        
        if (index >= tokens.length || tokens[index] !== ')') {
          throw new Error('Missing closing parenthesis for function');
        }
        index++;
        
        return new SymbolicExpression('function', token, undefined, args);
      } else {
        return new SymbolicExpression('variable', token);
      }
    }
    
    throw new Error(`Unexpected token: ${token}`);
  }

  const result = parseAddSub();
  if (index < tokens.length) {
    throw new Error(`Unexpected token: ${tokens[index]}`);
  }
  
  return result;
}

export function AdvancedSymbolicEngine() {
  const [input, setInput] = useState('');
  const [expression, setExpression] = useState<SymbolicExpression | null>(null);
  const [derivative, setDerivative] = useState<SymbolicExpression | null>(null);
  const [integral, setIntegral] = useState<SymbolicExpression | null>(null);
  const [simplified, setSimplified] = useState<SymbolicExpression | null>(null);
  const [variable, setVariable] = useState('x');
  const [error, setError] = useState('');

  const processExpression = () => {
    try {
      setError('');
      const expr = parseExpression(input);
      setExpression(expr);
      setSimplified(expr.simplify());
      setDerivative(expr.derivative(variable));
      setIntegral(expr.integrate(variable));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid expression');
      setExpression(null);
      setDerivative(null);
      setIntegral(null);
      setSimplified(null);
    }
  };

  const handleCorrection = (correctedInput: string) => {
    setInput(correctedInput);
    setError('');
  };

  const examples = [
    'x^2 + 3*x + 2',
    'sin(x) + cos(x)',
    'x^3 - 2*x^2 + x - 1',
    'exp(x) * ln(x)',
    '2*x^2 + 5*x + 3'
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold">Advanced Symbolic Mathematics Engine</h2>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                <Zap className="h-3 w-3 mr-1" />
                Real Symbolic Math
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Brain className="h-3 w-3 mr-1" />
                AI Enhanced
              </Badge>
            </div>
          </div>
        </div>
        <KofiButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Symbolic Expression Processor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Variable Selection */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Variable:</label>
                <div className="flex gap-2">
                  {['x', 'y', 't', 'z'].map(v => (
                    <Button
                      key={v}
                      variant={variable === v ? "default" : "outline"}
                      size="sm"
                      onClick={() => setVariable(v)}
                    >
                      {v}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <SmartInputValidator
                value={input}
                onChange={setInput}
                placeholder="Enter symbolic expression (e.g., x^2 + 3*x + 2, sin(x), exp(x))"
                type="expression"
                showSuggestions={true}
              />

              {/* Examples */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium">Examples:</span>
                {examples.map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setInput(example)}
                    className="text-xs"
                  >
                    {example}
                  </Button>
                ))}
              </div>

              {/* Error Display */}
              {error && (
                <SmartErrorFeedback
                  error={error}
                  input={input}
                  errorType="syntax"
                  onRetry={processExpression}
                  onCorrection={handleCorrection}
                  showAIHelp={true}
                />
              )}

              {/* Process Button */}
              <Button onClick={processExpression} className="w-full">
                Process Expression
              </Button>

              {/* Results */}
              {expression && (
                <Tabs defaultValue="simplified" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="simplified">Simplified</TabsTrigger>
                    <TabsTrigger value="derivative">Derivative</TabsTrigger>
                    <TabsTrigger value="integral">Integral</TabsTrigger>
                    <TabsTrigger value="original">Original</TabsTrigger>
                  </TabsList>

                  <TabsContent value="simplified" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Simplified Expression</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="p-4 bg-blue-50 rounded-lg font-mono text-lg">
                          {simplified?.toString() || 'No simplification available'}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="derivative" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Derivative with respect to {variable}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="p-4 bg-green-50 rounded-lg font-mono text-lg">
                          d/d{variable} [{input}] = {derivative?.simplify().toString() || 'Unable to compute'}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="integral" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Integral with respect to {variable}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="p-4 bg-purple-50 rounded-lg font-mono text-lg">
                          ∫ [{input}] d{variable} = {integral?.simplify().toString() || 'Unable to compute'} + C
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="original" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Original Expression</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="p-4 bg-gray-50 rounded-lg font-mono text-lg">
                          {expression.toString()}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>

          <ContentAd />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Symbolic Operations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Differentiation:</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="flex justify-between">
                <span>Integration:</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">Active</Badge>
              </div>
              <div className="flex justify-between">
                <span>Simplification:</span>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">Active</Badge>
              </div>
              <div className="flex justify-between">
                <span>AI Validation:</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">Enabled</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
            <CardContent className="pt-6 text-center">
              <Coffee className="h-8 w-8 mx-auto mb-3 text-pink-600" />
              <h3 className="font-semibold mb-2">Real symbolic math!</h3>
              <p className="text-sm text-gray-600 mb-4">
                Support advanced mathematics development
              </p>
              <KofiButton className="w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AdvancedSymbolicEngine;