"use client";

import { useState, type ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ListFilter, RefreshCw, AlertCircleIcon } from 'lucide-react'; 
import { useToast } from '@/hooks/use-toast';

const SystemOfLinearEquationsSolver3x3: React.FC = () => {
  const [a1, setA1] = useState<string>(''); const [b1, setB1] = useState<string>(''); const [c1, setC1] = useState<string>(''); const [d1, setD1] = useState<string>('');
  const [a2, setA2] = useState<string>(''); const [b2, setB2] = useState<string>(''); const [c2, setC2] = useState<string>(''); const [d2, setD2] = useState<string>('');
  const [a3, setA3] = useState<string>(''); const [b3, setB3] = useState<string>(''); const [c3, setC3] = useState<string>(''); const [d3, setD3] = useState<string>('');

  const [xSol, setXSol] = useState<string | null>(null);
  const [ySol, setYSol] = useState<string | null>(null);
  const [zSol, setZSol] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^-?\d*\.?\d*$/.test(value) || value === '' || value === '-') {
      setter(value);
      setError(null);
      setXSol(null); setYSol(null); setZSol(null);
    }
  };

  const formatNumber = (num: number, precision: number = 5): string => {
    if (isNaN(num)) return "Error";
    if (!isFinite(num)) return num > 0 ? "Infinity" : "-Infinity";
    const fixed = parseFloat(num.toFixed(precision));
    if (Math.abs(fixed) < 1e-7 && fixed !== 0) {
      return fixed.toExponential(2);
    }
    return String(fixed);
  };

  const determinant3x3 = (mat: number[][]): number => {
    return (
      mat[0][0] * (mat[1][1] * mat[2][2] - mat[1][2] * mat[2][1]) -
      mat[0][1] * (mat[1][0] * mat[2][2] - mat[1][2] * mat[2][0]) +
      mat[0][2] * (mat[1][0] * mat[2][1] - mat[1][1] * mat[2][0])
    );
  };
  
  const inverse3x3 = (mat: number[][]): number[][] | null => {
    const det = determinant3x3(mat);
    if (Math.abs(det) < 1e-9) { 
      setError("No unique solution exists (determinant is zero). The system may have no solutions or infinitely many solutions.");
      return null;
    }

    const invDet = 1 / det;
    const result: number[][] = Array(3).fill(null).map(() => Array(3).fill(0));

    result[0][0] = (mat[1][1] * mat[2][2] - mat[1][2] * mat[2][1]) * invDet;
    result[0][1] = (mat[0][2] * mat[2][1] - mat[0][1] * mat[2][2]) * invDet;
    result[0][2] = (mat[0][1] * mat[1][2] - mat[0][2] * mat[1][1]) * invDet;
    result[1][0] = (mat[1][2] * mat[2][0] - mat[1][0] * mat[2][2]) * invDet;
    result[1][1] = (mat[0][0] * mat[2][2] - mat[0][2] * mat[2][0]) * invDet;
    result[1][2] = (mat[0][2] * mat[1][0] - mat[0][0] * mat[1][2]) * invDet;
    result[2][0] = (mat[1][0] * mat[2][1] - mat[1][1] * mat[2][0]) * invDet;
    result[2][1] = (mat[0][1] * mat[2][0] - mat[0][0] * mat[2][1]) * invDet;
    result[2][2] = (mat[0][0] * mat[1][1] - mat[0][1] * mat[1][0]) * invDet;

    return result;
  };

  const multiplyMatrixVector3x1 = (matrix: number[][], vector: number[]): number[] => {
    const result: number[] = [0, 0, 0];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        result[i] += matrix[i][j] * vector[j];
      }
    }
    return result;
  };


  const handleSolveSystem = () => {
    setError(null);
    setXSol(null); setYSol(null); setZSol(null);

    const coeffs = [a1, b1, c1, d1, a2, b2, c2, d2, a3, b3, c3, d3].map(s => parseFloat(s));
    if (coeffs.some(isNaN)) {
      setError("All coefficients and constants must be valid numbers.");
      toast({ title: "Input Error", description: "Please enter valid numbers for all fields.", variant: "destructive" });
      return;
    }

    const A = [
      [coeffs[0], coeffs[1], coeffs[2]],
      [coeffs[4], coeffs[5], coeffs[6]],
      [coeffs[8], coeffs[9], coeffs[10]],
    ];
    const D = [coeffs[3], coeffs[7], coeffs[11]];

    const A_inv = inverse3x3(A); 
    if (!A_inv) {
      if(!error) setError("No unique solution exists (determinant is zero). The system may have no solutions or infinitely many solutions.");
      toast({ title: "Solver Info", description: error || "The system does not have a unique solution.", variant: "default" });
      return;
    }

    const [solX, solY, solZ] = multiplyMatrixVector3x1(A_inv, D);

    setXSol(formatNumber(solX));
    setYSol(formatNumber(solY));
    setZSol(formatNumber(solZ));
    toast({ title: "3x3 System Solved!", description: `x=${formatNumber(solX)}, y=${formatNumber(solY)}, z=${formatNumber(solZ)}` });
  };

  const handleReset = () => {
    setA1(''); setB1(''); setC1(''); setD1('');
    setA2(''); setB2(''); setC2(''); setD2('');
    setA3(''); setB3(''); setC3(''); setD3('');
    setXSol(null); setYSol(null); setZSol(null);
    setError(null);
    toast({ title: "3x3 Solver Reset", description: "All fields cleared." });
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <ListFilter className="mr-2 h-6 w-6 text-accent" />
          3x3 System of Linear Equations Solver (P)
        </CardTitle>
        <p className="text-sm text-muted-foreground">Solves for x, y, and z:</p>
        <div className="text-xs font-mono text-muted-foreground mt-1 space-y-0.5">
            <p>a₁x + b₁y + c₁z = d₁</p>
            <p>a₂x + b₂y + c₂z = d₂</p>
            <p>a₃x + b₃y + c₃z = d₃</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Equation 1 Inputs */}
        <div className="space-y-1">
          <Label className="text-xs font-medium">Equation 1 (a₁x + b₁y + c₁z = d₁)</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-center">
            <Input value={a1} onChange={handleInputChange(setA1)} placeholder="a₁" className="font-mono text-center" aria-label="Coefficient a1" tabIndex={0}/>
            <Input value={b1} onChange={handleInputChange(setB1)} placeholder="b₁" className="font-mono text-center" aria-label="Coefficient b1" tabIndex={0}/>
            <Input value={c1} onChange={handleInputChange(setC1)} placeholder="c₁" className="font-mono text-center" aria-label="Coefficient c1" tabIndex={0}/>
            <Input value={d1} onChange={handleInputChange(setD1)} placeholder="d₁" className="font-mono text-center" aria-label="Constant d1" tabIndex={0}/>
          </div>
        </div>

        {/* Equation 2 Inputs */}
         <div className="space-y-1">
          <Label className="text-xs font-medium">Equation 2 (a₂x + b₂y + c₂z = d₂)</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-center">
            <Input value={a2} onChange={handleInputChange(setA2)} placeholder="a₂" className="font-mono text-center" aria-label="Coefficient a2" tabIndex={0}/>
            <Input value={b2} onChange={handleInputChange(setB2)} placeholder="b₂" className="font-mono text-center" aria-label="Coefficient b2" tabIndex={0}/>
            <Input value={c2} onChange={handleInputChange(setC2)} placeholder="c₂" className="font-mono text-center" aria-label="Coefficient c2" tabIndex={0}/>
            <Input value={d2} onChange={handleInputChange(setD2)} placeholder="d₂" className="font-mono text-center" aria-label="Constant d2" tabIndex={0}/>
          </div>
        </div>

        {/* Equation 3 Inputs */}
        <div className="space-y-1">
          <Label className="text-xs font-medium">Equation 3 (a₃x + b₃y + c₃z = d₃)</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-center">
            <Input value={a3} onChange={handleInputChange(setA3)} placeholder="a₃" className="font-mono text-center" aria-label="Coefficient a3" tabIndex={0}/>
            <Input value={b3} onChange={handleInputChange(setB3)} placeholder="b₃" className="font-mono text-center" aria-label="Coefficient b3" tabIndex={0}/>
            <Input value={c3} onChange={handleInputChange(setC3)} placeholder="c₃" className="font-mono text-center" aria-label="Coefficient c3" tabIndex={0}/>
            <Input value={d3} onChange={handleInputChange(setD3)} placeholder="d₃" className="font-mono text-center" aria-label="Constant d3" tabIndex={0}/>
          </div>
        </div>
        
        <Button onClick={handleSolveSystem} className="w-full mt-6" tabIndex={0}>
          Solve 3x3 System
        </Button>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {(xSol !== null || ySol !== null || zSol !== null) && !error && (
          <div className="space-y-2 pt-4 border-t mt-4">
            <h3 className="text-md font-semibold text-center text-muted-foreground">Solution:</h3>
            {xSol !== null && <p className="text-center font-mono text-lg text-accent">x = {xSol}</p>}
            {ySol !== null && <p className="text-center font-mono text-lg text-accent">y = {ySol}</p>}
            {zSol !== null && <p className="text-center font-mono text-lg text-accent">z = {zSol}</p>}
          </div>
        )}
         <p className="text-xs text-muted-foreground text-center pt-2">
            Enter coefficients and constants. The solver uses the matrix inverse method for 3x3 systems.
          </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={handleReset} className="w-full" tabIndex={0}>
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

export default SystemOfLinearEquationsSolver3x3;
