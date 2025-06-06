
"use client";

import { useState, useEffect, type ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Base = 2 | 8 | 10 | 16;
const bases: { value: Base; label: string }[] = [
  { value: 2, label: 'Binary (Base 2)' },
  { value: 8, label: 'Octal (Base 8)' },
  { value: 10, label: 'Decimal (Base 10)' },
  { value: 16, label: 'Hexadecimal (Base 16)' },
];

const baseValidationRegex: Record<Base, RegExp> = {
  2: /^[01]*$/,
  8: /^[0-7]*$/,
  10: /^\d*$/,
  16: /^[0-9a-fA-F]*$/,
};

const NumericalBaseConverter: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const [inputBase, setInputBase] = useState<Base>(10);
  
  const [outputBinary, setOutputBinary] = useState<string>('');
  const [outputOctal, setOutputOctal] = useState<string>('');
  const [outputDecimal, setOutputDecimal] = useState<string>('');
  const [outputHex, setOutputHex] = useState<string>('');
  
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (inputValue.trim() === '') {
      setOutputBinary('');
      setOutputOctal('');
      setOutputDecimal('');
      setOutputHex('');
      setError(null);
      return;
    }

    if (!baseValidationRegex[inputBase].test(inputValue)) {
      setError(`Invalid characters for ${bases.find(b => b.value === inputBase)?.label}.`);
      setOutputBinary('');
      setOutputOctal('');
      setOutputDecimal('');
      setOutputHex('');
      return;
    }
    setError(null);

    try {
      const decimalValue = parseInt(inputValue, inputBase);
      if (isNaN(decimalValue)) {
        // This case should be rare if regex validation is good, but as a fallback
        setError('Invalid number for selected base.');
        return;
      }

      setOutputDecimal(String(decimalValue));
      setOutputBinary(decimalValue.toString(2));
      setOutputOctal(decimalValue.toString(8));
      setOutputHex(decimalValue.toString(16).toUpperCase());

    } catch (e) {
      console.error("Conversion error:", e);
      setError("Error during conversion. Input might be too large or invalid.");
      setOutputBinary('');
      setOutputOctal('');
      setOutputDecimal('');
      setOutputHex('');
    }

  }, [inputValue, inputBase]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow only valid characters for any base temporarily, full validation in useEffect
    if (/^[0-9a-fA-F]*$/.test(val) || val === '') {
       setInputValue(val);
    }
  };

  const handleBaseChange = (value: string) => {
    const newBase = parseInt(value, 10) as Base;
    setInputBase(newBase);
    // Clear input if it's not valid for the new base
    if (inputValue && !baseValidationRegex[newBase].test(inputValue)) {
      setInputValue('');
      toast({
        title: "Input Cleared",
        description: `Previous input was invalid for ${bases.find(b => b.value === newBase)?.label}.`,
        variant: "default"
      });
    }
  };

  const handleReset = () => {
    setInputValue('');
    setInputBase(10);
    setError(null);
    toast({ title: "Converter Reset", description: "All fields cleared." });
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg">Numerical Base Converter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div>
            <Label htmlFor="inputValue" className="text-sm font-medium">Input Value</Label>
            <Input
              id="inputValue"
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Enter number"
              className="mt-1 font-mono"
              aria-label="Number to convert"
            />
          </div>
          <div>
            <Label htmlFor="inputBase" className="text-sm font-medium">Input Base</Label>
            <Select value={String(inputBase)} onValueChange={handleBaseChange}>
              <SelectTrigger id="inputBase" className="mt-1" aria-label="Base of the input number">
                <SelectValue placeholder="Select base" />
              </SelectTrigger>
              <SelectContent>
                {bases.map(base => (
                  <SelectItem key={base.value} value={String(base.value)}>
                    {base.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <div className="flex items-center p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-3 pt-3 border-t border-border mt-3">
          <h4 className="text-sm font-medium text-muted-foreground">Converted Values:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <Label htmlFor="outputDecimal" className="text-xs">Decimal (Base 10):</Label>
              <Input id="outputDecimal" value={outputDecimal} readOnly className="mt-0.5 font-mono bg-muted/30 h-9" />
            </div>
            <div>
              <Label htmlFor="outputBinary" className="text-xs">Binary (Base 2):</Label>
              <Input id="outputBinary" value={outputBinary} readOnly className="mt-0.5 font-mono bg-muted/30 h-9" />
            </div>
            <div>
              <Label htmlFor="outputOctal" className="text-xs">Octal (Base 8):</Label>
              <Input id="outputOctal" value={outputOctal} readOnly className="mt-0.5 font-mono bg-muted/30 h-9" />
            </div>
            <div>
              <Label htmlFor="outputHex" className="text-xs">Hexadecimal (Base 16):</Label>
              <Input id="outputHex" value={outputHex} readOnly className="mt-0.5 font-mono bg-muted/30 h-9" />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={handleReset} className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" /> Reset Converter
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NumericalBaseConverter;
