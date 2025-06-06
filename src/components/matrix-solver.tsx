"use client";

import { useState, type ChangeEvent, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calculator as CalculatorIcon, RefreshCw, AlertCircleIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MAX_DIM = 5; // Max rows/cols for matrices

type MatrixOperation = 'ADD' | 'SUBTRACT' | 'MULTIPLY' | 'DETERMINANT_A' | 'INVERSE_A' | 'TRANSPOSE_A' | 'SCALAR_MULTIPLY_A';

const MatrixSolver: React.FC = () => {
  const [rowsA, setRowsA] = useState<number>(2);
  const [colsA, setColsA] = useState<number>(2);
  const [matrixA, setMatrixA] = useState<string[][]>(Array(2).fill(null).map(() => Array(2).fill('0')));

  const [rowsB, setRowsB] = useState<number>(2);
  const [colsB, setColsB] = useState<number>(2);
  const [matrixB, setMatrixB] = useState<string[][]>(Array(2).fill(null).map(() => Array(2).fill('0')));

  const [scalarValue, setScalarValue] = useState<string>('1');
  const [operation, setOperation] = useState<MatrixOperation>('ADD');
  const [resultMatrix, setResultMatrix] = useState<string[][] | null>(null);
  const [resultScalar, setResultScalar] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const createMatrix = (r: number, c: number, fill: string = '0'): string[][] => {
    return Array(r).fill(null).map(() => Array(c).fill(fill));
  };

  useEffect(() => {
    setMatrixA(createMatrix(rowsA, colsA));
    setError(null); setResultMatrix(null); setResultScalar(null);
  }, [rowsA, colsA]);

  useEffect(() => {
    setMatrixB(createMatrix(rowsB, colsB));
    setError(null); setResultMatrix(null); setResultScalar(null);
  }, [rowsB, colsB]);

  const handleDimensionChange = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<number>>,
  ) => {
    let num = parseInt(value, 10);
    if (isNaN(num)) num = 1;
    if (num < 1) num = 1;
    if (num > MAX_DIM) num = MAX_DIM;
    setter(num);
    setResultMatrix(null);
    setResultScalar(null);
    setError(null);
  };

  const handleCellChange = (
    e: ChangeEvent<HTMLInputElement>,
    r: number,
    c: number,
    matrixSetter: React.Dispatch<React.SetStateAction<string[][]>>,
    currentMatrix: string[][]
  ) => {
    const newValue = e.target.value;
    if (/^-?\d*\.?\d*$/.test(newValue) || newValue === '' || newValue === '-') {
      const newMatrix = currentMatrix.map((row, rowIndex) =>
        row.map((cell, colIndex) => (rowIndex === r && colIndex === c ? newValue : cell))
      );
      matrixSetter(newMatrix);
      setResultMatrix(null);
      setResultScalar(null);
      setError(null);
    }
  };
  
  const handleScalarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (/^-?\d*\.?\d*$/.test(newValue) || newValue === '' || newValue === '-') {
        setScalarValue(newValue);
        setError(null);
    }
  };

  const renderMatrixDisplay = (
    matrix: string[][],
    matrixLabel: string,
    isEditable: boolean = false,
    matrixSetter?: React.Dispatch<React.SetStateAction<string[][]>>
  ) => {
    const rCount = matrix.length;
    const cCount = matrix[0]?.length || 0;
    if (rCount === 0 || cCount === 0) return <p className="text-sm text-muted-foreground">Matrix not defined.</p>;

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">{matrixLabel} ({rCount}x{cCount})</h4>
        <div
          className="grid gap-1 border p-2 rounded-md bg-muted/20 overflow-x-auto"
          style={{ gridTemplateColumns: `repeat(${cCount}, minmax(50px, 1fr))` }}
        >
          {matrix.map((row, r) =>
            row.map((cell, c) => (
              <Input
                key={`${matrixLabel}-${r}-${c}`}
                type="text"
                inputMode={isEditable ? "decimal" : "none"}
                value={cell}
                readOnly={!isEditable}
                onChange={isEditable && matrixSetter ? (e) => handleCellChange(e, r, c, matrixSetter, matrix) : undefined}
                className="h-9 text-center font-mono text-sm"
                aria-label={`Matrix ${matrixLabel} row ${r + 1} column ${c + 1}`}
              />
            ))
          )}
        </div>
      </div>
    );
  };

  const parseMatrix = (matrix: string[][]): number[][] => {
    return matrix.map(row =>
      row.map(cell => {
        const num = parseFloat(cell);
        if (isNaN(num)) throw new Error(`Invalid number: "${cell}"`);
        return num;
      })
    );
  };

  const formatMatrix = (matrix: number[][]): string[][] => {
    return matrix.map(row =>
      row.map(cell => cell.toString())
    );
  };

  const addMatrices = (a: number[][], b: number[][]): number[][] => {
    if (a.length !== b.length || a[0].length !== b[0].length) {
      throw new Error("Matrices must have the same dimensions for addition");
    }
    return a.map((row, i) => row.map((cell, j) => cell + b[i][j]));
  };

  const subtractMatrices = (a: number[][], b: number[][]): number[][] => {
    if (a.length !== b.length || a[0].length !== b[0].length) {
      throw new Error("Matrices must have the same dimensions for subtraction");
    }
    return a.map((row, i) => row.map((cell, j) => cell - b[i][j]));
  };

  const multiplyMatrices = (a: number[][], b: number[][]): number[][] => {
    if (a[0].length !== b.length) {
      throw new Error("Number of columns in first matrix must equal number of rows in second matrix");
    }
    const result: number[][] = [];
    for (let i = 0; i < a.length; i++) {
      result[i] = [];
      for (let j = 0; j < b[0].length; j++) {
        let sum = 0;
        for (let k = 0; k < a[0].length; k++) {
          sum += a[i][k] * b[k][j];
        }
        result[i][j] = sum;
      }
    }
    return result;
  };

  const scalarMultiply = (matrix: number[][], scalar: number): number[][] => {
    return matrix.map(row => row.map(cell => cell * scalar));
  };

  const transpose = (matrix: number[][]): number[][] => {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
  };

  const determinant = (matrix: number[][]): number => {
    const n = matrix.length;
    if (n !== matrix[0].length) throw new Error("Matrix must be square for determinant calculation");

    if (n === 1) return matrix[0][0];
    if (n === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    
    // For larger matrices, use cofactor expansion
    let det = 0;
    for (let j = 0; j < n; j++) {
      const minor = matrix.slice(1).map(row => row.filter((_, colIndex) => colIndex !== j));
      det += Math.pow(-1, j) * matrix[0][j] * determinant(minor);
    }
    return det;
  };

  const inverse = (matrix: number[][]): number[][] => {
    const n = matrix.length;
    if (n !== matrix[0].length) throw new Error("Matrix must be square for inverse calculation");
    
    const det = determinant(matrix);
    if (Math.abs(det) < 1e-10) throw new Error("Matrix is singular (determinant is zero)");

    if (n === 1) return [[1 / matrix[0][0]]];
    
    if (n === 2) {
      const invDet = 1 / det;
      return [
        [matrix[1][1] * invDet, -matrix[0][1] * invDet],
        [-matrix[1][0] * invDet, matrix[0][0] * invDet]
      ];
    }

    // For larger matrices, use adjugate matrix method
    const adjugate: number[][] = [];
    for (let i = 0; i < n; i++) {
      adjugate[i] = [];
      for (let j = 0; j < n; j++) {
        const minor = matrix
          .filter((_, rowIndex) => rowIndex !== i)
          .map(row => row.filter((_, colIndex) => colIndex !== j));
        adjugate[i][j] = Math.pow(-1, i + j) * determinant(minor);
      }
    }

    // Transpose adjugate and divide by determinant
    const transposeAdjugate = transpose(adjugate);
    return scalarMultiply(transposeAdjugate, 1 / det);
  };

  const handleCalculate = () => {
    setError(null);
    setResultMatrix(null);
    setResultScalar(null);

    try {
      let numA: number[][], numB: number[][];
      
      try {
        numA = parseMatrix(matrixA);
        if (['ADD', 'SUBTRACT', 'MULTIPLY'].includes(operation)) {
          numB = parseMatrix(matrixB);
        }
      } catch (parseError: any) {
        setError(parseError.message);
        toast({ title: "Input Error", description: parseError.message, variant: "destructive" });
        return;
      }

      let result: number[][] | number;

      switch (operation) {
        case 'ADD':
          result = addMatrices(numA, numB!);
          setResultMatrix(formatMatrix(result));
          break;
        case 'SUBTRACT':
          result = subtractMatrices(numA, numB!);
          setResultMatrix(formatMatrix(result));
          break;
        case 'MULTIPLY':
          result = multiplyMatrices(numA, numB!);
          setResultMatrix(formatMatrix(result));
          break;
        case 'SCALAR_MULTIPLY_A':
          const scalar = parseFloat(scalarValue);
          if (isNaN(scalar)) {
            setError("Invalid scalar value");
            return;
          }
          result = scalarMultiply(numA, scalar);
          setResultMatrix(formatMatrix(result));
          break;
        case 'TRANSPOSE_A':
          result = transpose(numA);
          setResultMatrix(formatMatrix(result));
          break;
        case 'DETERMINANT_A':
          result = determinant(numA);
          setResultScalar(result.toString());
          break;
        case 'INVERSE_A':
          result = inverse(numA);
          setResultMatrix(formatMatrix(result));
          break;
        default:
          setError("Unknown operation");
          return;
      }

      toast({ title: "Calculation Complete", description: "Matrix operation performed successfully." });

    } catch (calcError: any) {
      setError(calcError.message);
      toast({ title: "Calculation Error", description: calcError.message, variant: "destructive" });
    }
  };

  const handleReset = () => {
    setMatrixA(createMatrix(rowsA, colsA));
    setMatrixB(createMatrix(rowsB, colsB));
    setScalarValue('1');
    setResultMatrix(null);
    setResultScalar(null);
    setError(null);
    toast({ title: "Matrix Solver Reset", description: "All matrices reset to default values." });
  };

  const needsMatrixB = ['ADD', 'SUBTRACT', 'MULTIPLY'].includes(operation);
  const needsScalar = operation === 'SCALAR_MULTIPLY_A';

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <CalculatorIcon className="mr-2 h-6 w-6 text-accent" />
          Matrix Calculator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Perform matrix operations including addition, multiplication, determinant, and inverse.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="operation-select">Matrix Operation</Label>
            <Select value={operation} onValueChange={(value: MatrixOperation) => {
              setOperation(value);
              setError(null);
              setResultMatrix(null);
              setResultScalar(null);
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADD">Add (A + B)</SelectItem>
                <SelectItem value="SUBTRACT">Subtract (A - B)</SelectItem>
                <SelectItem value="MULTIPLY">Multiply (A × B)</SelectItem>
                <SelectItem value="SCALAR_MULTIPLY_A">Scalar Multiply (k × A)</SelectItem>
                <SelectItem value="TRANSPOSE_A">Transpose (A^T)</SelectItem>
                <SelectItem value="DETERMINANT_A">Determinant (det(A))</SelectItem>
                <SelectItem value="INVERSE_A">Inverse (A^-1)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex space-x-2">
                <div>
                  <Label htmlFor="rows-a">Rows</Label>
                  <Select value={rowsA.toString()} onValueChange={(value) => handleDimensionChange(value, setRowsA)}>
                    <SelectTrigger className="w-16">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: MAX_DIM }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cols-a">Cols</Label>
                  <Select value={colsA.toString()} onValueChange={(value) => handleDimensionChange(value, setColsA)}>
                    <SelectTrigger className="w-16">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: MAX_DIM }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {renderMatrixDisplay(matrixA, "Matrix A", true, setMatrixA)}
            </div>

            {needsMatrixB && (
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <div>
                    <Label htmlFor="rows-b">Rows</Label>
                    <Select value={rowsB.toString()} onValueChange={(value) => handleDimensionChange(value, setRowsB)}>
                      <SelectTrigger className="w-16">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: MAX_DIM }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="cols-b">Cols</Label>
                    <Select value={colsB.toString()} onValueChange={(value) => handleDimensionChange(value, setColsB)}>
                      <SelectTrigger className="w-16">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: MAX_DIM }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {renderMatrixDisplay(matrixB, "Matrix B", true, setMatrixB)}
              </div>
            )}
          </div>

          {needsScalar && (
            <div className="space-y-2">
              <Label htmlFor="scalar-input">Scalar Value</Label>
              <Input
                id="scalar-input"
                type="number"
                step="any"
                value={scalarValue}
                onChange={handleScalarChange}
                className="w-32 font-mono"
                placeholder="1"
              />
            </div>
          )}

          <Button onClick={handleCalculate} className="w-full">
            Calculate
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {resultMatrix && (
            <div className="space-y-2">
              <h3 className="font-semibold">Result</h3>
              {renderMatrixDisplay(resultMatrix, "Result")}
            </div>
          )}

          {resultScalar && (
            <Alert>
              <AlertTitle>Result</AlertTitle>
              <AlertDescription className="font-mono text-lg">
                {resultScalar}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={handleReset} className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset Matrices
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MatrixSolver;