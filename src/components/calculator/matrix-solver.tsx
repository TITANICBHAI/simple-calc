"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Grid, AlertCircle, Calculator, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type MatrixOperation = 'ADD' | 'SUBTRACT' | 'MULTIPLY' | 'SCALAR_MULTIPLY_A' | 
                      'TRANSPOSE_A' | 'DETERMINANT_A' | 'INVERSE_A' | 'EIGENVECTORS' | 
                      'RANK' | 'TRACE' | 'LU_DECOMPOSITION';

interface MatrixSolverProps {}

const MatrixSolver: React.FC<MatrixSolverProps> = () => {
  const [rowsA, setRowsA] = useState<number>(2);
  const [colsA, setColsA] = useState<number>(2);
  const [rowsB, setRowsB] = useState<number>(2);
  const [colsB, setColsB] = useState<number>(2);
  const [matrixA, setMatrixA] = useState<number[][]>(Array(2).fill(Array(2).fill(0)));
  const [matrixB, setMatrixB] = useState<number[][]>(Array(2).fill(Array(2).fill(0)));
  const [scalarValue, setScalarValue] = useState<string>('1');
  const [operation, setOperation] = useState<MatrixOperation>('ADD');
  const [result, setResult] = useState<number[][] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();

  // Matrix size validation
  const validateMatrixSizes = useCallback((): boolean => {
    if (operation === 'ADD' || operation === 'SUBTRACT') {
      if (rowsA !== rowsB || colsA !== colsB) {
        setError('For addition/subtraction, matrices must have the same dimensions');
        return false;
      }
    } else if (operation === 'MULTIPLY') {
      if (colsA !== rowsB) {
        setError('For multiplication, number of columns in first matrix must equal number of rows in second matrix');
        return false;
      }
    } else if (['DETERMINANT_A', 'INVERSE_A'].includes(operation)) {
      if (rowsA !== colsA) {
        setError('Matrix must be square for determinant/inverse');
        return false;
      }
    }
    return true;
  }, [operation, rowsA, colsA, rowsB, colsB]);

  // Matrix input validation
  const validateMatrixInput = useCallback((matrix: number[][], label: string): boolean => {
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[0].length; j++) {
        if (isNaN(matrix[i][j]) || !isFinite(matrix[i][j])) {
          setError(`Invalid value in ${label} at position (${i + 1}, ${j + 1})`);
          return false;
        }
      }
    }
    return true;
  }, []);

  const handleMatrixInputChange = useCallback((
    matrixLabel: 'A' | 'B',
    row: number,
    col: number,
    value: string
  ) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    const updateMatrix = (prev: number[][]) => {
      const newMatrix = prev.map(r => [...r]);
      newMatrix[row][col] = numValue;
      return newMatrix;
    };

    if (matrixLabel === 'A') {
      setMatrixA(updateMatrix);
    } else {
      setMatrixB(updateMatrix);
    }
    setError(null);
    setResult(null);
  }, []);

  const handleCalculate = useCallback(async () => {
    setError(null);
    setResult(null);
    setIsCalculating(true);

    try {
      if (!validateMatrixSizes()) {
        setIsCalculating(false);
        return;
      }

      if (!validateMatrixInput(matrixA, 'Matrix A') || !validateMatrixInput(matrixB, 'Matrix B')) {
        setIsCalculating(false);
        return;
      }

      let calculationResult: number[][] | null = null;

      switch (operation) {
        case 'ADD':
          calculationResult = matrixA.map((row, i) => 
            row.map((val, j) => val + matrixB[i][j])
          );
          break;

        case 'SUBTRACT':
          calculationResult = matrixA.map((row, i) => 
            row.map((val, j) => val - matrixB[i][j])
          );
          break;

        case 'MULTIPLY':
          calculationResult = Array(rowsA).fill(0).map(() => Array(colsB).fill(0));
          for (let i = 0; i < rowsA; i++) {
            for (let j = 0; j < colsB; j++) {
              let sum = 0;
              for (let k = 0; k < colsA; k++) {
                sum += matrixA[i][k] * matrixB[k][j];
              }
              calculationResult[i][j] = sum;
            }
          }
          break;

        case 'SCALAR_MULTIPLY_A': {
          const scalar = parseFloat(scalarValue);
          if (isNaN(scalar) || !isFinite(scalar)) {
            throw new Error('Invalid scalar value');
          }
          calculationResult = matrixA.map(row => 
            row.map(val => val * scalar)
          );
          break;
        }

        case 'TRANSPOSE_A':
          calculationResult = Array(colsA).fill(0).map((_, i) => 
            Array(rowsA).fill(0).map((_, j) => matrixA[j][i])
          );
          break;

        // Add more operations here...

        default:
          throw new Error('Unsupported operation');
      }

      setResult(calculationResult);
      toast({
        title: "Calculation Complete",
        description: `Matrix ${operation.toLowerCase().replace(/_/g, ' ')} operation successful`,
        variant: "default"
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred during calculation';
      setError(message);
      toast({
        title: "Calculation Error",
        description: message,
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  }, [operation, matrixA, matrixB, rowsA, colsA, colsB, scalarValue, validateMatrixSizes, validateMatrixInput, toast]);

  const resizeMatrix = useCallback((
    matrixLabel: 'A' | 'B',
    newRows: number,
    newCols: number
  ) => {
    const createNewMatrix = (oldMatrix: number[][], oldRows: number, oldCols: number) => {
      return Array(newRows).fill(0).map((_, i) =>
        Array(newCols).fill(0).map((_, j) =>
          i < oldRows && j < oldCols ? oldMatrix[i][j] : 0
        )
      );
    };

    if (matrixLabel === 'A') {
      setMatrixA(prev => createNewMatrix(prev, rowsA, colsA));
      setRowsA(newRows);
      setColsA(newCols);
    } else {
      setMatrixB(prev => createNewMatrix(prev, rowsB, colsB));
      setRowsB(newRows);
      setColsB(newCols);
    }
    setError(null);
    setResult(null);
  }, [rowsA, colsA, rowsB, colsB]);

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Grid className="h-5 w-5 text-primary" />
          Matrix Calculator
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Matrix A Input */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-semibold">Matrix A</Label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="rowsA">Rows:</Label>
                <Input
                  id="rowsA"
                  type="number"
                  min="1"
                  max="10"
                  value={rowsA}
                  onChange={(e) => resizeMatrix('A', parseInt(e.target.value), colsA)}
                  className="w-20"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="colsA">Columns:</Label>
                <Input
                  id="colsA"
                  type="number"
                  min="1"
                  max="10"
                  value={colsA}
                  onChange={(e) => resizeMatrix('A', rowsA, parseInt(e.target.value))}
                  className="w-20"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            {Array(rowsA).fill(0).map((_, i) => (
              <div key={`rowA${i}`} className="flex gap-2">
                {Array(colsA).fill(0).map((_, j) => (
                  <Input
                    key={`cellA${i}${j}`}
                    type="number"
                    value={matrixA[i][j] || ''}
                    onChange={(e) => handleMatrixInputChange('A', i, j, e.target.value)}
                    className="w-20 font-mono text-center"
                    placeholder={`a${i+1}${j+1}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Operation Selection */}
        <div className="space-y-2">
          <Label>Operation</Label>
          <Select value={operation} onValueChange={(v) => setOperation(v as MatrixOperation)}>
            <SelectTrigger>
              <SelectValue placeholder="Select operation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADD">Add (A + B)</SelectItem>
              <SelectItem value="SUBTRACT">Subtract (A - B)</SelectItem>
              <SelectItem value="MULTIPLY">Multiply (A × B)</SelectItem>
              <SelectItem value="SCALAR_MULTIPLY_A">Scalar Multiply (k × A)</SelectItem>
              <SelectItem value="TRANSPOSE_A">Transpose (Matrix A)</SelectItem>
              <SelectItem value="DETERMINANT_A">Determinant (Matrix A)</SelectItem>
              <SelectItem value="INVERSE_A">Inverse (Matrix A)</SelectItem>
              <SelectItem value="EIGENVECTORS">Eigenvectors (Matrix A)</SelectItem>
              <SelectItem value="RANK">Rank (Matrix A)</SelectItem>
              <SelectItem value="TRACE">Trace (Matrix A)</SelectItem>
              <SelectItem value="LU_DECOMPOSITION">LU Decomposition (Matrix A)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Matrix B Input (conditional) */}
        {['ADD', 'SUBTRACT', 'MULTIPLY'].includes(operation) && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Matrix B</Label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="rowsB">Rows:</Label>
                  <Input
                    id="rowsB"
                    type="number"
                    min="1"
                    max="10"
                    value={rowsB}
                    onChange={(e) => resizeMatrix('B', parseInt(e.target.value), colsB)}
                    className="w-20"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="colsB">Columns:</Label>
                  <Input
                    id="colsB"
                    type="number"
                    min="1"
                    max="10"
                    value={colsB}
                    onChange={(e) => resizeMatrix('B', rowsB, parseInt(e.target.value))}
                    className="w-20"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              {Array(rowsB).fill(0).map((_, i) => (
                <div key={`rowB${i}`} className="flex gap-2">
                  {Array(colsB).fill(0).map((_, j) => (
                    <Input
                      key={`cellB${i}${j}`}
                      type="number"
                      value={matrixB[i][j] || ''}
                      onChange={(e) => handleMatrixInputChange('B', i, j, e.target.value)}
                      className="w-20 font-mono text-center"
                      placeholder={`b${i+1}${j+1}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scalar Input (conditional) */}
        {operation === 'SCALAR_MULTIPLY_A' && (
          <div className="space-y-2">
            <Label htmlFor="scalar">Scalar Value (k)</Label>
            <Input
              id="scalar"
              type="number"
              value={scalarValue}
              onChange={(e) => setScalarValue(e.target.value)}
              className="w-40 font-mono"
              placeholder="Enter scalar value"
            />
          </div>
        )}

        {/* Calculate Button */}
        <Button 
          onClick={handleCalculate} 
          className="w-full"
          disabled={isCalculating}
        >
          {isCalculating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <Calculator className="mr-2 h-4 w-4" />
              Calculate
            </>
          )}
        </Button>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Result Display */}
        {result && (
          <div className="space-y-2 pt-4 border-t">
            <Label className="text-lg font-semibold">Result</Label>
            <div className={cn(
              "grid gap-2 p-4 bg-muted/30 rounded-md",
              "overflow-x-auto"
            )}>
              {result.map((row, i) => (
                <div key={`resultRow${i}`} className="flex gap-2">
                  {row.map((val, j) => (
                    <div
                      key={`resultCell${i}${j}`}
                      className="w-20 h-10 flex items-center justify-center font-mono bg-background/50 rounded border"
                    >
                      {val.toFixed(4)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MatrixSolver;

