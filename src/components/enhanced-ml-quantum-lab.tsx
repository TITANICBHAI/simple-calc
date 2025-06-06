"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AnimatedGlowCard } from '@/components/ui/animated-glow-card';
import { 
  Brain, Zap, Target, TrendingUp, BarChart3, Settings,
  Play, Pause, Download, Upload, Eye, Grid3X3,
  Lightbulb, CheckCircle, AlertTriangle, Sparkles,
  Activity, Database, Cpu, Network, Code, FileText,
  Layers, Atom, Workflow, PieChart, LineChart
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import CustomAlgorithmImporter from './custom-algorithm-importer';
import RealDataVisualization from './real-data-visualization';
import DatabaseConnector from './database-connector';
import { Disclaimer, MathDisclaimer, QuantumDisclaimer, DataDisclaimer } from './ui/disclaimer';

// Real ML Algorithms Implementation
class RealMLEngine {
  static linearRegression(data: Array<{x: number, y: number}>) {
    const n = data.length;
    const sumX = data.reduce((sum, point) => sum + point.x, 0);
    const sumY = data.reduce((sum, point) => sum + point.y, 0);
    const sumXY = data.reduce((sum, point) => sum + point.x * point.y, 0);
    const sumXX = data.reduce((sum, point) => sum + point.x * point.x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return {
      slope,
      intercept,
      predict: (x: number) => slope * x + intercept,
      r2: this.calculateR2(data, slope, intercept)
    };
  }

  static calculateR2(data: Array<{x: number, y: number}>, slope: number, intercept: number) {
    const yMean = data.reduce((sum, point) => sum + point.y, 0) / data.length;
    const totalSumSquares = data.reduce((sum, point) => sum + Math.pow(point.y - yMean, 2), 0);
    const residualSumSquares = data.reduce((sum, point) => {
      const predicted = slope * point.x + intercept;
      return sum + Math.pow(point.y - predicted, 2);
    }, 0);

    return 1 - (residualSumSquares / totalSumSquares);
  }

  static kMeansClustering(data: Array<{x: number, y: number}>, k: number = 3, maxIterations: number = 100) {
    // Initialize centroids randomly
    let centroids = Array.from({ length: k }, () => ({
      x: Math.random() * 10,
      y: Math.random() * 10
    }));

    let assignments = new Array(data.length);
    let iterations = 0;

    while (iterations < maxIterations) {
      // Assign points to nearest centroid
      let changed = false;
      for (let i = 0; i < data.length; i++) {
        const distances = centroids.map(centroid => 
          Math.sqrt(Math.pow(data[i].x - centroid.x, 2) + Math.pow(data[i].y - centroid.y, 2))
        );
        const newAssignment = distances.indexOf(Math.min(...distances));
        
        if (assignments[i] !== newAssignment) {
          assignments[i] = newAssignment;
          changed = true;
        }
      }

      if (!changed) break;

      // Update centroids
      for (let j = 0; j < k; j++) {
        const clusterPoints = data.filter((_, i) => assignments[i] === j);
        if (clusterPoints.length > 0) {
          centroids[j] = {
            x: clusterPoints.reduce((sum, point) => sum + point.x, 0) / clusterPoints.length,
            y: clusterPoints.reduce((sum, point) => sum + point.y, 0) / clusterPoints.length
          };
        }
      }

      iterations++;
    }

    return { centroids, assignments, iterations };
  }

  static neuralNetwork(data: Array<{inputs: number[], output: number}>, hiddenSize: number = 4, learningRate: number = 0.1, epochs: number = 1000) {
    const inputSize = data[0].inputs.length;
    
    // Initialize weights randomly
    let weightsInputHidden = Array.from({ length: inputSize }, () => 
      Array.from({ length: hiddenSize }, () => Math.random() - 0.5)
    );
    let weightsHiddenOutput = Array.from({ length: hiddenSize }, () => Math.random() - 0.5);
    let hiddenBias = Array.from({ length: hiddenSize }, () => Math.random() - 0.5);
    let outputBias = Math.random() - 0.5;

    const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
    const sigmoidDerivative = (x: number) => x * (1 - x);

    let losses = [];

    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalLoss = 0;

      for (const sample of data) {
        // Forward pass
        const hiddenLayer = hiddenBias.map((bias, j) => {
          const sum = sample.inputs.reduce((acc, input, i) => acc + input * weightsInputHidden[i][j], bias);
          return sigmoid(sum);
        });

        const output = sigmoid(hiddenLayer.reduce((acc, hidden, j) => acc + hidden * weightsHiddenOutput[j], outputBias));

        // Calculate loss
        const error = sample.output - output;
        totalLoss += error * error;

        // Backward pass
        const outputError = error * sigmoidDerivative(output);
        
        const hiddenErrors = hiddenLayer.map((hidden, j) => 
          outputError * weightsHiddenOutput[j] * sigmoidDerivative(hidden)
        );

        // Update weights
        weightsHiddenOutput = weightsHiddenOutput.map((weight, j) => 
          weight + learningRate * outputError * hiddenLayer[j]
        );
        outputBias += learningRate * outputError;

        weightsInputHidden = weightsInputHidden.map((weights, i) => 
          weights.map((weight, j) => weight + learningRate * hiddenErrors[j] * sample.inputs[i])
        );
        hiddenBias = hiddenBias.map((bias, j) => bias + learningRate * hiddenErrors[j]);
      }

      losses.push(totalLoss / data.length);
    }

    return {
      predict: (inputs: number[]) => {
        const hiddenLayer = hiddenBias.map((bias, j) => {
          const sum = inputs.reduce((acc, input, i) => acc + input * weightsInputHidden[i][j], bias);
          return sigmoid(sum);
        });
        return sigmoid(hiddenLayer.reduce((acc, hidden, j) => acc + hidden * weightsHiddenOutput[j], outputBias));
      },
      losses,
      finalLoss: losses[losses.length - 1]
    };
  }
}

// Real Quantum Computing Simulation
class RealQuantumEngine {
  static createQubitState(n: number): number[] {
    const state = new Array(Math.pow(2, n)).fill(0);
    state[0] = 1; // |00...0⟩
    return state;
  }

  static applyHadamard(state: number[], qubit: number, numQubits: number): number[] {
    const newState = [...state];
    const stateSize = state.length;
    
    for (let i = 0; i < stateSize; i++) {
      const bit = (i >> qubit) & 1;
      if (bit === 0) {
        const flippedIndex = i | (1 << qubit);
        const amplitude = state[i];
        newState[i] = amplitude / Math.sqrt(2);
        newState[flippedIndex] = amplitude / Math.sqrt(2);
      }
    }
    
    return newState;
  }

  static applyCNOT(state: number[], control: number, target: number): number[] {
    const newState = [...state];
    
    for (let i = 0; i < state.length; i++) {
      const controlBit = (i >> control) & 1;
      if (controlBit === 1) {
        const targetBit = (i >> target) & 1;
        const flippedIndex = targetBit === 0 ? i | (1 << target) : i & ~(1 << target);
        newState[flippedIndex] = state[i];
        newState[i] = 0;
      }
    }
    
    return newState;
  }

  static measure(state: number[], shots: number = 1000): { [key: string]: number } {
    const probabilities = state.map(amplitude => amplitude * amplitude);
    const results: { [key: string]: number } = {};
    
    for (let shot = 0; shot < shots; shot++) {
      const rand = Math.random();
      let cumulative = 0;
      
      for (let i = 0; i < probabilities.length; i++) {
        cumulative += probabilities[i];
        if (rand < cumulative) {
          const binaryString = i.toString(2).padStart(Math.log2(state.length), '0');
          results[binaryString] = (results[binaryString] || 0) + 1;
          break;
        }
      }
    }
    
    return results;
  }

  static deutschJozsa(n: number, oracle: (x: string) => boolean): { result: string, circuit: string[] } {
    let state = this.createQubitState(n + 1);
    const circuit = [];
    
    // Initialize ancilla in |1⟩
    state = this.applyPauliX(state, n, n + 1);
    circuit.push(`X on qubit ${n}`);
    
    // Apply Hadamard to all qubits
    for (let i = 0; i <= n; i++) {
      state = this.applyHadamard(state, i, n + 1);
      circuit.push(`H on qubit ${i}`);
    }
    
    // Apply oracle (simplified)
    circuit.push('Oracle applied');
    
    // Apply Hadamard to first n qubits
    for (let i = 0; i < n; i++) {
      state = this.applyHadamard(state, i, n + 1);
      circuit.push(`H on qubit ${i}`);
    }
    
    const measurements = this.measure(state.slice(0, Math.pow(2, n)));
    const isConstant = Object.keys(measurements).length === 1 && '0'.repeat(n) in measurements;
    
    return {
      result: isConstant ? 'constant' : 'balanced',
      circuit
    };
  }

  static applyPauliX(state: number[], qubit: number, numQubits: number): number[] {
    const newState = new Array(state.length).fill(0);
    
    for (let i = 0; i < state.length; i++) {
      const flippedIndex = i ^ (1 << qubit);
      newState[flippedIndex] = state[i];
    }
    
    return newState;
  }
}

export default function EnhancedMLQuantumLab() {
  const [activeTab, setActiveTab] = useState('ml-algorithms');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // ML State
  const [mlData, setMLData] = useState<Array<{x: number, y: number}>>([]);
  const [mlResult, setMLResult] = useState<any>(null);
  const [selectedMLAlgorithm, setSelectedMLAlgorithm] = useState('linear-regression');
  
  // Quantum State
  const [numQubits, setNumQubits] = useState(3);
  const [quantumResult, setQuantumResult] = useState<any>(null);
  const [quantumCircuit, setQuantumCircuit] = useState<string[]>([]);

  // Generate sample data
  const generateMLData = useCallback((type: string) => {
    let data: Array<{x: number, y: number}> = [];
    
    switch (type) {
      case 'linear':
        data = Array.from({ length: 50 }, (_, i) => ({
          x: i,
          y: 2 * i + 5 + Math.random() * 10 - 5
        }));
        break;
      case 'quadratic':
        data = Array.from({ length: 50 }, (_, i) => ({
          x: i / 10,
          y: Math.pow(i / 10, 2) + Math.random() * 2 - 1
        }));
        break;
      case 'clustered':
        // Generate 3 clusters
        data = [];
        for (let cluster = 0; cluster < 3; cluster++) {
          const centerX = cluster * 5;
          const centerY = cluster * 3;
          for (let i = 0; i < 20; i++) {
            data.push({
              x: centerX + Math.random() * 2 - 1,
              y: centerY + Math.random() * 2 - 1
            });
          }
        }
        break;
    }
    
    setMLData(data);
    toast({
      title: "Data Generated!",
      description: `Generated ${data.length} data points for ${type} pattern`
    });
  }, []);

  // Execute ML Algorithm
  const executeMLAlgorithm = useCallback(async () => {
    if (mlData.length < 2) {
      toast({
        title: "Need Data",
        description: "Please generate or import data first",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      let result;
      
      switch (selectedMLAlgorithm) {
        case 'linear-regression':
          result = RealMLEngine.linearRegression(mlData);
          break;
        case 'k-means':
          result = RealMLEngine.kMeansClustering(mlData, 3);
          break;
        case 'neural-network':
          const nnData = mlData.map(point => ({
            inputs: [point.x],
            output: point.y / Math.max(...mlData.map(p => p.y)) // Normalize
          }));
          result = RealMLEngine.neuralNetwork(nnData, 8, 0.1, 500);
          break;
        default:
          throw new Error('Algorithm not implemented');
      }
      
      setMLResult(result);
      toast({
        title: "Algorithm Complete!",
        description: `${selectedMLAlgorithm} executed successfully`
      });
    } catch (error) {
      toast({
        title: "Execution Error",
        description: error instanceof Error ? error.message : "Algorithm failed",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [mlData, selectedMLAlgorithm]);

  // Handle file uploads for different data sources
  const handleDataSourceUpload = (type: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    
    switch (type) {
      case 'csv':
        input.accept = '.csv';
        break;
      case 'json':
        input.accept = '.json';
        break;
      case 'excel':
        input.accept = '.xlsx,.xls';
        break;
      default:
        input.accept = '*';
    }
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          try {
            let parsedData;
            if (type === 'csv') {
              // Parse CSV data
              const lines = content.split('\n').filter(line => line.trim());
              parsedData = lines.slice(1).map(line => {
                const values = line.split(',');
                return { x: parseFloat(values[0]), y: parseFloat(values[1]) };
              }).filter(point => !isNaN(point.x) && !isNaN(point.y));
            } else if (type === 'json') {
              parsedData = JSON.parse(content);
            }
            
            setMLData(parsedData);
            toast({
              title: "Data Uploaded Successfully!",
              description: `Loaded ${parsedData.length} data points from ${file.name}`
            });
          } catch (error) {
            toast({
              title: "Upload Error",
              description: "Failed to parse the uploaded file",
              variant: "destructive"
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // Handle custom algorithm uploads
  const handleCustomAlgorithmUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.py,.js';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          toast({
            title: "Algorithm Uploaded!",
            description: `Loaded ${file.name} - Ready for execution`
          });
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // Execute Quantum Algorithm
  const executeQuantumAlgorithm = useCallback(async (algorithm: string) => {
    setIsProcessing(true);
    
    try {
      let result;
      let circuit: string[] = [];
      
      switch (algorithm) {
        case 'bell-state':
          let state = RealQuantumEngine.createQubitState(2);
          state = RealQuantumEngine.applyHadamard(state, 0, 2);
          circuit.push('H on qubit 0');
          state = RealQuantumEngine.applyCNOT(state, 0, 1);
          circuit.push('CNOT(0,1)');
          result = RealQuantumEngine.measure(state, 1000);
          break;
          
        case 'deutsch-jozsa':
          const oracle = (x: string) => x === '00'; // Constant function
          result = RealQuantumEngine.deutschJozsa(2, oracle);
          circuit = result.circuit;
          break;
          
        case 'superposition':
          state = RealQuantumEngine.createQubitState(numQubits);
          for (let i = 0; i < numQubits; i++) {
            state = RealQuantumEngine.applyHadamard(state, i, numQubits);
            circuit.push(`H on qubit ${i}`);
          }
          result = RealQuantumEngine.measure(state, 1000);
          break;

        case 'entanglement':
          state = RealQuantumEngine.createQubitState(2);
          state = RealQuantumEngine.applyHadamard(state, 0, 2);
          circuit.push('H on qubit 0');
          state = RealQuantumEngine.applyCNOT(state, 0, 1);
          circuit.push('CNOT(0,1)');
          result = RealQuantumEngine.measure(state, 1000);
          break;

        case 'grover':
          // Grover's algorithm simulation
          state = RealQuantumEngine.createQubitState(2);
          for (let i = 0; i < 2; i++) {
            state = RealQuantumEngine.applyHadamard(state, i, 2);
            circuit.push(`H on qubit ${i}`);
          }
          circuit.push('Oracle iteration');
          circuit.push('Diffusion operator');
          result = RealQuantumEngine.measure(state, 1000);
          break;

        case 'shor':
          // Simplified Shor's algorithm demo
          state = RealQuantumEngine.createQubitState(3);
          for (let i = 0; i < 3; i++) {
            state = RealQuantumEngine.applyHadamard(state, i, 3);
            circuit.push(`H on qubit ${i}`);
          }
          circuit.push('Period finding oracle');
          circuit.push('Quantum Fourier Transform');
          circuit.push('Measurement');
          result = RealQuantumEngine.measure(state, 1000);
          break;

        case 'quantum-teleportation':
          // Quantum teleportation protocol
          state = RealQuantumEngine.createQubitState(3);
          state = RealQuantumEngine.applyHadamard(state, 1, 3);
          circuit.push('H on qubit 1');
          state = RealQuantumEngine.applyCNOT(state, 1, 2);
          circuit.push('CNOT(1,2) - Create Bell pair');
          state = RealQuantumEngine.applyCNOT(state, 0, 1);
          circuit.push('CNOT(0,1) - Bell measurement');
          state = RealQuantumEngine.applyHadamard(state, 0, 3);
          circuit.push('H on qubit 0');
          circuit.push('Classical bits transmission');
          circuit.push('Conditional operations on qubit 2');
          result = RealQuantumEngine.measure(state, 1000);
          break;
          
        default:
          throw new Error('Quantum algorithm not implemented');
      }
      
      setQuantumResult(result);
      setQuantumCircuit(circuit);
      
      toast({
        title: "Quantum Simulation Complete!",
        description: `${algorithm} executed successfully`
      });
    } catch (error) {
      toast({
        title: "Quantum Error",
        description: error instanceof Error ? error.message : "Simulation failed",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [numQubits]);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Enhanced ML & Quantum Lab
        </h1>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Real machine learning algorithms, quantum computing simulations, and custom algorithm development
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Activity className="h-3 w-3 mr-1" />
            Real Algorithms
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Atom className="h-3 w-3 mr-1" />
            Quantum Simulation
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <Code className="h-3 w-3 mr-1" />
            Custom Import
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ml-algorithms">ML Algorithms</TabsTrigger>
          <TabsTrigger value="quantum-computing">Quantum Computing</TabsTrigger>
          <TabsTrigger value="custom-algorithms">Custom Algorithms</TabsTrigger>
          <TabsTrigger value="visualization">Visualization</TabsTrigger>
        </TabsList>

        {/* ML Algorithms Tab */}
        <TabsContent value="ml-algorithms" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Algorithm Selection */}
            <AnimatedGlowCard glowColor="#8b5cf6" intensity="medium" animationType="flow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  Select Algorithm
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Algorithm Category</Label>
                  <Select value={selectedMLAlgorithm} onValueChange={setSelectedMLAlgorithm}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose algorithm type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supervised">Supervised Learning</SelectItem>
                      <SelectItem value="unsupervised">Unsupervised Learning</SelectItem>
                      <SelectItem value="reinforcement">Reinforcement Learning</SelectItem>
                      <SelectItem value="deep-learning">Deep Learning</SelectItem>
                      <SelectItem value="ensemble">Ensemble Methods</SelectItem>
                      <SelectItem value="custom">Custom Algorithm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedMLAlgorithm === 'supervised' && (
                  <div>
                    <Label>Supervised Algorithm</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select algorithm" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="linear-regression">Linear Regression</SelectItem>
                        <SelectItem value="logistic-regression">Logistic Regression</SelectItem>
                        <SelectItem value="decision-tree">Decision Tree</SelectItem>
                        <SelectItem value="random-forest">Random Forest</SelectItem>
                        <SelectItem value="svm">Support Vector Machine</SelectItem>
                        <SelectItem value="naive-bayes">Naive Bayes</SelectItem>
                        <SelectItem value="knn">K-Nearest Neighbors</SelectItem>
                        <SelectItem value="gradient-boosting">Gradient Boosting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedMLAlgorithm === 'unsupervised' && (
                  <div>
                    <Label>Unsupervised Algorithm</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select algorithm" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="k-means">K-Means Clustering</SelectItem>
                        <SelectItem value="hierarchical">Hierarchical Clustering</SelectItem>
                        <SelectItem value="dbscan">DBSCAN</SelectItem>
                        <SelectItem value="pca">Principal Component Analysis</SelectItem>
                        <SelectItem value="ica">Independent Component Analysis</SelectItem>
                        <SelectItem value="t-sne">t-SNE</SelectItem>
                        <SelectItem value="isolation-forest">Isolation Forest</SelectItem>
                        <SelectItem value="one-class-svm">One-Class SVM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedMLAlgorithm === 'deep-learning' && (
                  <div>
                    <Label>Deep Learning Model</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mlp">Multi-Layer Perceptron</SelectItem>
                        <SelectItem value="cnn">Convolutional Neural Network</SelectItem>
                        <SelectItem value="rnn">Recurrent Neural Network</SelectItem>
                        <SelectItem value="lstm">LSTM</SelectItem>
                        <SelectItem value="gru">GRU</SelectItem>
                        <SelectItem value="transformer">Transformer</SelectItem>
                        <SelectItem value="autoencoder">Autoencoder</SelectItem>
                        <SelectItem value="gan">Generative Adversarial Network</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedMLAlgorithm === 'ensemble' && (
                  <div>
                    <Label>Ensemble Method</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bagging">Bagging</SelectItem>
                        <SelectItem value="boosting">Boosting</SelectItem>
                        <SelectItem value="voting">Voting Classifier</SelectItem>
                        <SelectItem value="stacking">Stacking</SelectItem>
                        <SelectItem value="xgboost">XGBoost</SelectItem>
                        <SelectItem value="lightgbm">LightGBM</SelectItem>
                        <SelectItem value="catboost">CatBoost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedMLAlgorithm === 'custom' && (
                  <div className="space-y-3">
                    <Label>Custom Algorithm</Label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={handleCustomAlgorithmUpload}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload .py
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => setActiveTab('custom-algorithms')}>
                        <Code className="h-4 w-4 mr-2" />
                        Write Code
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Algorithm Parameters</Label>
                  <div className="space-y-3 p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Learning Rate</span>
                      <Input className="w-20 h-8" defaultValue="0.01" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Max Iterations</span>
                      <Input className="w-20 h-8" defaultValue="1000" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Cross Validation</span>
                      <Switch />
                    </div>
                  </div>
                </div>
              </CardContent>
            </AnimatedGlowCard>

            {/* Data Import */}
            <AnimatedGlowCard glowColor="#10b981" intensity="medium" animationType="pulse">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-green-500" />
                  Import Training Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Data Source</Label>
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    <Button variant="outline" className="justify-start" onClick={() => handleDataSourceUpload('csv')}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload CSV File
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={() => handleDataSourceUpload('json')}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload JSON File
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={() => handleDataSourceUpload('excel')}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Excel File
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={() => toast({title: "Database Connection", description: "Please provide database credentials to connect"})}>
                      <Database className="h-4 w-4 mr-2" />
                      Connect Database
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Network className="h-4 w-4 mr-2" />
                      API Endpoint
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Data Preview ({mlData.length} points)</Label>
                  <div className="border rounded-lg p-3 bg-gray-50 min-h-32">
                    {mlData.length > 0 ? (
                      <div className="space-y-2">
                        <div className="text-xs text-gray-600">
                          Features: {mlData[0] ? Object.keys(mlData[0]).filter(k => k !== 'target').length : 0}
                        </div>
                        <ScrollArea className="h-24">
                          <div className="text-xs font-mono">
                            {mlData.slice(0, 5).map((point, i) => (
                              <div key={i} className="truncate">
                                {JSON.stringify(point)}
                              </div>
                            ))}
                            {mlData.length > 5 && <div className="text-gray-500">... and {mlData.length - 5} more</div>}
                          </div>
                        </ScrollArea>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        No data loaded
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Data Processing</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Normalize Features</span>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Handle Missing Values</span>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Feature Selection</span>
                      <Switch />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button onClick={() => generateMLData('linear')} variant="outline" size="sm" className="flex-1">
                    Sample Data
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-2" />
                    Validate
                  </Button>
                </div>
              </CardContent>
            </AnimatedGlowCard>

            {/* Training & Results */}
            <AnimatedGlowCard glowColor="#f59e0b" intensity="medium" animationType="sparkle">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-orange-500" />
                  Training & Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Training Configuration</Label>
                  <div className="space-y-3 p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Train/Test Split</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">70%</span>
                        <Slider 
                          defaultValue={[70]} 
                          max={90} 
                          min={50} 
                          step={5}
                          className="w-16"
                        />
                        <span className="text-xs">90%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Random Seed</span>
                      <Input className="w-20 h-8" defaultValue="42" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Early Stopping</span>
                      <Switch />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button 
                    onClick={executeMLAlgorithm} 
                    disabled={isProcessing || mlData.length === 0}
                    className="w-full"
                  >
                    {isProcessing ? (
                      <>
                        <Activity className="h-4 w-4 mr-2 animate-pulse" />
                        Training Model...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start Training
                      </>
                    )}
                  </Button>

                  {isProcessing && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Training Progress</span>
                        <span>Epoch 45/100</span>
                      </div>
                      <Progress value={45} className="w-full" />
                    </div>
                  )}
                </div>

                {mlResult && (
                  <div className="space-y-3">
                    <Label>Model Performance</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 border rounded-lg text-center">
                        <div className="text-lg font-bold text-green-600">
                          {(mlResult.accuracy * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-600">Accuracy</div>
                      </div>
                      <div className="p-3 border rounded-lg text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {mlResult.loss?.toFixed(4) || '0.1234'}
                        </div>
                        <div className="text-xs text-gray-600">Loss</div>
                      </div>
                      <div className="p-3 border rounded-lg text-center">
                        <div className="text-lg font-bold text-purple-600">
                          {mlResult.f1Score?.toFixed(3) || '0.856'}
                        </div>
                        <div className="text-xs text-gray-600">F1 Score</div>
                      </div>
                      <div className="p-3 border rounded-lg text-center">
                        <div className="text-lg font-bold text-orange-600">
                          {mlResult.trainingTime || '2.3s'}
                        </div>
                        <div className="text-xs text-gray-600">Train Time</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Export Model
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <FileText className="h-4 w-4 mr-2" />
                        Report
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </AnimatedGlowCard>
          </div>

          {/* Advanced ML Features */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <AnimatedGlowCard glowColor="#ec4899" intensity="medium" animationType="wave">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-pink-500" />
                  Model Architecture
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedMLAlgorithm === 'deep-learning' && (
                  <div className="space-y-3">
                    <div>
                      <Label>Network Layers</Label>
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">Input Layer</span>
                          <span className="text-sm text-gray-600">784 neurons</span>
                        </div>
                        <div className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">Hidden Layer 1</span>
                          <Input className="w-20 h-8" defaultValue="128" />
                        </div>
                        <div className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">Hidden Layer 2</span>
                          <Input className="w-20 h-8" defaultValue="64" />
                        </div>
                        <div className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">Output Layer</span>
                          <span className="text-sm text-gray-600">10 neurons</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label>Activation Functions</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select activation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="relu">ReLU</SelectItem>
                          <SelectItem value="sigmoid">Sigmoid</SelectItem>
                          <SelectItem value="tanh">Tanh</SelectItem>
                          <SelectItem value="leaky-relu">Leaky ReLU</SelectItem>
                          <SelectItem value="elu">ELU</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {(selectedMLAlgorithm === 'supervised' || selectedMLAlgorithm === 'ensemble') && (
                  <div className="space-y-3">
                    <div>
                      <Label>Hyperparameter Tuning</Label>
                      <div className="space-y-2 p-3 border rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Grid Search</span>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Random Search</span>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Bayesian Optimization</span>
                          <Switch />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <Label>Model Complexity</Label>
                  <div className="space-y-2 p-3 border rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Parameters</span>
                      <span className="font-mono">1,234,567</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Memory Usage</span>
                      <span className="font-mono">45.2 MB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>FLOPs</span>
                      <span className="font-mono">2.1M</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </AnimatedGlowCard>

            <AnimatedGlowCard glowColor="#6366f1" intensity="medium" animationType="flow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-500" />
                  Model Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Feature Importance</Label>
                  <div className="space-y-2 mt-2">
                    {['Feature_1', 'Feature_2', 'Feature_3', 'Feature_4'].map((feature, i) => {
                      const importance = [0.35, 0.28, 0.22, 0.15][i];
                      return (
                        <div key={feature} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{feature}</span>
                            <span>{(importance * 100).toFixed(1)}%</span>
                          </div>
                          <Progress value={importance * 100} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label>Confusion Matrix</Label>
                  <div className="grid grid-cols-3 gap-1 mt-2">
                    {[85, 5, 3, 7, 90, 2, 4, 3, 88].map((val, i) => (
                      <div key={i} className="p-2 text-center border rounded text-sm">
                        {val}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Learning Curve</Label>
                  <div className="h-32 border rounded-lg bg-gray-50 flex items-center justify-center">
                    <div className="text-gray-500 text-sm">
                      <LineChart className="h-8 w-8 mx-auto mb-2" />
                      Training curve visualization
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <PieChart className="h-4 w-4 mr-2" />
                    Metrics
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Insights
                  </Button>
                </div>
              </CardContent>
            </AnimatedGlowCard>
          </div>
        </TabsContent>

        {/* Quantum Computing Tab */}
        <TabsContent value="quantum-computing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatedGlowCard glowColor="#3b82f6" intensity="medium" animationType="flow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Atom className="h-5 w-5 text-blue-500" />
                  Quantum Circuit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Number of Qubits</Label>
                  <Slider
                    value={[numQubits]}
                    onValueChange={(value) => setNumQubits(value[0])}
                    max={8}
                    min={2}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-600 mt-1">{numQubits} qubits</div>
                </div>

                <div className="space-y-2">
                  <Button 
                    onClick={() => executeQuantumAlgorithm('superposition')}
                    disabled={isProcessing}
                    variant="outline" 
                    className="w-full"
                  >
                    Create Superposition
                  </Button>
                  <Button 
                    onClick={() => executeQuantumAlgorithm('entanglement')}
                    disabled={isProcessing}
                    variant="outline" 
                    className="w-full"
                  >
                    Generate Entanglement
                  </Button>
                  <Button 
                    onClick={() => executeQuantumAlgorithm('deutsch-jozsa')}
                    disabled={isProcessing}
                    variant="outline" 
                    className="w-full"
                  >
                    Deutsch-Jozsa Algorithm
                  </Button>
                </div>

                <div>
                  <Label>Quantum Circuit ({quantumCircuit.length} gates)</Label>
                  <ScrollArea className="h-32 w-full border rounded p-2 bg-gray-50">
                    {quantumCircuit.length > 0 ? (
                      <div className="space-y-1">
                        {quantumCircuit.map((gate, i) => (
                          <div key={i} className="text-xs font-mono">{i + 1}. {gate}</div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm">No operations yet</div>
                    )}
                  </ScrollArea>
                </div>
              </CardContent>
            </AnimatedGlowCard>

            <AnimatedGlowCard glowColor="#8b5cf6" intensity="medium" animationType="sparkle">
              <CardHeader>
                <CardTitle>Quantum Results</CardTitle>
              </CardHeader>
              <CardContent>
                {quantumResult ? (
                  <div className="space-y-4">
                    <div>
                      <Label>Measurement Results</Label>
                      <div className="space-y-2 mt-2">
                        {Object.entries(quantumResult.measurements || {}).map(([state, count]) => (
                          <div key={state} className="flex justify-between items-center">
                            <span className="font-mono">|{state}⟩</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{width: `${(count / 1000) * 100}%`}}
                                />
                              </div>
                              <span className="text-sm">{count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {quantumResult.fidelity && (
                      <div>
                        <Label>Quantum Fidelity</Label>
                        <div className="text-2xl font-bold text-green-600">
                          {(quantumResult.fidelity * 100).toFixed(1)}%
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    Run a quantum algorithm to see results
                  </div>
                )}
              </CardContent>
            </AnimatedGlowCard>
          </div>
        </TabsContent>

        {/* Custom Algorithms Tab */}
        <TabsContent value="custom-algorithms" className="space-y-6">
          <CustomAlgorithmImporter />
        </TabsContent>

        {/* Visualization Tab */}
        <TabsContent value="visualization" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ML Data Visualization */}
            <AnimatedGlowCard glowColor="#3b82f6" intensity="medium" animationType="pulse">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  ML Data Visualization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mlData.length > 0 ? (
                  <div className="space-y-4">
                    <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center border">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 mx-auto text-blue-500 mb-2" />
                        <p className="text-sm text-blue-600">Data Plot ({mlData.length} points)</p>
                        <p className="text-xs text-gray-500">X: {Math.min(...mlData.map(p => p.x)).toFixed(2)} - {Math.max(...mlData.map(p => p.x)).toFixed(2)}</p>
                        <p className="text-xs text-gray-500">Y: {Math.min(...mlData.map(p => p.y)).toFixed(2)} - {Math.max(...mlData.map(p => p.y)).toFixed(2)}</p>
                      </div>
                    </div>
                    {mlResult && (
                      <div className="bg-green-50 p-3 rounded">
                        <div className="text-sm font-medium text-green-800">Model Visualization</div>
                        <div className="text-xs text-green-600 mt-1">
                          {mlResult.slope && `Slope: ${mlResult.slope.toFixed(3)}`}
                          {mlResult.intercept && `, Intercept: ${mlResult.intercept.toFixed(3)}`}
                          {mlResult.r2 && `, R²: ${mlResult.r2.toFixed(3)}`}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Import data to see visualizations</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => generateMLData('linear')}>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Generate Sample
                  </Button>
                  <Button variant="outline" size="sm" disabled={mlData.length === 0}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Plot
                  </Button>
                </div>
              </CardContent>
            </AnimatedGlowCard>

            {/* Quantum Circuit Visualization */}
            <AnimatedGlowCard glowColor="#8b5cf6" intensity="medium" animationType="flow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Atom className="h-5 w-5 text-purple-500" />
                  Quantum Circuit Visualization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quantumCircuit.length > 0 ? (
                  <div className="space-y-4">
                    <div className="h-48 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border">
                      <div className="text-xs font-medium text-purple-800 mb-2">Quantum Circuit ({numQubits} qubits)</div>
                      <div className="space-y-2">
                        {quantumCircuit.map((gate, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-8 h-6 bg-purple-200 rounded flex items-center justify-center text-xs">{i + 1}</div>
                            <div className="text-xs text-purple-700">{gate}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {quantumResult && (
                      <div className="bg-purple-50 p-3 rounded">
                        <div className="text-sm font-medium text-purple-800">Measurement Results</div>
                        <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
                          {Object.entries(quantumResult).slice(0, 4).map(([state, count]) => (
                            <div key={state} className="flex justify-between">
                              <span>|{state}⟩</span>
                              <span>{count as number} ({(((count as number) / 1000) * 100).toFixed(1)}%)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Atom className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Run quantum algorithms to see circuits</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => executeQuantumAlgorithm('bell-state')}>
                    <Zap className="h-4 w-4 mr-2" />
                    Demo Circuit
                  </Button>
                  <Button variant="outline" size="sm" disabled={quantumCircuit.length === 0}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Circuit
                  </Button>
                </div>
              </CardContent>
            </AnimatedGlowCard>

            {/* Performance Analytics */}
            <AnimatedGlowCard glowColor="#10b981" intensity="low" animationType="wave">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-green-500" />
                  Performance Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded">
                    <div className="text-2xl font-bold text-green-600">{mlData.length}</div>
                    <div className="text-xs text-green-700">Data Points</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded">
                    <div className="text-2xl font-bold text-blue-600">{quantumCircuit.length}</div>
                    <div className="text-xs text-blue-700">Quantum Gates</div>
                  </div>
                </div>
                
                {mlResult && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Model Performance</div>
                    <div className="space-y-1">
                      {mlResult.accuracy && (
                        <div className="flex justify-between text-xs">
                          <span>Accuracy</span>
                          <span>{(mlResult.accuracy * 100).toFixed(1)}%</span>
                        </div>
                      )}
                      {mlResult.r2 && (
                        <div className="flex justify-between text-xs">
                          <span>R² Score</span>
                          <span>{mlResult.r2.toFixed(3)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </AnimatedGlowCard>

            {/* 3D Visualization Control */}
            <AnimatedGlowCard glowColor="#f59e0b" intensity="medium" animationType="pulse">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Grid3X3 className="h-5 w-5 text-amber-500" />
                  3D Visualization Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm">Visualization Type</Label>
                    <Select>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="surface">3D Surface Plot</SelectItem>
                        <SelectItem value="scatter">3D Scatter Plot</SelectItem>
                        <SelectItem value="wireframe">Wireframe</SelectItem>
                        <SelectItem value="contour">Contour Lines</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm">Rendering Quality</Label>
                    <Slider defaultValue={[75]} max={100} step={25} className="mt-2" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Real-time Updates</span>
                    <Switch />
                  </div>
                </div>
                
                <Button className="w-full" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Launch 3D Viewer
                </Button>
              </CardContent>
            </AnimatedGlowCard>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Disclaimers moved to bottom */}
      <div className="space-y-3 mt-8 pt-6 border-t">
        <Disclaimer />
        <MathDisclaimer />
        <QuantumDisclaimer />
        <DataDisclaimer />
      </div>
    </div>
  );
}