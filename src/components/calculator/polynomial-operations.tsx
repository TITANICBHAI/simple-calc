"use client";

import React, { useState, type FC } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Plus, Minus, Loader2, AlertCircle } from 'lucide-react';
import { KatexDisplay } from '@/components/ui/katex-display';
import { useToast } from '@/hooks/use-toast';

type PolynomialOperation = 'roots' | 'factor' | 'multiply' | 'divide' | 'gcd';

interface Coefficient {
  value: string;
  degree: number;
}

interface PolynomialOperationsProps {
  onResult: (result: string) => void;
  onError: (error: string) => void;
}

export const PolynomialOperations: FC<PolynomialOperationsProps> = ({ onResult, onError }) => {
  const [operation, setOperation] = useState<PolynomialOperation>('roots');
  const [coefficients1, setCoefficients1] = useState<Coefficient[]>([
    { value: '1', degree: 2 },
    { value: '0', degree: 1 },
    { value: '0', degree: 0 },
  ]);
  const [coefficients2, setCoefficients2] = useState<Coefficient[]>([
    { value: '1', degree: 1 },
    { value: '0', degree: 0 },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();

  const formatPolynomial = (coeffs: Coefficient[]): string => {
    return coeffs
      .sort((a, b) => b.degree - a.degree)
      .map((coeff, index) => {
        const value = parseFloat(coeff.value);
        if (value === 0) return '';
        const sign = value > 0 && index !== 0 ? '+' : '';
        const coefficient = Math.abs(value) === 1 && coeff.degree > 0 ? '' : Math.abs(value);
        const variable = coeff.degree > 0 ? 'x' : '';
        const exponent = coeff.degree > 1 ? `^${coeff.degree}` : '';
        return `${sign}${coefficient}${variable}${exponent}`;
      })
      .filter(term => term)
      .join('') || '0';
  };

  const addTerm = (coefficients: Coefficient[], setCoefficients: (c: Coefficient[]) => void) => {
    const newDegree = Math.max(...coefficients.map(c => c.degree)) + 1;
    setCoefficients([...coefficients, { value: '1', degree: newDegree }]);
  };

  const removeTerm = (coefficients: Coefficient[], setCoefficients: (c: Coefficient[]) => void, degree: number) => {
    setCoefficients(coefficients.filter(c => c.degree !== degree));
  };

  const updateCoefficient = (
    coefficients: Coefficient[],
    setCoefficients: (c: Coefficient[]) => void,
    degree: number,
    value: string
  ) => {
    setCoefficients(
      coefficients.map(c => c.degree === degree ? { ...c, value } : c)
    );
  };

  const validateCoefficients = (coeffs: Coefficient[]): boolean => {
    return coeffs.length > 0 && coeffs.some(c => c.value.trim() !== '' && !isNaN(Number(c.value)) && Number(c.value) !== 0);
  };

  const handleCalculate = () => {
    setError(null);
    setResult(null);
    setIsLoading(true);
    setTimeout(() => {
      const valid1 = validateCoefficients(coefficients1);
      const valid2 = ['multiply', 'divide', 'gcd'].includes(operation) ? validateCoefficients(coefficients2) : true;
      if (!valid1 || !valid2) {
        setError('Please enter valid, non-zero coefficients for all required polynomials.');
        toast({ title: 'Invalid Input', description: 'Check all coefficients and ensure at least one is non-zero.', variant: 'destructive' });
        setIsLoading(false);
        onError('Invalid input');
        return;
      }
      try {
        const poly1 = formatPolynomial(coefficients1);
        const poly2 = formatPolynomial(coefficients2);
        let res = '';
        switch (operation) {
          case 'roots':
            res = `\\text{Finding roots of } ${poly1} = 0`;
            break;
          case 'factor':
            res = `${poly1} = (x+a)(x+b)`;
            break;
          case 'multiply':
            res = `(${poly1})(${poly2})`;
            break;
          case 'divide':
            res = `\\frac{${poly1}}{${poly2}}`;
            break;
          case 'gcd':
            res = `\\gcd(${poly1}, ${poly2})`;
            break;
        }
        setResult(res);
        toast({ title: 'Result', description: 'Calculation complete.' });
        onResult(res);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'An error occurred';
        setError(msg);
        toast({ title: 'Error', description: msg, variant: 'destructive' });
        onError(msg);
      } finally {
        setIsLoading(false);
      }
    }, 200);
  };

  return (
    <div className="space-y-4" aria-label="Polynomial Operations">
      <div className="space-y-2">
        <Label>Operation</Label>
        <Select value={operation} onValueChange={(v) => setOperation(v as PolynomialOperation)}>
          <SelectTrigger>
            <SelectValue placeholder="Select operation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="roots">Find Roots</SelectItem>
            <SelectItem value="factor">Factorize</SelectItem>
            <SelectItem value="multiply">Multiply</SelectItem>
            <SelectItem value="divide">Divide</SelectItem>
            <SelectItem value="gcd">Find GCD</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>First Polynomial</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addTerm(coefficients1, setCoefficients1)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Term
          </Button>
        </div>
        <div className="space-y-2">
          {coefficients1.map((coeff) => (
            <div key={coeff.degree} className="flex items-center gap-2">
              <Input
                value={coeff.value}
                onChange={(e) => updateCoefficient(coefficients1, setCoefficients1, coeff.degree, e.target.value)}
                placeholder="Coefficient"
                className="flex-1"
              />
              <span>x^{coeff.degree}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeTerm(coefficients1, setCoefficients1, coeff.degree)}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {['multiply', 'divide', 'gcd'].includes(operation) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Second Polynomial</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addTerm(coefficients2, setCoefficients2)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Term
            </Button>
          </div>
          <div className="space-y-2">
            {coefficients2.map((coeff) => (
              <div key={coeff.degree} className="flex items-center gap-2">
                <Input
                  value={coeff.value}
                  onChange={(e) => updateCoefficient(coefficients2, setCoefficients2, coeff.degree, e.target.value)}
                  placeholder="Coefficient"
                  className="flex-1"
                />
                <span>x^{coeff.degree}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTerm(coefficients2, setCoefficients2, coeff.degree)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Alert variant="default" className="bg-muted/50">
        <Info className="h-4 w-4" />
        <AlertDescription>
          {operation === 'roots' && "Enter coefficients to find the roots of the polynomial."}
          {operation === 'factor' && "Enter coefficients to factorize the polynomial."}
          {operation === 'multiply' && "Enter coefficients for both polynomials to multiply them."}
          {operation === 'divide' && "Enter coefficients for both polynomials to perform division."}
          {operation === 'gcd' && "Enter coefficients for both polynomials to find their greatest common divisor."}
        </AlertDescription>
      </Alert>

      <Button onClick={handleCalculate} className="w-full" disabled={isLoading} aria-busy={isLoading} aria-label="Calculate polynomial operation">
        {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Calculating...</>) : 'Calculate'}
      </Button>
      <div aria-live="polite" aria-atomic="true">
        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {result && !error && (
          <div className="text-center mt-2">
            <KatexDisplay 
              math={result}
              displayMode={true}
            />
          </div>
        )}
      </div>

      <div className="text-center">
        <KatexDisplay 
          math={formatPolynomial(coefficients1)}
          displayMode={false}
        />
        {['multiply', 'divide', 'gcd'].includes(operation) && (
          <KatexDisplay 
            math={operation === 'divide' ? '÷' : operation === 'multiply' ? '×' : ','}
            displayMode={false}
          />
        )}
        {['multiply', 'divide', 'gcd'].includes(operation) && (
          <KatexDisplay 
            math={formatPolynomial(coefficients2)}
            displayMode={false}
          />
        )}
      </div>
    </div>
  );
};
