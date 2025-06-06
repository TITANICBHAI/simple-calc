"use client";

import { useState, type ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table2, Info, Sigma, RotateCw, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TableDataPoint {
  x: number;
  fx: string | number; // Allow string for "Error" or "N/A"
}

// Allowed Math object properties and methods for safety
const ALLOWED_MATH_PROPS = new Set([
  'abs', 'acos', 'acosh', 'asin', 'asinh', 'atan', 'atanh', 'atan2',
  'cbrt', 'ceil', 'clz32', 'cos', 'cosh', 'exp', 'expm1', 'floor',
  'fround', 'hypot', 'imul', 'log', 'log1p', 'log10', 'log2', 'max',
  'min', 'pow', 'random', 'round', 'sign', 'sin', 'sinh', 'sqrt',
  'tan', 'tanh', 'trunc', 'E', 'LN10', 'LN2', 'LOG10E', 'LOG2E', 'PI',
  'SQRT1_2', 'SQRT2'
]);

const FunctionTableGenerator: React.FC = () => {
  const [equation, setEquation] = useState<string>('x**2');
  const [startXInput, setStartXInput] = useState<string>('0');
  const [endXInput, setEndXInput] = useState<string>('10');
  const [stepInput, setStepInput] = useState<string>('1');

  const [tableData, setTableData] = useState<TableDataPoint[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    setError(null); // Clear error on input change
  };

  const sanitizeAndValidateEquation = (eq: string): string | null => {
    let sanitized = eq.trim();
    if (!sanitized) {
      setError("Equation cannot be empty.");
      return null;
    }
    sanitized = sanitized.replace(/\^/g, '**'); // Replace ^ with ** for JS exponentiation
    // Allow: x, numbers, spaces, basic operators, parentheses, Math object usage, dot.
    const validCharsRegex = /^[x0-9\s.+\-*/%()Maht\.sqrtpoweloginsctE]+$/i;
    if (!validCharsRegex.test(sanitized)) {
      setError("Equation contains invalid characters. Use x, numbers, operators (+-*/%**), parentheses, Math functions (e.g., Math.sin(x)), E for scientific notation.");
      return null;
    }
    // Check for disallowed keywords to prevent malicious code injection
    const disallowedKeywords = /\b(let|var|const|function|return|if|else|for|while|switch|case|new|this|window|document|alert|eval|setTimeout|setInterval)\b/gi;
    if (disallowedKeywords.test(sanitized)) {
        setError("Equation contains disallowed keywords.");
        return null;
    }
    // Validate Math object usage
    const mathUsageRegex = /Math\.([a-zA-Z0-9_]+)/g;
    let match;
    while((match = mathUsageRegex.exec(sanitized)) !== null) {
        if (!ALLOWED_MATH_PROPS.has(match[1])) {
            setError(`Disallowed Math property or method: Math.${match[1]}. Allowed: PI, E, sin, cos, tan, log, sqrt, pow, etc.`);
            return null;
        }
    }
    return sanitized;
  };

  const handleGenerateTable = () => {
    setError(null);
    setTableData(null);
    setIsLoading(true);

    const startX = parseFloat(startXInput);
    const endX = parseFloat(endXInput);
    const step = parseFloat(stepInput);

    let errorMessages: string[] = [];
    if (isNaN(startX)) errorMessages.push("Start X must be a valid number.");
    if (isNaN(endX)) errorMessages.push("End X must be a valid number.");
    if (isNaN(step)) errorMessages.push("Step must be a valid number.");
    if (!isNaN(startX) && !isNaN(endX) && startX >= endX) errorMessages.push("Start X must be less than End X.");
    if (!isNaN(step) && step <= 0) errorMessages.push("Step must be greater than 0.");

    const sanitizedEquation = sanitizeAndValidateEquation(equation);
    if (!sanitizedEquation) {
        // Error is already set by sanitizeAndValidateEquation
        setIsLoading(false);
        return;
    }
    
    if (errorMessages.length > 0) {
      setError(errorMessages.join(" "));
      setIsLoading(false);
      return;
    }

    const points: TableDataPoint[] = [];
    try {
      const plotFunction = new Function('x', `
        with (Math) { 
          return ${sanitizedEquation};
        }
      `);
      
      for (let currentX = startX; currentX <= endX; currentX += step) {
        let yValue: string | number;
        try {
          const rawY = plotFunction(currentX);
          if (typeof rawY === 'number' && isFinite(rawY)) {
            yValue = parseFloat(rawY.toFixed(5)); // Format to reasonable precision
          } else if (typeof rawY === 'number' && (isNaN(rawY) || !isFinite(rawY))) {
            yValue = "N/A"; // Not a Number or Infinity
          } else {
            yValue = "Error"; // Unexpected result type
          }
        } catch (evalError) {
          console.warn(`Error evaluating f(${currentX}):`, evalError);
          yValue = "Error"; 
        }
        points.push({ x: parseFloat(currentX.toFixed(5)), fx: yValue });
      }
      
      if (points.length === 0) {
        setError("Could not generate any data points. Check your range and step.");
      } else {
        setTableData(points);
        toast({
          title: "Table Generated",
          description: `Table for y = ${equation} generated successfully.`,
        });
      }

    } catch (e) { // Errors in creating the plotFunction (syntax errors in equation)
      console.error("Function creation error:", e);
      const errorMessage = e instanceof Error ? e.message : "Unknown error during table generation.";
      setError(`Equation Syntax Error: ${errorMessage}. Ensure correct syntax.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setEquation('x**2');
    setStartXInput('0');
    setEndXInput('10');
    setStepInput('1');
    setTableData(null);
    setError(null);
    setIsLoading(false);
    toast({ title: "Function Table Reset", description: "Inputs reset to default." });
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Table2 className="mr-2 h-6 w-6 text-accent" />
          Function Table Generator (P)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert variant="default" className="bg-muted/30">
          <Info className="h-4 w-4" />
          <AlertTitle>How to Use</AlertTitle>
          <AlertDescription>
            Enter a function using <code className="font-mono text-xs">x</code> as the variable (e.g., <code className="font-mono text-xs">x**3 - 2*x + 5</code> or <code className="font-mono text-xs">Math.cos(x)</code>).
            Define the start, end, and step values for <code className="font-mono text-xs">x</code> to generate the table.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="table-equation" className="text-sm font-medium">Function f(x) =</Label>
          <Input
            id="table-equation"
            type="text"
            value={equation}
            onChange={handleInputChange(setEquation)}
            placeholder="e.g., x**2 or Math.sin(x)"
            className="font-mono"
            aria-label="Function in terms of x"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="start-x" className="text-sm font-medium">Start X</Label>
            <Input
              id="start-x"
              type="text"
              inputMode="decimal"
              value={startXInput}
              onChange={handleInputChange(setStartXInput)}
              placeholder="0"
              aria-label="Start value for X"
            />
          </div>
          <div>
            <Label htmlFor="end-x" className="text-sm font-medium">End X</Label>
            <Input
              id="end-x"
              type="text"
              inputMode="decimal"
              value={endXInput}
              onChange={handleInputChange(setEndXInput)}
              placeholder="10"
              aria-label="End value for X"
            />
          </div>
          <div>
            <Label htmlFor="step-x" className="text-sm font-medium">Step</Label>
            <Input
              id="step-x"
              type="text"
              inputMode="decimal"
              value={stepInput}
              onChange={handleInputChange(setStepInput)}
              placeholder="1"
              aria-label="Step value for X"
            />
          </div>
        </div>
        
        <Button onClick={handleGenerateTable} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sigma className="mr-2 h-5 w-5" />
              Generate Table
            </>
          )}
        </Button>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Input Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {tableData && tableData.length > 0 && !error && (
          <div className="mt-6 space-y-2">
            <h3 className="text-lg font-semibold text-center">Table for y = {equation}</h3>
            <ScrollArea className="h-72 w-full border rounded-md shadow-sm">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead className="w-[50%] text-center font-semibold">X</TableHead>
                    <TableHead className="w-[50%] text-center font-semibold">f(X)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((point, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-center font-mono">{point.x}</TableCell>
                      <TableCell className={`text-center font-mono ${point.fx === 'Error' || point.fx === 'N/A' ? 'text-destructive' : ''}`}>
                        {point.fx}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        )}
        {tableData && tableData.length === 0 && !error && !isLoading && (
            <p className="text-center text-muted-foreground mt-4">No data points generated for the given range and step.</p>
        )}

      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={handleReset} className="w-full">
          <RotateCw className="mr-2 h-4 w-4" /> Reset Table Generator
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

export default FunctionTableGenerator;
