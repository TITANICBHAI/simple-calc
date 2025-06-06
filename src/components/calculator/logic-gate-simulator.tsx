
"use client";

import { useState, useEffect, type ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { HardDriveIcon } from 'lucide-react'; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


type GateType = 'AND' | 'OR' | 'NOT' | 'XOR' | 'NAND' | 'NOR';

interface GateInfo {
  value: GateType;
  label: string;
  inputs: 1 | 2;
}

const gateOptions: GateInfo[] = [
  { value: 'AND', label: 'AND Gate', inputs: 2 },
  { value: 'OR', label: 'OR Gate', inputs: 2 },
  { value: 'NOT', label: 'NOT Gate', inputs: 1 },
  { value: 'XOR', label: 'XOR Gate', inputs: 2 },
  { value: 'NAND', label: 'NAND Gate', inputs: 2 },
  { value: 'NOR', label: 'NOR Gate', inputs: 2 },
];

const calculateGateOutput = (gateType: GateType, inputA: boolean, inputB?: boolean): boolean => {
  let result = false;
  const valA = inputA;
  // For NOT gate, inputB is undefined, but other gates expect it. Default to false if not applicable or explicitly passed.
  const valB = inputB === undefined ? false : inputB;


  switch (gateType) {
    case 'AND':
      result = valA && valB;
      break;
    case 'OR':
      result = valA || valB;
      break;
    case 'NOT':
      result = !valA; // Only uses inputA
      break;
    case 'XOR':
      result = valA !== valB;
      break;
    case 'NAND':
      result = !(valA && valB);
      break;
    case 'NOR':
      result = !(valA || valB);
      break;
    default:
      result = false;
  }
  return result;
};


const LogicGateSimulator: React.FC = () => {
  const [selectedGate, setSelectedGate] = useState<GateType>('AND');
  const [inputA, setInputA] = useState<boolean>(false); // false for 0, true for 1
  const [inputB, setInputB] = useState<boolean>(false);
  const [output, setOutput] = useState<boolean>(false);

  const currentGateDetails = gateOptions.find(g => g.value === selectedGate);

  useEffect(() => {
    const liveOutput = calculateGateOutput(selectedGate, inputA, currentGateDetails?.inputs === 2 ? inputB : undefined);
    setOutput(liveOutput);
  }, [selectedGate, inputA, inputB, currentGateDetails]);

  const handleGateChange = (value: string) => {
    setSelectedGate(value as GateType);
    const newGateDetails = gateOptions.find(g => g.value === value);
    if (newGateDetails?.inputs === 1) {
      setInputB(false); // Reset input B if new gate is unary
    }
  };

  const renderTruthTable = () => {
    if (!currentGateDetails) return null;

    const headers = currentGateDetails.inputs === 1 
      ? ["Input A", "Output"] 
      : ["Input A", "Input B", "Output"];

    const rows: (boolean | string)[][] = [];

    if (currentGateDetails.inputs === 1) {
      // NOT gate
      rows.push([false, calculateGateOutput(selectedGate, false) ? '1' : '0']);
      rows.push([true, calculateGateOutput(selectedGate, true) ? '1' : '0']);
    } else {
      // 2-input gates
      for (let a of [false, true]) {
        for (let b of [false, true]) {
          rows.push([a, b, calculateGateOutput(selectedGate, a, b) ? '1' : '0']);
        }
      }
    }

    return (
      <div className="mt-6">
        <h4 className="text-md font-semibold mb-2 text-center text-muted-foreground">Truth Table: {currentGateDetails.label}</h4>
        <Table className="w-full text-sm border rounded-md shadow-sm bg-card">
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/50">
              {headers.map(header => <TableHead key={header} className="text-center font-semibold text-foreground">{header}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-muted/20">
                {row.map((cell, cellIndex) => (
                  <TableCell key={cellIndex} className="text-center font-mono">
                    {typeof cell === 'boolean' ? (cell ? '1' : '0') : cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };


  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <HardDriveIcon className="mr-2 h-5 w-5 text-primary" />
          Logic Gate Simulator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="gateType" className="text-sm font-medium">Select Gate Type</Label>
          <Select value={selectedGate} onValueChange={handleGateChange}>
            <SelectTrigger id="gateType" className="mt-1">
              <SelectValue placeholder="Select a logic gate" />
            </SelectTrigger>
            <SelectContent>
              {gateOptions.map(gate => (
                <SelectItem key={gate.value} value={gate.value}>
                  {gate.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          <div className="space-y-2">
            <Label htmlFor="inputA" className="text-sm font-medium">Input A</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="inputA"
                checked={inputA}
                onCheckedChange={setInputA}
                aria-label="Input A (0 or 1)"
              />
              <span className="font-mono text-lg">{inputA ? '1' : '0'}</span>
            </div>
          </div>

          {currentGateDetails?.inputs === 2 && (
            <div className="space-y-2">
              <Label htmlFor="inputB" className="text-sm font-medium">Input B</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="inputB"
                  checked={inputB}
                  onCheckedChange={setInputB}
                  aria-label="Input B (0 or 1)"
                />
                <span className="font-mono text-lg">{inputB ? '1' : '0'}</span>
              </div>
            </div>
          )}
        </div>
        
        <Separator />

        <div>
          <Label className="text-sm font-medium">Output</Label>
          <div className="mt-2 p-4 bg-muted/50 rounded-md text-center">
            <span className="font-mono text-4xl font-bold text-accent">
              {output ? '1' : '0'}
            </span>
          </div>
        </div>
        
        {currentGateDetails && (
            <p className="text-xs text-muted-foreground italic pt-2 text-center">
                A {currentGateDetails.label} with input A = {inputA ? '1' : '0'}
                {currentGateDetails.inputs === 2 ? ` and input B = ${inputB ? '1' : '0'}` : ''}
                {' '}produces output = {output ? '1' : '0'}.
            </p>
        )}

        {renderTruthTable()}

      </CardContent>
      <CardFooter className="pt-4">
        <p className="text-xs text-muted-foreground text-center w-full">
          Toggle inputs to see the live output change. The truth table shows all possible outcomes for the selected gate.
        </p>
      </CardFooter>
    </Card>
  );
};

export default LogicGateSimulator;
