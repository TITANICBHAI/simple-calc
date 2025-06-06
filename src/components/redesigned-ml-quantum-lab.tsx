"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Atom, 
  Cpu, 
  Zap, 
  Coffee, 
  Play, 
  Pause, 
  RotateCcw,
  TrendingUp,
  BarChart3,
  Settings,
  Download,
  Upload,
  Eye,
  Layers,
  Target,
  Activity,
  Plus
} from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { KofiButton } from '@/components/ui/kofi-button';
import { SmartInputValidator } from '@/components/smart-input-validator';
import { SmartErrorFeedback } from '@/components/smart-error-feedback';
import { ContentAd, SidebarAd } from '@/components/ui/adsense-ad';

interface MLModel {
  name: string;
  type: 'regression' | 'classification' | 'clustering' | 'neural_network';
  accuracy: number;
  loss: number;
  epochs: number;
  status: 'training' | 'complete' | 'error';
}

interface QuantumCircuit {
  name: string;
  qubits: number;
  gates: string[];
  measurement: number[];
  fidelity: number;
  status: 'ready' | 'running' | 'complete';
}

export function RedesignedMLQuantumLab() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // ML State
  const [mlModels, setMLModels] = useState<MLModel[]>([
    {
      name: 'Linear Regression Model',
      type: 'regression',
      accuracy: 94.2,
      loss: 0.032,
      epochs: 150,
      status: 'complete'
    },
    {
      name: 'Neural Network Classifier',
      type: 'neural_network',
      accuracy: 87.8,
      loss: 0.089,
      epochs: 89,
      status: 'training'
    }
  ]);

  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);

  // Quantum State
  const [quantumCircuits, setQuantumCircuits] = useState<QuantumCircuit[]>([
    {
      name: 'Bell State Generator',
      qubits: 2,
      gates: ['H', 'CNOT'],
      measurement: [0.5, 0.5],
      fidelity: 98.7,
      status: 'complete'
    },
    {
      name: 'Quantum Fourier Transform',
      qubits: 4,
      gates: ['H', 'R', 'SWAP'],
      measurement: [0.25, 0.25, 0.25, 0.25],
      fidelity: 96.3,
      status: 'ready'
    }
  ]);

  // Data for demonstrations
  const [dataPoints, setDataPoints] = useState<{x: number, y: number}[]>([
    {x: 1, y: 2.1}, {x: 2, y: 3.9}, {x: 3, y: 6.2}, {x: 4, y: 7.8}, {x: 5, y: 10.1}
  ]);

  // Simulated training
  useEffect(() => {
    if (isTraining) {
      const interval = setInterval(() => {
        setTrainingProgress(prev => {
          if (prev >= 100) {
            setIsTraining(false);
            return 100;
          }
          return prev + Math.random() * 5;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [isTraining]);

  const startMLTraining = () => {
    setIsTraining(true);
    setTrainingProgress(0);
  };

  const runQuantumCircuit = (circuitName: string) => {
    setQuantumCircuits(prev => 
      prev.map(circuit => 
        circuit.name === circuitName 
          ? { ...circuit, status: 'running' }
          : circuit
      )
    );

    setTimeout(() => {
      setQuantumCircuits(prev => 
        prev.map(circuit => 
          circuit.name === circuitName 
            ? { ...circuit, status: 'complete', fidelity: 95 + Math.random() * 5 }
            : circuit
        )
      );
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hero Section with New Branding */}
      <div className="text-center space-y-6 py-8">
        <div className="flex justify-center">
          <BrandLogo size="xl" animated={true} />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
            MathCore AI Laboratory
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Advanced machine learning algorithms, quantum computing simulations, and AI-powered mathematical research platform
          </p>
          
          <div className="flex justify-center gap-4 flex-wrap">
            <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200 px-4 py-2">
              <Brain className="h-4 w-4 mr-2" />
              Neural Networks
            </Badge>
            <Badge variant="outline" className="bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-purple-200 px-4 py-2">
              <Atom className="h-4 w-4 mr-2" />
              Quantum Computing
            </Badge>
            <Badge variant="outline" className="bg-gradient-to-r from-cyan-50 to-cyan-100 text-cyan-700 border-cyan-200 px-4 py-2">
              <Cpu className="h-4 w-4 mr-2" />
              Real-time Processing
            </Badge>
            <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200 px-4 py-2">
              <Zap className="h-4 w-4 mr-2" />
              AI Enhanced
            </Badge>
          </div>
        </div>

        <div className="flex justify-center">
          <KofiButton size="lg" />
        </div>
      </div>

      {/* Ad Space */}
      <ContentAd />

      {/* Main Laboratory Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-12">
          <TabsTrigger value="overview" className="text-sm">
            <Eye className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="machine-learning" className="text-sm">
            <Brain className="h-4 w-4 mr-2" />
            Machine Learning
          </TabsTrigger>
          <TabsTrigger value="quantum-computing" className="text-sm">
            <Atom className="h-4 w-4 mr-2" />
            Quantum Computing
          </TabsTrigger>
          <TabsTrigger value="data-analysis" className="text-sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Data Analysis
          </TabsTrigger>
          <TabsTrigger value="research" className="text-sm">
            <Target className="h-4 w-4 mr-2" />
            Research Tools
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* System Status */}
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Laboratory Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-white/50 rounded-lg">
                      <Brain className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <div className="text-2xl font-bold text-blue-700">{mlModels.length}</div>
                      <div className="text-sm text-gray-600">ML Models</div>
                    </div>
                    <div className="text-center p-4 bg-white/50 rounded-lg">
                      <Atom className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <div className="text-2xl font-bold text-purple-700">{quantumCircuits.length}</div>
                      <div className="text-sm text-gray-600">Quantum Circuits</div>
                    </div>
                    <div className="text-center p-4 bg-white/50 rounded-lg">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <div className="text-2xl font-bold text-green-700">94.2%</div>
                      <div className="text-sm text-gray-600">Avg Accuracy</div>
                    </div>
                    <div className="text-center p-4 bg-white/50 rounded-lg">
                      <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                      <div className="text-2xl font-bold text-yellow-700">97.5%</div>
                      <div className="text-sm text-gray-600">Quantum Fidelity</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Active Processes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-gray-700" />
                    Active Processes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mlModels.filter(model => model.status === 'training').map((model, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-orange-50 border-orange-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{model.name}</span>
                        <Badge variant="outline" className="bg-orange-100 text-orange-700">
                          Training
                        </Badge>
                      </div>
                      <Progress value={trainingProgress} className="h-2" />
                      <div className="text-sm text-gray-600 mt-1">
                        Epoch {Math.floor(trainingProgress * 2)} • Loss: {(0.2 - trainingProgress * 0.001).toFixed(3)}
                      </div>
                    </div>
                  ))}

                  {quantumCircuits.filter(circuit => circuit.status === 'running').map((circuit, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-purple-50 border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{circuit.name}</span>
                        <Badge variant="outline" className="bg-purple-100 text-purple-700">
                          Executing
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {circuit.qubits} qubits • {circuit.gates.length} gates
                      </div>
                    </div>
                  ))}

                  {mlModels.every(m => m.status !== 'training') && quantumCircuits.every(c => c.status !== 'running') && (
                    <div className="text-center py-8 text-gray-500">
                      <Cpu className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No active processes</p>
                      <p className="text-sm">Start training or run quantum circuits to see activity here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <SidebarAd />
              
              <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
                <CardContent className="pt-6 text-center">
                  <Coffee className="h-10 w-10 mx-auto mb-4 text-pink-600" />
                  <h3 className="font-bold text-lg mb-2">Support MathCore AI</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Help us develop advanced ML and quantum algorithms
                  </p>
                  <KofiButton className="w-full" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full" onClick={startMLTraining} disabled={isTraining}>
                    <Play className="h-4 w-4 mr-2" />
                    Start ML Training
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => runQuantumCircuit('Bell State Generator')}>
                    <Atom className="h-4 w-4 mr-2" />
                    Run Quantum Circuit
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Dataset
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Machine Learning Tab */}
        <TabsContent value="machine-learning" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-600" />
                    Machine Learning Models
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mlModels.map((model, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{model.name}</h3>
                        <Badge 
                          variant="outline" 
                          className={
                            model.status === 'complete' ? 'bg-green-100 text-green-700' :
                            model.status === 'training' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }
                        >
                          {model.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Accuracy</div>
                          <div className="font-bold text-lg">{model.accuracy}%</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Loss</div>
                          <div className="font-bold text-lg">{model.loss}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Epochs</div>
                          <div className="font-bold text-lg">{model.epochs}</div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3 mr-1" />
                          Export
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="h-3 w-3 mr-1" />
                          Configure
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button className="w-full" onClick={startMLTraining} disabled={isTraining}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Model
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Training Console</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isTraining && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Training Progress</span>
                        <span className="text-sm text-gray-600">{Math.round(trainingProgress)}%</span>
                      </div>
                      <Progress value={trainingProgress} className="h-2" />
                      <div className="text-xs text-gray-500">
                        Epoch {Math.floor(trainingProgress * 2)} of 200
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Button className="w-full" onClick={startMLTraining} disabled={isTraining}>
                      {isTraining ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                      {isTraining ? 'Training...' : 'Start Training'}
                    </Button>
                    <Button variant="outline" className="w-full">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset All Models
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <SidebarAd />
            </div>
          </div>
        </TabsContent>

        {/* Quantum Computing Tab */}
        <TabsContent value="quantum-computing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Atom className="h-5 w-5 text-purple-600" />
                    Quantum Circuits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {quantumCircuits.map((circuit, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{circuit.name}</h3>
                        <Badge 
                          variant="outline" 
                          className={
                            circuit.status === 'complete' ? 'bg-green-100 text-green-700' :
                            circuit.status === 'running' ? 'bg-orange-100 text-orange-700' :
                            'bg-blue-100 text-blue-700'
                          }
                        >
                          {circuit.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                        <div>
                          <div className="text-gray-600">Qubits</div>
                          <div className="font-bold text-lg">{circuit.qubits}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Gates</div>
                          <div className="font-bold text-lg">{circuit.gates.length}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Fidelity</div>
                          <div className="font-bold text-lg">{circuit.fidelity}%</div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="text-sm text-gray-600 mb-1">Gate Sequence:</div>
                        <div className="flex gap-1">
                          {circuit.gates.map((gate, gateIndex) => (
                            <Badge key={gateIndex} variant="secondary" className="text-xs">
                              {gate}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => runQuantumCircuit(circuit.name)}
                          disabled={circuit.status === 'running'}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Execute
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          Visualize
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quantum Console</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Qubits</label>
                      <Input type="number" defaultValue="3" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Circuit Type</label>
                      <select className="w-full mt-1 p-2 border rounded-md">
                        <option>Bell State</option>
                        <option>GHZ State</option>
                        <option>Quantum Fourier Transform</option>
                        <option>Grover's Algorithm</option>
                      </select>
                    </div>
                  </div>

                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Circuit
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                <CardContent className="pt-6 text-center">
                  <Atom className="h-10 w-10 mx-auto mb-4 text-purple-600" />
                  <h3 className="font-bold text-lg mb-2">Quantum Research</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Support quantum computing development
                  </p>
                  <KofiButton className="w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Data Analysis Tab */}
        <TabsContent value="data-analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Interactive Data Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <SmartInputValidator
                    value=""
                    onChange={() => {}}
                    placeholder="Upload dataset or enter data points..."
                    type="general"
                    showSuggestions={true}
                  />
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sample Data Points</label>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {dataPoints.map((point, index) => (
                        <div key={index} className="p-2 bg-gray-50 rounded border">
                          x: {point.x}, y: {point.y}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                      <p>Data visualization will appear here</p>
                      <p className="text-sm">Upload data to see interactive charts</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Research Tools Tab */}
        <TabsContent value="research" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Symbolic AI Tool */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Symbolic AI & Theorem Proving
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Mathematical Statement</label>
                  <Input 
                    placeholder="e.g., If x > 0 and y > 0, then x + y > 0"
                    className="font-mono"
                  />
                  <Button className="w-full">
                    <Brain className="h-4 w-4 mr-2" />
                    Prove Statement
                  </Button>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Proof Steps:</h4>
                  <div className="space-y-1 text-sm">
                    <div>1. Given: x > 0 and y > 0</div>
                    <div>2. By addition property: x + y > 0 + 0</div>
                    <div>3. Simplify: x + y > 0</div>
                    <div className="text-green-600 font-medium">✓ Statement proven</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Neural Architecture Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-blue-600" />
                  Neural Architecture Search
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Task Type</label>
                    <select className="w-full p-2 border rounded-md">
                      <option>Image Classification</option>
                      <option>Object Detection</option>
                      <option>Natural Language</option>
                      <option>Time Series</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Search Space</label>
                    <select className="w-full p-2 border rounded-md">
                      <option>MobileNet</option>
                      <option>ResNet</option>
                      <option>Transformer</option>
                      <option>Custom</option>
                    </select>
                  </div>
                </div>
                
                <Button className="w-full">
                  <Layers className="h-4 w-4 mr-2" />
                  Start Architecture Search
                </Button>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Best Architecture Found:</h4>
                  <div className="text-sm space-y-1">
                    <div>• Conv2D(32, 3×3) + ReLU</div>
                    <div>• BatchNorm + MaxPool</div>
                    <div>• Conv2D(64, 3×3) + ReLU</div>
                    <div>• Global Average Pool</div>
                    <div>• Dense(128) + Dropout(0.5)</div>
                    <div className="text-blue-600 font-medium">Accuracy: 94.2%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quantum ML Hybrid */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Atom className="h-5 w-5 text-green-600" />
                  Quantum-Classical Hybrid ML
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Quantum Circuit Depth</label>
                    <Input type="number" placeholder="4" defaultValue="4" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Classical Layers</label>
                    <Input type="number" placeholder="2" defaultValue="2" />
                  </div>
                  <Button className="w-full">
                    <Atom className="h-4 w-4 mr-2" />
                    Train Hybrid Model
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Quantum Advantage</div>
                    <div className="font-bold text-lg">23.5%</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Circuit Fidelity</div>
                    <div className="font-bold text-lg">98.7%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Explainable AI */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-orange-600" />
                  Explainable AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Model Prediction</label>
                  <Input placeholder="Upload model or enter prediction" />
                  <Button className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    Generate Explanation
                  </Button>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Feature Importance:</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Feature A</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full">
                          <div className="w-16 h-2 bg-orange-500 rounded-full"></div>
                        </div>
                        <span className="text-sm">0.8</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Feature B</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full">
                          <div className="w-12 h-2 bg-orange-500 rounded-full"></div>
                        </div>
                        <span className="text-sm">0.6</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Feature C</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full">
                          <div className="w-8 h-2 bg-orange-500 rounded-full"></div>
                        </div>
                        <span className="text-sm">0.4</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Research Tools Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Differential Privacy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-red-600" />
                  Differential Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Epsilon (ε)</label>
                    <Input type="number" placeholder="0.1" step="0.1" defaultValue="0.1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Delta (δ)</label>
                    <Input type="number" placeholder="1e-5" step="0.00001" defaultValue="0.00001" />
                  </div>
                </div>
                
                <Button className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Apply Privacy Protection
                </Button>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Privacy Budget:</h4>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Used: 0.3 / 1.0</span>
                    <span className="text-sm text-green-600">70% remaining</span>
                  </div>
                  <Progress value={30} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Federated Learning */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-teal-600" />
                  Federated Learning
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Number of Clients</label>
                    <Input type="number" placeholder="10" defaultValue="10" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Aggregation Method</label>
                    <select className="w-full p-2 border rounded-md">
                      <option>FedAvg</option>
                      <option>FedProx</option>
                      <option>FedNova</option>
                      <option>SCAFFOLD</option>
                    </select>
                  </div>
                  <Button className="w-full">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Start Federated Training
                  </Button>
                </div>
                
                <div className="bg-teal-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Training Status:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Round 5/10</span>
                      <span className="text-teal-600">Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Clients participating</span>
                      <span>8/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Global accuracy</span>
                      <span className="font-medium">87.3%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default RedesignedMLQuantumLab;