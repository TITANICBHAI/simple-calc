"use client";

import { useState, useEffect, type ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, RefreshCw, Copy, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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

export default function NumericalBaseConverter() {
  const [inputValue, setInputValue] = useState<string>('');
  const [inputBase, setInputBase] = useState<Base>(10);
  
  const [outputBinary, setOutputBinary] = useState<string>('');
  const [outputOctal, setOutputOctal] = useState<string>('');
  const [outputDecimal, setOutputDecimal] = useState<string>('');
  const [outputHex, setOutputHex] = useState<string>('');
  
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

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
    if (/^[0-9a-fA-F]*$/.test(val) || val === '') {
       setInputValue(val);
    }
  };

  const handleBaseChange = (value: string) => {
    const newBase = parseInt(value, 10) as Base;
    setInputBase(newBase);
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

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
      toast({
        title: "Copied!",
        description: `${fieldName} value copied to clipboard`
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const examples = [
    { base: 10, value: '255', description: 'Common decimal number' },
    { base: 2, value: '1101', description: 'Binary representation' },
    { base: 16, value: 'FF', description: 'Hexadecimal (common in programming)' },
    { base: 8, value: '377', description: 'Octal representation' }
  ];

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-blue-500" />
          Numerical Base Converter
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Convert numbers between binary, octal, decimal, and hexadecimal bases
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="input-base">Input Base</Label>
            <Select value={String(inputBase)} onValueChange={handleBaseChange}>
              <SelectTrigger id="input-base">
                <SelectValue placeholder="Select base" />
              </SelectTrigger>
              <SelectContent>
                {bases.map((base) => (
                  <SelectItem key={base.value} value={String(base.value)}>
                    {base.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="input-value">Input Value</Label>
            <Input
              id="input-value"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={`Enter ${bases.find(b => b.value === inputBase)?.label.toLowerCase()} number`}
              className="font-mono"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-semibold text-base">Converted Values:</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Binary (Base 2)</Label>
              <div className="flex items-center gap-2">
                <Input 
                  value={outputBinary} 
                  readOnly 
                  className="font-mono bg-green-50"
                  placeholder="Binary result"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(outputBinary, 'Binary')}
                  disabled={!outputBinary}
                >
                  {copiedField === 'Binary' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Octal (Base 8)</Label>
              <div className="flex items-center gap-2">
                <Input 
                  value={outputOctal} 
                  readOnly 
                  className="font-mono bg-blue-50"
                  placeholder="Octal result"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(outputOctal, 'Octal')}
                  disabled={!outputOctal}
                >
                  {copiedField === 'Octal' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Decimal (Base 10)</Label>
              <div className="flex items-center gap-2">
                <Input 
                  value={outputDecimal} 
                  readOnly 
                  className="font-mono bg-yellow-50"
                  placeholder="Decimal result"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(outputDecimal, 'Decimal')}
                  disabled={!outputDecimal}
                >
                  {copiedField === 'Decimal' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Hexadecimal (Base 16)</Label>
              <div className="flex items-center gap-2">
                <Input 
                  value={outputHex} 
                  readOnly 
                  className="font-mono bg-purple-50"
                  placeholder="Hexadecimal result"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(outputHex, 'Hexadecimal')}
                  disabled={!outputHex}
                >
                  {copiedField === 'Hexadecimal' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-sm">Example Values to Try:</h4>
          <div className="grid grid-cols-2 gap-2">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => {
                  setInputBase(example.base);
                  setInputValue(example.value);
                }}
                className="p-2 text-left border rounded-md hover:bg-gray-50 transition-colors"
              >
                <div className="font-mono text-sm font-medium">{example.value}</div>
                <div className="text-xs text-muted-foreground">{example.description}</div>
              </button>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button variant="outline" onClick={handleReset} className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset Converter
        </Button>
      </CardFooter>
    </Card>
  );
}