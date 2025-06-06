"use client";

import { useState, type ChangeEvent, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, RefreshCw, BinaryIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Base = '10' | '2' | '16'; // Simplified for now, Octal can be added later if needed
type Operation = 'AND' | 'OR' | 'XOR' | 'NOT' | 'LSHIFT' | 'RSHIFT' | 'RSHIFT_UNSIGNED' | 'ROTATE_LEFT' | 'ROTATE_RIGHT' | 'NAND' | 'NOR' | 'XNOR';

const baseOptions: { value: Base; label: string }[] = [
  { value: '10', label: 'Decimal' },
  { value: '2', label: 'Binary' },
  { value: '16', label: 'Hexadecimal' },
];

const operationOptions: { value: Operation; label: string; isUnary?: boolean }[] = [
  { value: 'AND', label: 'AND' },
  { value: 'OR', label: 'OR' },
  { value: 'XOR', label: 'XOR' },
  { value: 'NOT', label: 'NOT (Bitwise Complement)', isUnary: true },
  { value: 'NAND', label: 'NAND (NOT AND)' },
  { value: 'NOR', label: 'NOR (NOT OR)' },
  { value: 'XNOR', label: 'XNOR (NOT XOR)' },
  { value: 'LSHIFT', label: 'Left Shift (<<)' },
  { value: 'RSHIFT', label: 'Right Shift (>>) [Arithmetic]' },
  { value: 'RSHIFT_UNSIGNED', label: 'Right Shift (>>>) [Logical]' },
  { value: 'ROTATE_LEFT', label: 'Rotate Left (ROL)' },
  { value: 'ROTATE_RIGHT', label: 'Rotate Right (ROR)' },
];

const baseValidationRegex: Record<Base, RegExp> = {
  '2': /^[01]*$/,
  '10': /^-?\d+$/, // Allow negative for decimal input, ensure it's a full number
  '16': /^[0-9a-fA-F]+$/,
};

const ByteCalculator: React.FC = () => {
  const [operand1, setOperand1] = useState<string>('');
  const [operand1Base, setOperand1Base] = useState<Base>('10');
  const [operand2, setOperand2] = useState<string>('');
  const [operand2Base, setOperand2Base] = useState<Base>('10');
  const [operation, setOperation] = useState<Operation>('AND');
  const [shiftAmount, setShiftAmount] = useState<string>('1');

  const [resultDecimal, setResultDecimal] = useState<string>('');
  const [resultBinary, setResultBinary] = useState<string>('');
  const [resultHex, setResultHex] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const selectedOperationDetails = operationOptions.find(op => op.value === operation);
  const isUnary = selectedOperationDetails?.isUnary || false;
  const isShiftOperation = operation === 'LSHIFT' || operation === 'RSHIFT';

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, inputBase: Base) => (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Basic character set check, more thorough validation on calculate
    if (/^[0-9a-fA-F-]*$/.test(val) || val === '') {
        setter(val);
        setError(null); // Clear error on new input
    } else {
        // This is a soft block, user can still type, but better UX might involve immediate feedback
    }
  };
  
  const handleShiftAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) { 
        setShiftAmount(val);
    }
  };

  const parseInput = (value: string, base: Base, operandName: string): number | null => {
    const trimmedValue = value.trim();
    if (trimmedValue === '') {
      setError(`${operandName} cannot be empty.`);
      return null;
    }
    if (base === '10' && trimmedValue === '-') {
        setError(`${operandName} has incomplete negative number.`);
        return null;
    }
    if (!baseValidationRegex[base].test(trimmedValue)) {
      setError(`Invalid value "${trimmedValue}" for ${baseOptions.find(b => b.value === base)?.label} ${operandName}.`);
      return null;
    }
    
    const numericBase = parseInt(base, 10);
    const parsed = parseInt(trimmedValue, numericBase);

    if (isNaN(parsed)) {
      setError(`Could not parse "${trimmedValue}" as ${baseOptions.find(b => b.value === base)?.label} ${operandName}.`);
      return null;
    }
    // Check for potential size issues, JS bitwise ops are on 32-bit signed integers
    // This is a simple check; true 64-bit or arbitrary precision would need BigInt
    if (parsed > 2147483647 || parsed < -2147483648) {
        setError(`${operandName} value is outside the standard 32-bit signed integer range. Results may be unexpected for bitwise operations.`);
        // Allow calculation to proceed but warn user
    }
    return parsed;
  };


  const handleCalculate = () => {
    setError(null);
    setResultDecimal('');
    setResultBinary('');
    setResultHex('');

    // Enhanced input validation
    const validateInput = (value: string, base: Base, name: string): number | null => {
      const trimmedValue = value.trim();
      if (trimmedValue === '') {
        setError(`${name} cannot be empty.`);
        return null;
      }

      // Add base-specific validation
      const baseValidation: Record<Base, RegExp> = {
        '2': /^[01]+$/,
        '10': /^-?\d+$/,
        '16': /^[0-9a-fA-F]+$/i
      };

      if (!baseValidation[base].test(trimmedValue)) {
        setError(`Invalid ${name} for base ${base}`);
        return null;
      }

      let parsedValue: number;
      try {
        parsedValue = base === '10' 
          ? parseInt(trimmedValue, 10)
          : parseInt(trimmedValue, parseInt(base));
      } catch (e) {
        setError(`Failed to parse ${name}`);
        return null;
      }

      // Check for 32-bit integer bounds
      if (base === '10' && (parsedValue > 0x7FFFFFFF || parsedValue < -0x80000000)) {
        setError(`${name} exceeds 32-bit integer bounds`);
        return null;
      }

      return parsedValue;
    };

    const val1 = validateInput(operand1, operand1Base, 'Operand 1');
    if (val1 === null) return;

    let finalResult: number | null = null;
    
    if (isUnary) {
      // Handle unary operations
      finalResult = ~val1;
    } else {
      const val2 = validateInput(operand2, operand2Base, 'Operand 2');
      if (val2 === null) return;

      if (isShiftOperation || operation === 'ROTATE_LEFT' || operation === 'ROTATE_RIGHT') {
        const shift = parseInt(shiftAmount);
        if (isNaN(shift) || shift < 0 || shift > 63) {
          setError("Shift/rotate amount must be between 0 and 63");
          return;
        }

        // Implement new operations
        switch (operation) {
          case 'LSHIFT':
            finalResult = val1 << shift;
            break;
          case 'RSHIFT':
            finalResult = val1 >> shift; // Arithmetic right shift
            break;
          case 'RSHIFT_UNSIGNED':
            finalResult = val1 >>> shift; // Logical right shift
            break;
          case 'ROTATE_LEFT':
            finalResult = ((val1 << shift) | (val1 >>> (32 - shift))) | 0;
            break;
          case 'ROTATE_RIGHT':
            finalResult = ((val1 >>> shift) | (val1 << (32 - shift))) | 0;
            break;
          default:
            setError("Invalid shift operation");
            return;
        }
      } else {
        // Handle binary operations
        switch (operation) {
          case 'AND': finalResult = val1 & val2; break;
          case 'OR': finalResult = val1 | val2; break;
          case 'XOR': finalResult = val1 ^ val2; break;
          case 'NAND': finalResult = ~(val1 & val2); break;
          case 'NOR': finalResult = ~(val1 | val2); break;
          case 'XNOR': finalResult = ~(val1 ^ val2); break;
          default: setError("Invalid operation selected"); return;
        }
      }
    }

    if (finalResult !== null && !isNaN(finalResult)) {
      // Ensure 32-bit integer result
      finalResult = finalResult | 0;
      
      setResultDecimal(finalResult.toString(10));
      // Get binary representation with proper padding
      setResultBinary((finalResult >>> 0).toString(2).padStart(32, '0'));
      // Get hex representation with proper padding and uppercase
      setResultHex((finalResult >>> 0).toString(16).toUpperCase().padStart(8, '0'));
      
      // Add informative toast with binary grouping
      const binaryGrouped = (finalResult >>> 0).toString(2).padStart(32, '0')
        .match(/.{1,8}/g)?.join(' ');
      toast({ 
        title: "Calculation Complete", 
        description: `Result in binary (grouped): ${binaryGrouped}`,
        variant: "default"
      });
    } else if (!error) { // If no specific error was set but result is null
        setError("Calculation failed. Please check inputs and operation.");
    }
  };
  
  const handleReset = () => {
    setOperand1('');
    setOperand1Base('10');
    setOperand2('');
    setOperand2Base('10');
    setOperation('AND');
    setShiftAmount('1');
    setResultDecimal('');
    setResultBinary('');
    setResultHex('');
    setError(null);
    toast({ title: "Byte Calculator Reset", description: "Fields cleared." });
  };

  useEffect(() => { 
    if (isUnary) {
        setOperand2(''); // Clear operand 2 if operation becomes unary
        // Optionally clear operand2Base as well, or disable it.
    }
    if (!isShiftOperation) {
        // setShiftAmount('1'); // Reset shift amount if not a shift op
    }
    setError(null); // Clear errors when operation changes
    setResultDecimal(''); setResultBinary(''); setResultHex(''); // Clear results
  }, [operation, isUnary, isShiftOperation]);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-md flex items-center">
            <BinaryIcon className="mr-2 h-5 w-5 text-primary" />
            Byte Calculator (32-bit Integer Operations)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Operand 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div>
            <Label htmlFor="operand1" className="text-sm font-medium">Operand 1</Label>
            <Input
              id="operand1"
              value={operand1}
              onChange={handleInputChange(setOperand1, operand1Base)}
              placeholder="Enter number"
              className="mt-1 font-mono"
            />
          </div>
          <div>
            <Label htmlFor="operand1Base" className="text-sm font-medium">Base</Label>
            <Select value={operand1Base} onValueChange={(v) => { setOperand1Base(v as Base); setOperand1(''); }}>
              <SelectTrigger id="operand1Base" className="mt-1">
                <SelectValue placeholder="Base" />
              </SelectTrigger>
              <SelectContent>
                {baseOptions.map(b => <SelectItem key={`op1-${b.value}`} value={b.value}>{b.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Operation */}
        <div>
            <Label htmlFor="operation" className="text-sm font-medium">Operation</Label>
            <Select value={operation} onValueChange={(v) => setOperation(v as Operation)}>
                <SelectTrigger id="operation" className="mt-1">
                    <SelectValue placeholder="Select Operation" />
                </SelectTrigger>
                <SelectContent>
                    {operationOptions.map(op => <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>

        {/* Operand 2 - Conditional */}
        {!isUnary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <Label htmlFor="operand2" className="text-sm font-medium">Operand 2</Label>
              <Input
                id="operand2"
                value={operand2}
                onChange={handleInputChange(setOperand2, operand2Base)}
                placeholder="Enter number"
                className="mt-1 font-mono"
                disabled={isUnary}
              />
            </div>
            <div>
              <Label htmlFor="operand2Base" className="text-sm font-medium">Base</Label>
              <Select value={operand2Base} onValueChange={(v) => { setOperand2Base(v as Base); setOperand2(''); }} disabled={isUnary}>
                <SelectTrigger id="operand2Base" className="mt-1" disabled={isUnary}>
                  <SelectValue placeholder="Base" />
                </SelectTrigger>
                <SelectContent>
                  {baseOptions.map(b => <SelectItem key={`op2-${b.value}`} value={b.value}>{b.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
        {/* Shift Amount - Conditional */}
        {isShiftOperation && !isUnary && ( // Shift operations are binary here
             <div>
                <Label htmlFor="shiftAmount" className="text-sm font-medium">Shift Amount (0-63)</Label>
                <Input
                id="shiftAmount"
                type="text" // Use text to allow empty string initially and better control
                inputMode="numeric"
                value={shiftAmount}
                onChange={handleShiftAmountChange}
                placeholder="e.g., 1"
                className="mt-1 font-mono"
                />
            </div>
        )}

        <Button onClick={handleCalculate} className="w-full sm:w-auto">Calculate</Button>

        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </Alert>
        )}

        {/* Results */}
        {(resultDecimal || resultBinary || resultHex) && !error && (
          <div className="space-y-3 pt-3 border-t border-border mt-3">
            <h4 className="text-sm font-medium text-muted-foreground">Result:</h4>
            <div className="grid grid-cols-1 gap-2">
              <div>
                <Label htmlFor="resultDecimal" className="text-xs">Decimal:</Label>
                <Input id="resultDecimal" value={resultDecimal} readOnly className="mt-0.5 font-mono bg-muted/30 h-9" />
              </div>
              <div>
                <Label htmlFor="resultBinary" className="text-xs">Binary (32-bit Two's Complement):</Label>
                <Input id="resultBinary" value={resultBinary} readOnly className="mt-0.5 font-mono bg-muted/30 h-9 text-xs break-all" />
              </div>
              <div>
                <Label htmlFor="resultHex" className="text-xs">Hexadecimal:</Label>
                <Input id="resultHex" value={resultHex} readOnly className="mt-0.5 font-mono bg-muted/30 h-9" />
              </div>
            </div>
             <p className="text-xs text-muted-foreground italic pt-2">Note: Calculations are performed on 32-bit signed integers. Binary is shown in two's complement form.</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={handleReset} className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" /> Reset Calculator
        </Button>
        <ins className="adsbygoogle"
             style={{ display: 'block', textAlign: 'center' }}
             data-ad-client="ca-pub-1074051846339488"
             data-ad-slot="8922282796"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script dangerouslySetInnerHTML={{ __html: '(adsbygoogle = window.adsbygoogle || []).push({});' }} />
      </CardFooter>
    </Card>
  );
};

export default ByteCalculator;

