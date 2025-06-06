'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, Play, Download, Plus, Trash2, Atom, Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Gate {
  id: string;
  type: 'H' | 'X' | 'Y' | 'Z' | 'CNOT' | 'CZ' | 'RX' | 'RY' | 'RZ' | 'T' | 'S';
  qubit: number;
  controlQubit?: number;
  angle?: number;
}

interface CustomQuantumCircuitProps {
  numQubits: number;
  onCircuitExecute: (gates: Gate[]) => void;
}

export default function CustomQuantumCircuit({ numQubits, onCircuitExecute }: CustomQuantumCircuitProps) {
  const [gates, setGates] = useState<Gate[]>([]);
  const [selectedGateType, setSelectedGateType] = useState<Gate['type']>('H');
  const [selectedQubit, setSelectedQubit] = useState(0);
  const [controlQubit, setControlQubit] = useState(0);
  const [gateAngle, setGateAngle] = useState(0);
  const [circuitCode, setCircuitCode] = useState('');

  const gateTypes = [
    { value: 'H', label: 'Hadamard (H)', description: 'Creates superposition' },
    { value: 'X', label: 'Pauli-X', description: 'Bit flip' },
    { value: 'Y', label: 'Pauli-Y', description: 'Bit and phase flip' },
    { value: 'Z', label: 'Pauli-Z', description: 'Phase flip' },
    { value: 'CNOT', label: 'CNOT', description: 'Controlled NOT' },
    { value: 'CZ', label: 'Controlled-Z', description: 'Controlled phase' },
    { value: 'RX', label: 'RX(θ)', description: 'X-axis rotation' },
    { value: 'RY', label: 'RY(θ)', description: 'Y-axis rotation' },
    { value: 'RZ', label: 'RZ(θ)', description: 'Z-axis rotation' },
    { value: 'T', label: 'T Gate', description: 'π/8 phase gate' },
    { value: 'S', label: 'S Gate', description: 'π/4 phase gate' },
  ];

  const addGate = () => {
    const newGate: Gate = {
      id: Math.random().toString(36).substr(2, 9),
      type: selectedGateType,
      qubit: selectedQubit,
      ...((['CNOT', 'CZ'].includes(selectedGateType)) && { controlQubit }),
      ...((['RX', 'RY', 'RZ'].includes(selectedGateType)) && { angle: gateAngle }),
    };

    setGates([...gates, newGate]);
    toast({
      title: "Gate Added!",
      description: `${selectedGateType} gate added to qubit ${selectedQubit}`
    });
  };

  const removeGate = (id: string) => {
    setGates(gates.filter(gate => gate.id !== id));
  };

  const executeCircuit = () => {
    if (gates.length === 0) {
      toast({
        title: "Empty Circuit",
        description: "Please add some gates to execute the circuit",
        variant: "destructive"
      });
      return;
    }

    onCircuitExecute(gates);
    toast({
      title: "Circuit Executed!",
      description: `Executed circuit with ${gates.length} gates`
    });
  };

  const uploadCircuitFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.qasm,.py,.json,.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setCircuitCode(content);
          
          // Parse simple circuit formats
          if (file.name.endsWith('.qasm') || content.includes('OPENQASM')) {
            parseQASM(content);
          } else if (content.includes('qc.')) {
            parsePythonQiskit(content);
          }
          
          toast({
            title: "Circuit File Uploaded!",
            description: `Loaded ${file.name} successfully`
          });
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const parseQASM = (content: string) => {
    const lines = content.split('\n');
    const parsedGates: Gate[] = [];
    
    lines.forEach(line => {
      line = line.trim();
      if (line.startsWith('h ')) {
        const qubit = parseInt(line.match(/q\[(\d+)\]/)?.[1] || '0');
        parsedGates.push({
          id: Math.random().toString(36).substr(2, 9),
          type: 'H',
          qubit
        });
      } else if (line.startsWith('x ')) {
        const qubit = parseInt(line.match(/q\[(\d+)\]/)?.[1] || '0');
        parsedGates.push({
          id: Math.random().toString(36).substr(2, 9),
          type: 'X',
          qubit
        });
      } else if (line.startsWith('cx ')) {
        const matches = line.match(/q\[(\d+)\],\s*q\[(\d+)\]/);
        if (matches) {
          parsedGates.push({
            id: Math.random().toString(36).substr(2, 9),
            type: 'CNOT',
            qubit: parseInt(matches[2]),
            controlQubit: parseInt(matches[1])
          });
        }
      }
    });
    
    setGates(parsedGates);
  };

  const parsePythonQiskit = (content: string) => {
    const lines = content.split('\n');
    const parsedGates: Gate[] = [];
    
    lines.forEach(line => {
      if (line.includes('.h(') || line.includes('.hadamard(')) {
        const qubit = parseInt(line.match(/\((\d+)\)/)?.[1] || '0');
        parsedGates.push({
          id: Math.random().toString(36).substr(2, 9),
          type: 'H',
          qubit
        });
      } else if (line.includes('.x(')) {
        const qubit = parseInt(line.match(/\((\d+)\)/)?.[1] || '0');
        parsedGates.push({
          id: Math.random().toString(36).substr(2, 9),
          type: 'X',
          qubit
        });
      } else if (line.includes('.cx(') || line.includes('.cnot(')) {
        const matches = line.match(/\((\d+),\s*(\d+)\)/);
        if (matches) {
          parsedGates.push({
            id: Math.random().toString(36).substr(2, 9),
            type: 'CNOT',
            qubit: parseInt(matches[2]),
            controlQubit: parseInt(matches[1])
          });
        }
      }
    });
    
    setGates(parsedGates);
  };

  const exportCircuit = () => {
    const qasm = generateQASM();
    const blob = new Blob([qasm], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'custom_circuit.qasm';
    link.click();
    URL.revokeObjectURL(url);
  };

  const generateQASM = () => {
    let qasm = `OPENQASM 2.0;
include "qelib1.inc";
qreg q[${numQubits}];
creg c[${numQubits}];

`;
    
    gates.forEach(gate => {
      switch (gate.type) {
        case 'H':
          qasm += `h q[${gate.qubit}];\n`;
          break;
        case 'X':
          qasm += `x q[${gate.qubit}];\n`;
          break;
        case 'Y':
          qasm += `y q[${gate.qubit}];\n`;
          break;
        case 'Z':
          qasm += `z q[${gate.qubit}];\n`;
          break;
        case 'CNOT':
          qasm += `cx q[${gate.controlQubit}],q[${gate.qubit}];\n`;
          break;
        case 'CZ':
          qasm += `cz q[${gate.controlQubit}],q[${gate.qubit}];\n`;
          break;
        case 'RX':
          qasm += `rx(${gate.angle}) q[${gate.qubit}];\n`;
          break;
        case 'RY':
          qasm += `ry(${gate.angle}) q[${gate.qubit}];\n`;
          break;
        case 'RZ':
          qasm += `rz(${gate.angle}) q[${gate.qubit}];\n`;
          break;
        case 'T':
          qasm += `t q[${gate.qubit}];\n`;
          break;
        case 'S':
          qasm += `s q[${gate.qubit}];\n`;
          break;
      }
    });
    
    qasm += `\nmeasure q -> c;\n`;
    return qasm;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Circuit Builder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Atom className="h-5 w-5 text-purple-500" />
              Quantum Circuit Builder
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Gate Type</Label>
                <Select value={selectedGateType} onValueChange={(value: Gate['type']) => setSelectedGateType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {gateTypes.map(gate => (
                      <SelectItem key={gate.value} value={gate.value}>
                        {gate.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Target Qubit</Label>
                <Select value={selectedQubit.toString()} onValueChange={(value) => setSelectedQubit(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: numQubits }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        Qubit {i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {['CNOT', 'CZ'].includes(selectedGateType) && (
              <div>
                <Label>Control Qubit</Label>
                <Select value={controlQubit.toString()} onValueChange={(value) => setControlQubit(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: numQubits }, (_, i) => (
                      <SelectItem key={i} value={i.toString()} disabled={i === selectedQubit}>
                        Qubit {i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {['RX', 'RY', 'RZ'].includes(selectedGateType) && (
              <div>
                <Label>Rotation Angle (radians)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={gateAngle}
                  onChange={(e) => setGateAngle(parseFloat(e.target.value))}
                  placeholder="e.g., 1.57 for π/2"
                />
              </div>
            )}

            <Button onClick={addGate} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Gate
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={uploadCircuitFile} className="flex-1">
                <Upload className="h-4 w-4 mr-2" />
                Upload Circuit
              </Button>
              <Button variant="outline" onClick={exportCircuit} className="flex-1" disabled={gates.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Export QASM
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Circuit Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>Circuit Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            {gates.length > 0 ? (
              <div className="space-y-2">
                {gates.map((gate, index) => (
                  <div key={gate.id} className="flex items-center justify-between p-2 bg-purple-50 rounded">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{index + 1}</Badge>
                      <span className="font-mono text-sm">
                        {gate.type}
                        {gate.controlQubit !== undefined && ` (${gate.controlQubit}→${gate.qubit})`}
                        {gate.controlQubit === undefined && ` (${gate.qubit})`}
                        {gate.angle !== undefined && ` (${gate.angle.toFixed(2)})`}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeGate(gate.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <Button onClick={executeCircuit} className="w-full mt-4">
                  <Play className="h-4 w-4 mr-2" />
                  Execute Circuit ({gates.length} gates)
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Zap className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Build your quantum circuit</p>
                <p className="text-sm">Add gates or upload a circuit file</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Code Editor */}
      {circuitCode && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Circuit Code</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={circuitCode}
              onChange={(e) => setCircuitCode(e.target.value)}
              rows={10}
              className="font-mono text-sm"
              placeholder="Quantum circuit code will appear here..."
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}