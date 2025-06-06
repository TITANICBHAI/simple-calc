"use client";

import { useState, type ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sigma, RefreshCw, AlertCircleIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Renamed to reflect it's for 2x2 systems.
// The component itself is now specific to 2x2.
// A new component will be created for 3x3.
const SystemOfLinearEquationsSolver2x2: React.FC = () => {
  // Coefficients for equation 1: a1x + b1y = c1
  const [a1, setA1] = useState<string>('');
  const [b1, setB1] = useState<string>('');
  const [c1, setC1] = useState<string>('');

  // Coefficients for equation 2: a2x + b2y = c2
  const [a2, setA2] = useState<string>('');
  const [b2, setB2] = useState<string>('');
  const [c2, setC2] = useState<string>('');

  const [xSol, setXSol] = useState<string | null>(null);
  const [ySol, setYSol] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^-?\d*\.?\d*$/.test(value) || value === '' || value === '-') {
      setter(value);
      setError(null);
      setXSol(null);
      setYSol(null);
    }
  };

  const formatNumber = (num: number, precision: number = 5): string => {
    const fixed = parseFloat(num.toFixed(precision));
    if (Math.abs(fixed) < 1e-7 && fixed !== 0) {
      return fixed.toExponential(2);
    }
    return String(fixed);
  };

  const handleSolveSystem = () => {
    setError(null);
    setXSol(null);
    setYSol(null);

    const pa1 = parseFloat(a1); const pb1 = parseFloat(b1); const pc1 = parseFloat(c1);
    const pa2 = parseFloat(a2); const pb2 = parseFloat(b2); const pc2 = parseFloat(c2);

    if (isNaN(pa1) || isNaN(pb1) || isNaN(pc1) || isNaN(pa2) || isNaN(pb2) || isNaN(pc2)) {
      setError("All coefficients (a1, b1, c1, a2, b2, c2) must be valid numbers.");
      toast({ title: "Input Error", description: "Please enter valid numbers for all coefficients.", variant: "destructive" });
      return;
    }

    // Coefficient matrix A
    const matrixA = [
      [pa1, pb1],
      [pa2, pb2],
    ];

    // Constant vector B (as a column matrix)
    const matrixB = [
      [pc1],
      [pc2],
    ];

    // Calculate determinant of A
    const detA = matrixA[0][0] * matrixA[1][1] - matrixA[0][1] * matrixA[1][0];

    if (Math.abs(detA) < 1e-9) { 
      setError("No unique solution exists (determinant is zero). The system may have no solutions or infinitely many solutions.");
      toast({ title: "Solver Info", description: "The system does not have a unique solution.", variant: "default" });
      return;
    }

    // Calculate inverse of A
    const invDetA = 1 / detA;
    const inverseA = [
      [matrixA[1][1] * invDetA, -matrixA[0][1] * invDetA],
      [-matrixA[1][0] * invDetA, matrixA[0][0] * invDetA],
    ];

    // Calculate solution X = A_inverse * B
    const solutionX = inverseA[0][0] * matrixB[0][0] + inverseA[0][1] * matrixB[1][0];
    const solutionY = inverseA[1][0] * matrixB[0][0] + inverseA[1][1] * matrixB[1][0];

    setXSol(formatNumber(solutionX));
    setYSol(formatNumber(solutionY));
    toast({ title: "2x2 System Solved!", description: `x = ${formatNumber(solutionX)}, y = ${formatNumber(solutionY)}` });
  };

  const handleReset = () => {
    setA1(''); setB1(''); setC1('');
    setA2(''); setB2(''); setC2('');
    setXSol(null); setYSol(null);
    setError(null);
    toast({ title: "2x2 Solver Reset", description: "All fields cleared." });
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Sigma className="mr-2 h-6 w-6 text-accent" />
          2x2 System of Linear Equations Solver (P)
        </CardTitle>
        <p className="text-sm text-muted-foreground">Solves: a₁x + b₁y = c₁  AND  a₂x + b₂y = c₂</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Equation 1: a₁x + b₁y = c₁</Label>
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <Input value={a1} onChange={handleInputChange(setA1)} placeholder="a₁" className="flex-1 font-mono text-center" aria-label="Coefficient a1"/> <span className="font-mono text-foreground">x +</span>
            <Input value={b1} onChange={handleInputChange(setB1)} placeholder="b₁" className="flex-1 font-mono text-center" aria-label="Coefficient b1"/> <span className="font-mono text-foreground">y =</span>
            <Input value={c1} onChange={handleInputChange(setC1)} placeholder="c₁" className="flex-1 font-mono text-center" aria-label="Constant c1"/>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Equation 2: a₂x + b₂y = c₂</Label>
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <Input value={a2} onChange={handleInputChange(setA2)} placeholder="a₂" className="flex-1 font-mono text-center" aria-label="Coefficient a2"/> <span className="font-mono text-foreground">x +</span>
            <Input value={b2} onChange={handleInputChange(setB2)} placeholder="b₂" className="flex-1 font-mono text-center" aria-label="Coefficient b2"/> <span className="font-mono text-foreground">y =</span>
            <Input value={c2} onChange={handleInputChange(setC2)} placeholder="c₂" className="flex-1 font-mono text-center" aria-label="Constant c2"/>
          </div>
        </div>
        
        <Button onClick={handleSolveSystem} className="w-full">
          Solve System
        </Button>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {(xSol !== null || ySol !== null) && !error && (
          <div className="space-y-3 pt-4 border-t mt-4">
            <h3 className="text-md font-semibold text-center text-muted-foreground">Solution:</h3>
            {xSol !== null && (
              <p className="text-center font-mono text-lg text-accent">
                x = {xSol}
              </p>
            )}
            {ySol !== null && (
              <p className="text-center font-mono text-lg text-accent">
                y = {ySol}
              </p>
            )}
          </div>
        )}
         <p className="text-xs text-muted-foreground text-center pt-2">
            Enter the coefficients for the two linear equations. The solver uses the matrix inverse method.
          </p>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="outline" onClick={handleReset} className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" /> Reset Solver
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

export default SystemOfLinearEquationsSolver2x2;

