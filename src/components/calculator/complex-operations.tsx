"use client";

import React, { useState, type FC } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { KatexDisplay } from '@/components/ui/katex-display';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';

interface ComplexNumber {
  re: number;
  im: number;
}

type ComplexOperation = 'add' | 'subtract' | 'multiply' | 'divide' | 'power';

interface ComplexOperationsProps {
  onResult: (result: string) => void;
  onError: (error: string) => void;
}

export const ComplexOperations: FC<ComplexOperationsProps> = ({ onResult, onError }) => {
  const [z1Real, setZ1Real] = useState<string>('0');
  const [z1Imag, setZ1Imag] = useState<string>('0');
  const [z2Real, setZ2Real] = useState<string>('0');
  const [z2Imag, setZ2Imag] = useState<string>('0');
  const [operation, setOperation] = useState<ComplexOperation>('add');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();

  const parseComplex = (real: string, imag: string): ComplexNumber => {
    const re = parseFloat(real) || 0;
    const im = parseFloat(imag) || 0;
    return { re, im };
  };

  const formatComplex = (z: ComplexNumber): string => {
    if (z.im === 0) return z.re.toString();
    if (z.re === 0) return `${z.im}i`;
    return `${z.re}${z.im >= 0 ? '+' : ''}${z.im}i`;
  };

  const validateInput = (real: string, imag: string) => {
    if (real.trim() === '' || imag.trim() === '') return false;
    if (isNaN(Number(real)) || isNaN(Number(imag))) return false;
    return true;
  };

  const performOperation = () => {
    setError(null);
    setResult(null);
    setIsLoading(true);
    setTimeout(() => {
      if (!validateInput(z1Real, z1Imag) || !validateInput(z2Real, z2Imag)) {
        setError('Please enter valid real and imaginary parts for both complex numbers.');
        toast({ title: 'Invalid Input', description: 'Please enter valid numbers for all fields.', variant: 'destructive' });
        setIsLoading(false);
        onError('Invalid input');
        return;
      }
      try {
        const z1 = parseComplex(z1Real, z1Imag);
        const z2 = parseComplex(z2Real, z2Imag);
        let resultVal: ComplexNumber;
        switch (operation) {
          case 'add':
            resultVal = { re: z1.re + z2.re, im: z1.im + z2.im };
            break;
          case 'subtract':
            resultVal = { re: z1.re - z2.re, im: z1.im - z2.im };
            break;
          case 'multiply':
            resultVal = { re: z1.re * z2.re - z1.im * z2.im, im: z1.re * z2.im + z1.im * z2.re };
            break;
          case 'divide':
            const denominator = z2.re * z2.re + z2.im * z2.im;
            if (denominator === 0) throw new Error('Division by zero');
            resultVal = {
              re: (z1.re * z2.re + z1.im * z2.im) / denominator,
              im: (z1.im * z2.re - z1.re * z2.im) / denominator
            };
            break;
          case 'power':
            const r = Math.sqrt(z1.re * z1.re + z1.im * z1.im);
            const theta = Math.atan2(z1.im, z1.re);
            const n = Math.round(z2.re); // Only integer powers for now
            resultVal = {
              re: Math.pow(r, n) * Math.cos(n * theta),
              im: Math.pow(r, n) * Math.sin(n * theta)
            };
            break;
          default:
            throw new Error('Invalid operation');
        }
        const formatted = formatComplex(resultVal);
        setResult(formatted);
        toast({ title: 'Result', description: `Result: ${formatted}` });
        onResult(formatted);
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
    <div className="space-y-4" aria-label="Complex Number Operations">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="z1-real">First Complex Number (z₁)</Label>
          <div className="flex gap-2 items-center">
            <Input
              id="z1-real"
              value={z1Real}
              onChange={(e) => setZ1Real(e.target.value)}
              placeholder="Real part"
              className="flex-1"
              aria-label="z1 real part"
              aria-invalid={!validateInput(z1Real, z1Imag)}
            />
            <span>+</span>
            <Input
              id="z1-imag"
              value={z1Imag}
              onChange={(e) => setZ1Imag(e.target.value)}
              placeholder="Imaginary part"
              className="flex-1"
              aria-label="z1 imaginary part"
              aria-invalid={!validateInput(z1Real, z1Imag)}
            />
            <span>i</span>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="z2-real">Second Complex Number (z₂)</Label>
          <div className="flex gap-2 items-center">
            <Input
              id="z2-real"
              value={z2Real}
              onChange={(e) => setZ2Real(e.target.value)}
              placeholder="Real part"
              className="flex-1"
              aria-label="z2 real part"
              aria-invalid={!validateInput(z2Real, z2Imag)}
            />
            <span>+</span>
            <Input
              id="z2-imag"
              value={z2Imag}
              onChange={(e) => setZ2Imag(e.target.value)}
              placeholder="Imaginary part"
              className="flex-1"
              aria-label="z2 imaginary part"
              aria-invalid={!validateInput(z2Real, z2Imag)}
            />
            <span>i</span>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Operation</Label>
        <Select value={operation} onValueChange={(v) => setOperation(v as ComplexOperation)}>
          <SelectTrigger aria-label="Select complex operation">
            <SelectValue placeholder="Select operation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="add">Add (z₁ + z₂)</SelectItem>
            <SelectItem value="subtract">Subtract (z₁ - z₂)</SelectItem>
            <SelectItem value="multiply">Multiply (z₁ × z₂)</SelectItem>
            <SelectItem value="divide">Divide (z₁ ÷ z₂)</SelectItem>
            <SelectItem value="power">Power (z₁ⁿ, n = Re(z₂))</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={performOperation} className="w-full" disabled={isLoading} aria-busy={isLoading} aria-label="Calculate complex operation">
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
              math={`\\text{Result:}\;${result}`}
              displayMode={true}
            />
          </div>
        )}
      </div>
      <div className="text-center">
        <KatexDisplay 
          math={`z_1 = ${formatComplex(parseComplex(z1Real, z1Imag))}\\;,\\;z_2 = ${formatComplex(parseComplex(z2Real, z2Imag))}`}
          displayMode={false}
        />
      </div>
    </div>
  );
};
