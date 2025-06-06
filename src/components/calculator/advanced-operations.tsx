"use client";

import React, { useState, type FC } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { KatexDisplay } from '@/components/ui/katex-display';
import { Matrix } from '@/lib/math-parser/advancedMath';

type Operation = 'matrix' | 'complex' | 'calculus' | 'polynomial';

interface AdvancedOperationsProps {
  onResult: (result: string) => void;
  onError: (error: string) => void;
}

export const AdvancedOperations: FC<AdvancedOperationsProps> = ({
  onResult,
  onError
}) => {
  const [operation, setOperation] = useState<Operation>('matrix');
  const [matrixSize, setMatrixSize] = useState<number>(2);
  const [matrixA, setMatrixA] = useState<string[][]>([['0', '0'], ['0', '0']]);
  const [matrixB, setMatrixB] = useState<string[][]>([['0', '0'], ['0', '0']]);
  const [matrixOperation, setMatrixOperation] = useState<'multiply' | 'add' | 'determinant'>('multiply');

  const handleMatrixOperation = () => {
    try {
      const numericA = matrixA.map(row => row.map(val => parseFloat(val) || 0));
      const numericB = matrixB.map(row => row.map(val => parseFloat(val) || 0));
      const mA = new Matrix(numericA);
      const mB = new Matrix(numericB);

      let result: Matrix | number;
      switch (matrixOperation) {
        case 'multiply':
          result = mA.multiply(mB);
          break;
        case 'add':
          result = mA.add(mB);
          break;
        case 'determinant':
          result = mA.determinant();
          break;
      }

      onResult(result.toString());
    } catch (error) {
      onError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const updateMatrixValue = (
    matrix: string[][],
    setMatrix: (m: string[][]) => void,
    row: number,
    col: number,
    value: string
  ) => {
    const newMatrix = matrix.map((r, i) =>
      r.map((c, j) => (i === row && j === col ? value : c))
    );
    setMatrix(newMatrix);
  };

  return (
    <Card className="p-4">
      <Tabs defaultValue="matrix" onValueChange={(v) => setOperation(v as Operation)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="matrix">Matrix</TabsTrigger>
          <TabsTrigger value="complex">Complex</TabsTrigger>
          <TabsTrigger value="calculus">Calculus</TabsTrigger>
          <TabsTrigger value="polynomial">Polynomial</TabsTrigger>
        </TabsList>

        <TabsContent value="matrix" className="space-y-4">
          <div className="space-y-2">
            <Label>Matrix Size</Label>
            <Select
              value={matrixSize.toString()}
              onValueChange={(v) => {
                const size = parseInt(v);
                setMatrixSize(size);
                setMatrixA(Array(size).fill(0).map(() => Array(size).fill('0')));
                setMatrixB(Array(size).fill(0).map(() => Array(size).fill('0')));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {[2, 3, 4].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}x{size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Matrix A</Label>
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${matrixSize}, 1fr)` }}>
                {matrixA.map((row, i) =>
                  row.map((val, j) => (
                    <Input
                      key={`a-${i}-${j}`}
                      value={val}
                      onChange={(e) => updateMatrixValue(matrixA, setMatrixA, i, j, e.target.value)}
                      className="w-16"
                    />
                  ))
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Matrix B</Label>
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${matrixSize}, 1fr)` }}>
                {matrixB.map((row, i) =>
                  row.map((val, j) => (
                    <Input
                      key={`b-${i}-${j}`}
                      value={val}
                      onChange={(e) => updateMatrixValue(matrixB, setMatrixB, i, j, e.target.value)}
                      className="w-16"
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Operation</Label>
            <Select
              value={matrixOperation}
              onValueChange={(v) => setMatrixOperation(v as typeof matrixOperation)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select operation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiply">Multiply</SelectItem>
                <SelectItem value="add">Add</SelectItem>
                <SelectItem value="determinant">Determinant (A)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleMatrixOperation} className="w-full">
            Calculate
          </Button>
        </TabsContent>

        {/* Additional tabs will be implemented next */}
      </Tabs>
    </Card>
  );
};
