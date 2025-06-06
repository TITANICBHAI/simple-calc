"use client";

import React, { useState, type FC } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { KatexDisplay } from '@/components/ui/katex-display';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { parseExpression } from '@/lib/math-parser/symbolicParser';
import { differentiateHigherOrder, integrateSymbolic, findLimit, taylorSeries } from '@/lib/math-parser/advancedMath';
import { generateCode } from '@/lib/math-parser/astCodeGen';
import { useToast } from '@/hooks/use-toast';

type CalculusOperation = 'differentiate' | 'integrate' | 'limit' | 'series';

interface CalculusOperationsProps {
  onResult: (result: string) => void;
  onError: (error: string) => void;
}

export const CalculusOperations: FC<CalculusOperationsProps> = ({ onResult, onError }) => {
  const [expression, setExpression] = useState<string>('');
  const [variable, setVariable] = useState<string>('x');
  const [operation, setOperation] = useState<CalculusOperation>('differentiate');
  const [order, setOrder] = useState<string>('1');
  const [evaluationPoint, setEvaluationPoint] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInputValid, setIsInputValid] = useState(true);
  const { toast } = useToast();

  // Validate expression for common errors
  const validateExpression = (exp: string): boolean => {
    if (!exp.trim()) return false;
    
    // Check for balanced parentheses
    const stack: string[] = [];
    for (const char of exp) {
      if (char === '(') stack.push(char);
      if (char === ')') {
        if (stack.length === 0) return false;
        stack.pop();
      }
    }
    if (stack.length > 0) return false;

    // Check for invalid characters
    const validChars = /^[a-zA-Z0-9\s+\-*/^(),.]+$/;
    if (!validChars.test(exp)) return false;

    // Check for consecutive operators
    if (/[+\-*/^]{2,}/.test(exp)) return false;

    return true;
  };

  const handleExpressionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setExpression(newValue);
    setIsInputValid(validateExpression(newValue));
  };

  const handleCalculate = async () => {
    try {
      setIsProcessing(true);
      if (!expression.trim()) {
        throw new Error('Please enter an expression');
      }

      if (!isInputValid) {
        throw new Error('Expression contains invalid characters or syntax');
      }

      const ast = parseExpression(expression);

      let result: string;
      switch (operation) {
        case 'differentiate': {
          const n = parseInt(order);
          if (isNaN(n) || n < 1 || n > 10) {
            throw new Error('Order must be a positive integer between 1 and 10');
          }
          const derivativeAst = await differentiateHigherOrder(ast, variable, n);
          result = generateCode(derivativeAst);
          onResult(`\\frac{d${n > 1 ? '^' + n : ''}}{d${variable}${n > 1 ? '^' + n : ''}}(${expression}) = ${result}`);
          toast({ 
            title: "Derivative Calculated", 
            description: `${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'} order derivative with respect to ${variable}`,
          });
          break;
        }
        case 'integrate': {
          const integralAst = await integrateSymbolic(ast, variable);
          result = generateCode(integralAst);
          onResult(`\\int ${expression}\\,d${variable} = ${result} + C`);
          toast({ 
            title: "Integral Calculated", 
            description: `Indefinite integral with respect to ${variable}`,
          });
          break;
        }
        case 'limit': {
          if (!evaluationPoint.trim()) {
            throw new Error('Please specify the limit point');
          }
          const limitResult = await findLimit(ast, variable, evaluationPoint);
          result = generateCode(limitResult);
          onResult(`\\lim_{${variable} \\to ${evaluationPoint}} ${expression} = ${result}`);
          toast({ 
            title: "Limit Calculated", 
            description: `Limit as ${variable} approaches ${evaluationPoint}`,
          });
          break;
        }
        case 'series': {
          if (!evaluationPoint.trim()) {
            throw new Error('Please specify the expansion point');
          }
          const n = parseInt(order);
          if (isNaN(n) || n < 0 || n > 7) {
            throw new Error('Order must be between 0 and 7 for series expansion');
          }
          const seriesResult = await taylorSeries(ast, variable, evaluationPoint, n);
          result = generateCode(seriesResult);
          onResult(`${expression} = ${result} + O(${variable}^{${n + 1}})`);
          toast({ 
            title: "Series Expansion Calculated", 
            description: `Taylor series around ${evaluationPoint} up to order ${n}`,
          });
          break;
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      onError(message);
      toast({ 
        title: "Calculation Error", 
        description: message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Expression</Label>
        <Input
          value={expression}
          onChange={handleExpressionChange}
          placeholder="Enter mathematical expression"
          className={cn(
            "font-mono",
            !isInputValid && expression && "border-destructive"
          )}
        />
        {!isInputValid && expression && (
          <p className="text-xs text-destructive">
            Expression contains invalid characters or syntax
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Operation</Label>
          <Select value={operation} onValueChange={(v) => setOperation(v as CalculusOperation)}>
            <SelectTrigger>
              <SelectValue placeholder="Select operation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="differentiate">Differentiate</SelectItem>
              <SelectItem value="integrate">Integrate</SelectItem>
              <SelectItem value="limit">Limit</SelectItem>
              <SelectItem value="series">Series Expansion</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Variable</Label>
          <Input
            value={variable}
            onChange={(e) => setVariable(e.target.value)}
            placeholder="Variable name"
            className="font-mono"
          />
        </div>
      </div>

      {(operation === 'differentiate' || operation === 'series') && (
        <div className="space-y-2">
          <Label>Order</Label>
          <Input
            type="number"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            min={operation === 'differentiate' ? 1 : 0}
            max={operation === 'differentiate' ? 10 : 7}
            className="font-mono"
          />
        </div>
      )}

      {(operation === 'limit' || operation === 'series') && (
        <div className="space-y-2">
          <Label>{operation === 'limit' ? 'Limit Point' : 'Expansion Point'}</Label>
          <Input
            value={evaluationPoint}
            onChange={(e) => setEvaluationPoint(e.target.value)}
            placeholder={operation === 'limit' ? 'e.g., 0, ∞' : 'e.g., 0'}
            className="font-mono"
          />
        </div>
      )}

      <Alert variant="default" className="bg-muted/30">
        <Info className="h-4 w-4" />
        <AlertTitle>Operation Details</AlertTitle>
        <AlertDescription className="text-xs">
          {operation === 'differentiate' && `Enter an expression to find its ${order}${order === '1' ? 'st' : order === '2' ? 'nd' : order === '3' ? 'rd' : 'th'} derivative with respect to ${variable}.`}
          {operation === 'integrate' && `Enter an expression to find its indefinite integral with respect to ${variable}. The constant of integration (+ C) will be added automatically.`}
          {operation === 'limit' && `Enter an expression and specify the value that ${variable} approaches to find the limit.`}
          {operation === 'series' && `Enter an expression to find its Taylor/Maclaurin series expansion around ${evaluationPoint || 'the specified point'} up to order ${order}.`}
        </AlertDescription>
      </Alert>

      <Button 
        onClick={handleCalculate} 
        className="w-full"
        disabled={isProcessing || !isInputValid || !expression}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Calculate'
        )}
      </Button>

      {expression && (
        <div className="text-center">
          <KatexDisplay 
            math={expression}
            displayMode={false}
          />
        </div>
      )}
    </div>
  );
};
