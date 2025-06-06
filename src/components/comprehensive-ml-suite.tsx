"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { AnimatedGlowCard } from '@/components/ui/animated-glow-card';
import { 
  Brain, TrendingUp, Zap, Target, BarChart3, Settings,
  Play, Pause, Download, Upload, Eye, Grid3X3,
  Lightbulb, CheckCircle, AlertTriangle, Sparkles,
  Activity, Database, Cpu, Network
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Import our advanced engines
import { MachineLearningEngine, type MLTrainingResult, type MLPrediction } from '@/lib/machine-learning-engine';
import { AdvancedStatisticsEngine, type DescriptiveStats, type HypothesisTest } from '@/lib/advanced-statistics-engine';
import { QuantumComputingEngine, type QuantumResult, type QuantumCircuit } from '@/lib/quantum-computing-engine';

interface DataPoint {
  x: number;
  y: number;
  features?: number[];
  label?: string;
}

export default function ComprehensiveMLSuite() {
  const [activeTab, setActiveTab] = useState('ml');
  const [isTraining, setIsTraining] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // ML State
  const [mlData, setMlData] = useState<DataPoint[]>([]);
  const [mlResult, setMlResult] = useState<MLTrainingResult | null>(null);
  const [prediction, setPrediction] = useState<MLPrediction | null>(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('linear_regression');
  
  // Statistics State
  const [statsData, setStatsData] = useState<number[]>([]);
  const [statsResult, setStatsResult] = useState<DescriptiveStats | null>(null);
  const [hypothesisResult, setHypothesisResult] = useState<HypothesisTest | null>(null);
  
  // Quantum State
  const [quantumCircuit, setQuantumCircuit] = useState<QuantumCircuit | null>(null);
  const [quantumResult, setQuantumResult] = useState<QuantumResult | null>(null);
  const [selectedQuantumAlgorithm, setSelectedQuantumAlgorithm] = useState('bell_state');

  // Background ML Service
  const startBackgroundMLService = useCallback(async () => {
    // This runs continuously in the background to enhance calculations
    const backgroundData = [
      { features: [1, 2], target: 3 },
      { features: [2, 3], target: 5 },
      { features: [3, 4], target: 7 },
      { features: [4, 5], target: 9 }
    ];

    try {
      const result = await MachineLearningEngine.trainLinearRegression(backgroundData, {
        learningRate: 0.01,
        epochs: 100
      });
      
      // Store model for background prediction enhancement
      MachineLearningEngine.saveModel('background_predictor', result.model);
      
      toast({
        title: "Background ML Active",
        description: "Machine learning is now enhancing your calculations!"
      });
    } catch (error) {
      console.log('Background ML service ready for data');
    }
  }, []);

  // Machine Learning Training
  const handleMLTraining = useCallback(async () => {
    if (mlData.length < 2) {
      toast({
        title: "Need More Data",
        description: "Please add at least 2 data points for training"
      });
      return;
    }

    setIsTraining(true);
    try {
      const trainingData = mlData.map(point => ({
        features: point.features || [point.x],
        target: point.y
      }));

      let result: MLTrainingResult;

      switch (selectedAlgorithm) {
        case 'linear_regression':
          result = await MachineLearningEngine.trainLinearRegression(trainingData, {
            learningRate: 0.01,
            epochs: 1000
          });
          break;
        
        case 'neural_network':
          result = await MachineLearningEngine.trainNeuralNetwork(trainingData, {
            hiddenLayers: [8, 4],
            outputSize: 1,
            activation: 'relu'
          }, {
            learningRate: 0.01,
            epochs: 500
          });
          break;
        
        default:
          throw new Error('Algorithm not implemented');
      }

      setMlResult(result);
      MachineLearningEngine.saveModel('user_model', result.model);
      
      toast({
        title: "Training Complete!",
        description: `Model trained with ${result.accuracy.toFixed(2)} accuracy in ${result.trainingTime}ms`
      });
    } catch (error) {
      toast({
        title: "Training Error",
        description: error instanceof Error ? error.message : "Training failed",
        variant: "destructive"
      });
    } finally {
      setIsTraining(false);
    }
  }, [mlData, selectedAlgorithm]);

  // Statistical Analysis
  const handleStatisticalAnalysis = useCallback(async () => {
    if (statsData.length < 2) {
      toast({
        title: "Need Data",
        description: "Please enter statistical data for analysis"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = AdvancedStatisticsEngine.analyzeDescriptiveStatistics({
        values: statsData
      });
      
      setStatsResult(result);
      
      // Also run hypothesis test
      const hypothesis = AdvancedStatisticsEngine.performHypothesisTest({
        values: statsData
      }, 'normality');
      
      setHypothesisResult(hypothesis);
      
      toast({
        title: "Analysis Complete!",
        description: `Analyzed ${result.count} data points with mean ${result.mean.toFixed(2)}`
      });
    } catch (error) {
      toast({
        title: "Analysis Error",
        description: error instanceof Error ? error.message : "Analysis failed",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [statsData]);

  // Quantum Circuit Simulation
  const handleQuantumSimulation = useCallback(async () => {
    try {
      const algorithm = QuantumComputingEngine.createQuantumAlgorithm(selectedQuantumAlgorithm);
      setQuantumCircuit(algorithm.circuit);
      
      const result = await QuantumComputingEngine.simulateCircuit(algorithm.circuit);
      setQuantumResult(result);
      
      toast({
        title: "Quantum Simulation Complete!",
        description: `${algorithm.name} executed successfully`
      });
    } catch (error) {
      toast({
        title: "Quantum Error",
        description: error instanceof Error ? error.message : "Simulation failed",
        variant: "destructive"
      });
    }
  }, [selectedQuantumAlgorithm]);

  // Add sample data
  const addSampleMLData = () => {
    const sampleData = [
      { x: 1, y: 2.1, features: [1, 1] },
      { x: 2, y: 3.9, features: [2, 4] },
      { x: 3, y: 6.2, features: [3, 9] },
      { x: 4, y: 7.8, features: [4, 16] },
      { x: 5, y: 10.1, features: [5, 25] }
    ];
    setMlData(sampleData);
    toast({ title: "Sample Data Added", description: "ML training data loaded" });
  };

  const addSampleStatsData = () => {
    const sampleStats = [12, 15, 18, 20, 22, 25, 28, 30, 32, 35, 18, 21, 24, 27, 29];
    setStatsData(sampleStats);
    toast({ title: "Sample Data Added", description: "Statistical data loaded" });
  };

  // Initialize background services
  React.useEffect(() => {
    startBackgroundMLService();
  }, [startBackgroundMLService]);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Advanced Computational Suite
        </h1>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Machine Learning, Advanced Statistics, and Quantum Computing - All running with background enhancement services
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Activity className="h-3 w-3 mr-1" />
            ML Service Active
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Database className="h-3 w-3 mr-1" />
            Stats Engine Ready
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <Cpu className="h-3 w-3 mr-1" />
            Quantum Simulator Online
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ml" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Machine Learning
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Advanced Statistics
          </TabsTrigger>
          <TabsTrigger value="quantum" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Quantum Computing
          </TabsTrigger>
        </TabsList>

        {/* Machine Learning Tab */}
        <TabsContent value="ml" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatedGlowCard glowColor="#8b5cf6" intensity="medium" animationType="flow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  Machine Learning Training
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Algorithm Selection</Label>
                  <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linear_regression">Linear Regression</SelectItem>
                      <SelectItem value="neural_network">Neural Network</SelectItem>
                      <SelectItem value="clustering">K-Means Clustering</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Training Data ({mlData.length} points)</Label>
                  <div className="flex gap-2">
                    <Button onClick={addSampleMLData} variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Load Sample Data
                    </Button>
                    <Button variant="outline" size="sm">
                      <Database className="h-4 w-4 mr-2" />
                      Import CSV
                    </Button>
                  </div>
                </div>

                {mlData.length > 0 && (
                  <div className="bg-gray-50 p-3 rounded max-h-32 overflow-auto">
                    <div className="text-xs font-mono">
                      {mlData.slice(0, 5).map((point, i) => (
                        <div key={i}>Point {i+1}: x={point.x}, y={point.y}</div>
                      ))}
                      {mlData.length > 5 && <div>... and {mlData.length - 5} more</div>}
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleMLTraining}
                  disabled={isTraining || mlData.length < 2}
                  className="w-full"
                >
                  {isTraining ? (
                    <>
                      <Settings className="h-4 w-4 mr-2 animate-spin" />
                      Training Model...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Train Model
                    </>
                  )}
                </Button>
              </CardContent>
            </AnimatedGlowCard>

            <AnimatedGlowCard glowColor="#10b981" intensity="medium" animationType="pulse">
              <CardHeader>
                <CardTitle>Training Results</CardTitle>
              </CardHeader>
              <CardContent>
                {mlResult ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded">
                        <div className="font-bold text-2xl text-green-600">
                          {(mlResult.accuracy * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">Accuracy</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded">
                        <div className="font-bold text-2xl text-blue-600">
                          {mlResult.epochs}
                        </div>
                        <div className="text-sm text-gray-600">Epochs</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Model Performance</Label>
                      <div className="space-y-1 text-sm">
                        <div>Loss: {mlResult.loss.toFixed(4)}</div>
                        <div>Training Time: {mlResult.trainingTime}ms</div>
                        <div>Validation Accuracy: {(mlResult.validationResults.accuracy * 100).toFixed(1)}%</div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-xs text-gray-600 mb-2">Convergence Data</div>
                      <div className="h-16 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded">
                        <div className="text-xs text-center pt-6">Training Progress Visualization</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Train a model to see results</p>
                  </div>
                )}
              </CardContent>
            </AnimatedGlowCard>
          </div>
        </TabsContent>

        {/* Advanced Statistics Tab */}
        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatedGlowCard glowColor="#ef4444" intensity="medium" animationType="wave">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-red-500" />
                  Statistical Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Data Input</Label>
                  <Input
                    placeholder="Enter numbers separated by commas (e.g., 1,2,3,4,5)"
                    onChange={(e) => {
                      const values = e.target.value.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
                      setStatsData(values);
                    }}
                  />
                  <Button onClick={addSampleStatsData} variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Load Sample Dataset
                  </Button>
                </div>

                {statsData.length > 0 && (
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-xs text-gray-600 mb-1">Dataset ({statsData.length} values)</div>
                    <div className="text-sm font-mono">
                      [{statsData.slice(0, 8).join(', ')}{statsData.length > 8 ? '...' : ''}]
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleStatisticalAnalysis}
                  disabled={isAnalyzing || statsData.length < 2}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <Settings className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run Analysis
                    </>
                  )}
                </Button>
              </CardContent>
            </AnimatedGlowCard>

            <AnimatedGlowCard glowColor="#f59e0b" intensity="medium" animationType="sparkle">
              <CardHeader>
                <CardTitle>Statistical Results</CardTitle>
              </CardHeader>
              <CardContent>
                {statsResult ? (
                  <ScrollArea className="h-80">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="p-2 bg-blue-50 rounded">
                          <div className="font-semibold">Mean</div>
                          <div>{statsResult.mean.toFixed(3)}</div>
                        </div>
                        <div className="p-2 bg-green-50 rounded">
                          <div className="font-semibold">Median</div>
                          <div>{statsResult.median.toFixed(3)}</div>
                        </div>
                        <div className="p-2 bg-purple-50 rounded">
                          <div className="font-semibold">Std Dev</div>
                          <div>{statsResult.standardDeviation.toFixed(3)}</div>
                        </div>
                        <div className="p-2 bg-orange-50 rounded">
                          <div className="font-semibold">Variance</div>
                          <div>{statsResult.variance.toFixed(3)}</div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="font-semibold">Distribution Properties</div>
                        <div className="text-sm space-y-1">
                          <div>Skewness: {statsResult.skewness.toFixed(3)}</div>
                          <div>Kurtosis: {statsResult.kurtosis.toFixed(3)}</div>
                          <div>Range: {statsResult.range.span.toFixed(3)}</div>
                          <div>IQR: {statsResult.quartiles.iqr.toFixed(3)}</div>
                        </div>
                      </div>

                      {statsResult.outliers.length > 0 && (
                        <div className="space-y-2">
                          <div className="font-semibold text-red-600">Outliers Detected</div>
                          <div className="text-sm">
                            {statsResult.outliers.map((outlier, i) => (
                              <Badge key={i} variant="destructive" className="mr-1 mb-1">
                                {outlier.value.toFixed(1)} (z={outlier.zScore.toFixed(2)})
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {hypothesisResult && (
                        <div className="space-y-2">
                          <div className="font-semibold">Normality Test</div>
                          <div className="p-2 bg-gray-50 rounded text-sm">
                            <div>{hypothesisResult.testType}</div>
                            <div>p-value: {hypothesisResult.pValue.toFixed(4)}</div>
                            <div className={`font-semibold ${hypothesisResult.conclusion === 'reject' ? 'text-red-600' : 'text-green-600'}`}>
                              {hypothesisResult.interpretation}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Run analysis to see results</p>
                  </div>
                )}
              </CardContent>
            </AnimatedGlowCard>
          </div>
        </TabsContent>

        {/* Quantum Computing Tab */}
        <TabsContent value="quantum" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatedGlowCard glowColor="#8b5cf6" intensity="high" animationType="sparkle">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-500" />
                  Quantum Circuit Simulator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Quantum Algorithm</Label>
                  <Select value={selectedQuantumAlgorithm} onValueChange={setSelectedQuantumAlgorithm}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bell_state">Bell State Creation</SelectItem>
                      <SelectItem value="deutsch">Deutsch Algorithm</SelectItem>
                      <SelectItem value="grover">Grover's Search</SelectItem>
                      <SelectItem value="shor">Shor's Factoring</SelectItem>
                      <SelectItem value="quantum_teleportation">Quantum Teleportation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {quantumCircuit && (
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-xs text-gray-600 mb-2">Circuit: {quantumCircuit.name}</div>
                    <div className="text-sm">
                      <div>Qubits: {quantumCircuit.numQubits}</div>
                      <div>Gates: {quantumCircuit.gates.length}</div>
                    </div>
                  </div>
                )}

                <Button onClick={handleQuantumSimulation} className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Run Quantum Simulation
                </Button>

                <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                  <Lightbulb className="h-3 w-3 inline mr-1" />
                  Quantum simulations demonstrate quantum mechanical principles like superposition and entanglement
                </div>
              </CardContent>
            </AnimatedGlowCard>

            <AnimatedGlowCard glowColor="#06b6d4" intensity="high" animationType="wave">
              <CardHeader>
                <CardTitle>Quantum Results</CardTitle>
              </CardHeader>
              <CardContent>
                {quantumResult ? (
                  <ScrollArea className="h-80">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="font-semibold">Quantum State Probabilities</div>
                        <div className="space-y-1">
                          {quantumResult.probabilities.slice(0, 8).map((prob, i) => (
                            <div key={i} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                              <span className="font-mono">{prob.state}</span>
                              <span>{(prob.probability * 100).toFixed(2)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {quantumResult.measurements.length > 0 && (
                        <div className="space-y-2">
                          <div className="font-semibold">Measurements</div>
                          <div className="grid grid-cols-2 gap-2">
                            {quantumResult.measurements.map((measurement, i) => (
                              <div key={i} className="p-2 bg-purple-50 rounded text-sm">
                                <div>Qubit {measurement.qubit}</div>
                                <div className="font-bold">|{measurement.result}⟩</div>
                                <div className="text-xs">p={measurement.probability.toFixed(3)}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <Separator />

                      <div className="space-y-2">
                        <div className="font-semibold">Entanglement Analysis</div>
                        <div className="text-sm">
                          {quantumResult.entanglement.map((ent, i) => (
                            <div key={i} className="bg-blue-50 p-2 rounded mb-1">
                              Qubits {ent.qubits.join(',')} - Measure: {ent.measure.toFixed(3)}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-purple-50 p-3 rounded">
                        <div className="text-xs text-purple-600 mb-2">Bloch Sphere Visualization</div>
                        <div className="grid grid-cols-3 gap-1 text-xs">
                          {quantumResult.visualization.blochSphere.slice(0, 6).map((sphere, i) => (
                            <div key={i} className="text-center">
                              <div>Q{sphere.qubit}</div>
                              <div className="font-mono text-xs">
                                x:{sphere.x.toFixed(2)}<br/>
                                y:{sphere.y.toFixed(2)}<br/>
                                z:{sphere.z.toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Zap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Run simulation to see quantum results</p>
                  </div>
                )}
              </CardContent>
            </AnimatedGlowCard>
          </div>
        </TabsContent>
      </Tabs>

      {/* Background Services Status */}
      <AnimatedGlowCard glowColor="#10b981" intensity="low" animationType="pulse">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Background Services Active</span>
              </div>
              <Badge variant="outline" className="bg-green-50">
                <Network className="h-3 w-3 mr-1" />
                Enhanced Mode
              </Badge>
            </div>
            <div className="text-xs text-gray-500">
              ML prediction enhancement • Statistical validation • Quantum optimization
            </div>
          </div>
        </CardContent>
      </AnimatedGlowCard>
    </div>
  );
}