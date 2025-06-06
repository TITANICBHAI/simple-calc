"use client";

import { useState, type ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sigma, RefreshCw, AlertCircle, Calculator, Grid3X3 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SolutionResult {
  x: string;
  y: string;
  z?: string;
  determinant?: number;
  hasUniqueSolution: boolean;
}

export default function SystemEquationsSolver() {
  // 2x2 System state
  const [a1, setA1] = useState<string>('');
  const [b1, setB1] = useState<string>('');
  const [c1, setC1] = useState<string>('');
  const [a2, setA2] = useState<string>('');
  const [b2, setB2] = useState<string>('');
  const [c2, setC2] = useState<string>('');

  // 3x3 System state
  const [a1_3x3, setA1_3x3] = useState<string>('');
  const [b1_3x3, setB1_3x3] = useState<string>('');
  const [c1_3x3, setC1_3x3] = useState<string>('');
  const [d1_3x3, setD1_3x3] = useState<string>('');
  const [a2_3x3, setA2_3x3] = useState<string>('');
  const [b2_3x3, setB2_3x3] = useState<string>('');
  const [c2_3x3, setC2_3x3] = useState<string>('');
  const [d2_3x3, setD2_3x3] = useState<string>('');
  const [a3_3x3, setA3_3x3] = useState<string>('');
  const [b3_3x3, setB3_3x3] = useState<string>('');
  const [c3_3x3, setC3_3x3] = useState<string>('');
  const [d3_3x3, setD3_3x3] = useState<string>('');

  const [solution2x2, setSolution2x2] = useState<SolutionResult | null>(null);
  const [solution3x3, setSolution3x3] = useState<SolutionResult | null>(null);
  const [error2x2, setError2x2] = useState<string | null>(null);
  const [error3x3, setError3x3] = useState<string | null>(null);

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => 
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (/^-?\d*\.?\d*$/.test(value) || value === '' || value === '-') {
        setter(value);
      }
    };

  const formatNumber = (num: number, precision: number = 6): string => {
    if (isNaN(num)) return "Error";
    if (!isFinite(num)) return num > 0 ? "∞" : "-∞";
    
    const fixed = parseFloat(num.toFixed(precision));
    if (Math.abs(fixed) < 1e-10 && fixed !== 0) {
      return fixed.toExponential(3);
    }
    
    // Remove trailing zeros
    return fixed.toString();
  };

  const solve2x2System = () => {
    setError2x2(null);
    setSolution2x2(null);

    const pa1 = parseFloat(a1);
    const pb1 = parseFloat(b1);
    const pc1 = parseFloat(c1);
    const pa2 = parseFloat(a2);
    const pb2 = parseFloat(b2);
    const pc2 = parseFloat(c2);

    if ([pa1, pb1, pc1, pa2, pb2, pc2].some(isNaN)) {
      setError2x2("All coefficients must be valid numbers.");
      toast({ 
        title: "Input Error", 
        description: "Please enter valid numbers for all coefficients.", 
        variant: "destructive" 
      });
      return;
    }

    const detA = pa1 * pb2 - pb1 * pa2;

    if (Math.abs(detA) < 1e-12) {
      setError2x2("No unique solution exists (determinant is zero). The system may have no solutions or infinitely many solutions.");
      toast({ 
        title: "System Info", 
        description: "The system does not have a unique solution.", 
        variant: "default" 
      });
      return;
    }

    // Using Cramer's rule
    const solutionX = (pc1 * pb2 - pb1 * pc2) / detA;
    const solutionY = (pa1 * pc2 - pc1 * pa2) / detA;

    setSolution2x2({
      x: formatNumber(solutionX),
      y: formatNumber(solutionY),
      determinant: detA,
      hasUniqueSolution: true
    });

    toast({ 
      title: "2×2 System Solved!", 
      description: `x = ${formatNumber(solutionX)}, y = ${formatNumber(solutionY)}` 
    });
  };

  const determinant3x3 = (mat: number[][]): number => {
    return (
      mat[0][0] * (mat[1][1] * mat[2][2] - mat[1][2] * mat[2][1]) -
      mat[0][1] * (mat[1][0] * mat[2][2] - mat[1][2] * mat[2][0]) +
      mat[0][2] * (mat[1][0] * mat[2][1] - mat[1][1] * mat[2][0])
    );
  };

  const solve3x3System = () => {
    setError3x3(null);
    setSolution3x3(null);

    const coefficients = [
      parseFloat(a1_3x3), parseFloat(b1_3x3), parseFloat(c1_3x3), parseFloat(d1_3x3),
      parseFloat(a2_3x3), parseFloat(b2_3x3), parseFloat(c2_3x3), parseFloat(d2_3x3),
      parseFloat(a3_3x3), parseFloat(b3_3x3), parseFloat(c3_3x3), parseFloat(d3_3x3)
    ];

    if (coefficients.some(isNaN)) {
      setError3x3("All coefficients must be valid numbers.");
      toast({ 
        title: "Input Error", 
        description: "Please enter valid numbers for all coefficients.", 
        variant: "destructive" 
      });
      return;
    }

    const [pa1, pb1, pc1, pd1, pa2, pb2, pc2, pd2, pa3, pb3, pc3, pd3] = coefficients;

    const matrixA = [
      [pa1, pb1, pc1],
      [pa2, pb2, pc2],
      [pa3, pb3, pc3]
    ];

    const detA = determinant3x3(matrixA);

    if (Math.abs(detA) < 1e-12) {
      setError3x3("No unique solution exists (determinant is zero). The system may have no solutions or infinitely many solutions.");
      toast({ 
        title: "System Info", 
        description: "The system does not have a unique solution.", 
        variant: "default" 
      });
      return;
    }

    // Using Cramer's rule for 3x3
    const matrixX = [
      [pd1, pb1, pc1],
      [pd2, pb2, pc2],
      [pd3, pb3, pc3]
    ];

    const matrixY = [
      [pa1, pd1, pc1],
      [pa2, pd2, pc2],
      [pa3, pd3, pc3]
    ];

    const matrixZ = [
      [pa1, pb1, pd1],
      [pa2, pb2, pd2],
      [pa3, pb3, pd3]
    ];

    const solutionX = determinant3x3(matrixX) / detA;
    const solutionY = determinant3x3(matrixY) / detA;
    const solutionZ = determinant3x3(matrixZ) / detA;

    setSolution3x3({
      x: formatNumber(solutionX),
      y: formatNumber(solutionY),
      z: formatNumber(solutionZ),
      determinant: detA,
      hasUniqueSolution: true
    });

    toast({ 
      title: "3×3 System Solved!", 
      description: `x = ${formatNumber(solutionX)}, y = ${formatNumber(solutionY)}, z = ${formatNumber(solutionZ)}` 
    });
  };

  const reset2x2 = () => {
    setA1(''); setB1(''); setC1('');
    setA2(''); setB2(''); setC2('');
    setSolution2x2(null);
    setError2x2(null);
    toast({ title: "2×2 Solver Reset", description: "All fields cleared." });
  };

  const reset3x3 = () => {
    setA1_3x3(''); setB1_3x3(''); setC1_3x3(''); setD1_3x3('');
    setA2_3x3(''); setB2_3x3(''); setC2_3x3(''); setD2_3x3('');
    setA3_3x3(''); setB3_3x3(''); setC3_3x3(''); setD3_3x3('');
    setSolution3x3(null);
    setError3x3(null);
    toast({ title: "3×3 Solver Reset", description: "All fields cleared." });
  };

  const loadExample2x2 = () => {
    setA1('2'); setB1('3'); setC1('7');
    setA2('1'); setB2('-1'); setC2('1');
    toast({ title: "Example Loaded", description: "2x + 3y = 7, x - y = 1" });
  };

  const loadExample3x3 = () => {
    setA1_3x3('2'); setB1_3x3('1'); setC1_3x3('-1'); setD1_3x3('8');
    setA2_3x3('-3'); setB2_3x3('-1'); setC2_3x3('2'); setD2_3x3('-11');
    setA3_3x3('-2'); setB3_3x3('1'); setC3_3x3('2'); setD3_3x3('-3');
    toast({ title: "Example Loaded", description: "3×3 system example loaded" });
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Calculator className="mr-2 h-6 w-6 text-blue-500" />
          System of Linear Equations Solver
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Solve systems of 2×2 and 3×3 linear equations using Cramer's rule
        </p>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="2x2" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="2x2" className="flex items-center gap-2">
              <Sigma className="h-4 w-4" />
              2×2 System
            </TabsTrigger>
            <TabsTrigger value="3x3" className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              3×3 System
            </TabsTrigger>
          </TabsList>

          <TabsContent value="2x2" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">2×2 Linear System</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <div>a₁x + b₁y = c₁</div>
                  <div>a₂x + b₂y = c₂</div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 items-center">
                <div className="space-y-2">
                  <Label htmlFor="a1">a₁</Label>
                  <Input
                    id="a1"
                    value={a1}
                    onChange={handleInputChange(setA1)}
                    placeholder="2"
                    className="text-center"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="b1">b₁</Label>
                  <Input
                    id="b1"
                    value={b1}
                    onChange={handleInputChange(setB1)}
                    placeholder="3"
                    className="text-center"
                  />
                </div>
                <div className="text-center font-mono text-lg">=</div>
                <div className="space-y-2">
                  <Label htmlFor="c1">c₁</Label>
                  <Input
                    id="c1"
                    value={c1}
                    onChange={handleInputChange(setC1)}
                    placeholder="7"
                    className="text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 items-center">
                <div className="space-y-2">
                  <Label htmlFor="a2">a₂</Label>
                  <Input
                    id="a2"
                    value={a2}
                    onChange={handleInputChange(setA2)}
                    placeholder="1"
                    className="text-center"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="b2">b₂</Label>
                  <Input
                    id="b2"
                    value={b2}
                    onChange={handleInputChange(setB2)}
                    placeholder="-1"
                    className="text-center"
                  />
                </div>
                <div className="text-center font-mono text-lg">=</div>
                <div className="space-y-2">
                  <Label htmlFor="c2">c₂</Label>
                  <Input
                    id="c2"
                    value={c2}
                    onChange={handleInputChange(setC2)}
                    placeholder="1"
                    className="text-center"
                  />
                </div>
              </div>

              {error2x2 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error2x2}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button onClick={solve2x2System} className="flex-1">
                  <Calculator className="mr-2 h-4 w-4" />
                  Solve 2×2 System
                </Button>
                <Button onClick={loadExample2x2} variant="outline">
                  Example
                </Button>
                <Button onClick={reset2x2} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>

              {solution2x2 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3 text-green-800">Solution:</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-white rounded border">
                      <div className="text-sm text-gray-600">x =</div>
                      <div className="text-xl font-bold text-green-700">{solution2x2.x}</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded border">
                      <div className="text-sm text-gray-600">y =</div>
                      <div className="text-xl font-bold text-green-700">{solution2x2.y}</div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-600 text-center">
                    Determinant: {formatNumber(solution2x2.determinant || 0)}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="3x3" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">3×3 Linear System</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <div>a₁x + b₁y + c₁z = d₁</div>
                  <div>a₂x + b₂y + c₂z = d₂</div>
                  <div>a₃x + b₃y + c₃z = d₃</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-5 gap-2 items-center text-sm">
                  <div className="space-y-2">
                    <Label>a₁</Label>
                    <Input
                      value={a1_3x3}
                      onChange={handleInputChange(setA1_3x3)}
                      placeholder="2"
                      className="text-center text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>b₁</Label>
                    <Input
                      value={b1_3x3}
                      onChange={handleInputChange(setB1_3x3)}
                      placeholder="1"
                      className="text-center text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>c₁</Label>
                    <Input
                      value={c1_3x3}
                      onChange={handleInputChange(setC1_3x3)}
                      placeholder="-1"
                      className="text-center text-sm"
                    />
                  </div>
                  <div className="text-center font-mono">=</div>
                  <div className="space-y-2">
                    <Label>d₁</Label>
                    <Input
                      value={d1_3x3}
                      onChange={handleInputChange(setD1_3x3)}
                      placeholder="8"
                      className="text-center text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2 items-center text-sm">
                  <div className="space-y-2">
                    <Label>a₂</Label>
                    <Input
                      value={a2_3x3}
                      onChange={handleInputChange(setA2_3x3)}
                      placeholder="-3"
                      className="text-center text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>b₂</Label>
                    <Input
                      value={b2_3x3}
                      onChange={handleInputChange(setB2_3x3)}
                      placeholder="-1"
                      className="text-center text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>c₂</Label>
                    <Input
                      value={c2_3x3}
                      onChange={handleInputChange(setC2_3x3)}
                      placeholder="2"
                      className="text-center text-sm"
                    />
                  </div>
                  <div className="text-center font-mono">=</div>
                  <div className="space-y-2">
                    <Label>d₂</Label>
                    <Input
                      value={d2_3x3}
                      onChange={handleInputChange(setD2_3x3)}
                      placeholder="-11"
                      className="text-center text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2 items-center text-sm">
                  <div className="space-y-2">
                    <Label>a₃</Label>
                    <Input
                      value={a3_3x3}
                      onChange={handleInputChange(setA3_3x3)}
                      placeholder="-2"
                      className="text-center text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>b₃</Label>
                    <Input
                      value={b3_3x3}
                      onChange={handleInputChange(setB3_3x3)}
                      placeholder="1"
                      className="text-center text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>c₃</Label>
                    <Input
                      value={c3_3x3}
                      onChange={handleInputChange(setC3_3x3)}
                      placeholder="2"
                      className="text-center text-sm"
                    />
                  </div>
                  <div className="text-center font-mono">=</div>
                  <div className="space-y-2">
                    <Label>d₃</Label>
                    <Input
                      value={d3_3x3}
                      onChange={handleInputChange(setD3_3x3)}
                      placeholder="-3"
                      className="text-center text-sm"
                    />
                  </div>
                </div>
              </div>

              {error3x3 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error3x3}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button onClick={solve3x3System} className="flex-1">
                  <Calculator className="mr-2 h-4 w-4" />
                  Solve 3×3 System
                </Button>
                <Button onClick={loadExample3x3} variant="outline">
                  Example
                </Button>
                <Button onClick={reset3x3} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>

              {solution3x3 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3 text-green-800">Solution:</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-white rounded border">
                      <div className="text-sm text-gray-600">x =</div>
                      <div className="text-xl font-bold text-green-700">{solution3x3.x}</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded border">
                      <div className="text-sm text-gray-600">y =</div>
                      <div className="text-xl font-bold text-green-700">{solution3x3.y}</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded border">
                      <div className="text-sm text-gray-600">z =</div>
                      <div className="text-xl font-bold text-green-700">{solution3x3.z}</div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-600 text-center">
                    Determinant: {formatNumber(solution3x3.determinant || 0)}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}