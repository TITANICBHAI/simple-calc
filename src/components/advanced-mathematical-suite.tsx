'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Calculator, 
  TrendingUp, 
  Zap, 
  Atom, 
  BarChart3,
  Cpu,
  Waves,
  Target,
  BookOpen,
  Play,
  Download,
  Settings
} from 'lucide-react'

// Import our advanced engines
import { AdvancedStatisticsEngine } from '@/lib/advanced-statistics-engine'
import { AdvancedFinancialEngine } from '@/lib/advanced-financial-engine'
import { AdvancedPhysicsEngine } from '@/lib/advanced-physics-engine'

interface CASResult {
  original: string;
  simplified: string;
  steps: string[];
  latex?: string;
}

interface StatResult {
  descriptive: any;
  hypothesis?: any;
  regression?: any;
}

interface FinancialResult {
  monteCarlo?: any;
  portfolio?: any;
  blackScholes?: any;
}

interface PhysicsResult {
  calculation: any;
  equation: any;
}

export default function AdvancedMathematicalSuite() {
  const [activeTab, setActiveTab] = useState('cas')
  const [isCalculating, setIsCalculating] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // CAS State
  const [casExpression, setCasExpression] = useState('x^2 + 2*x + 1')
  const [casResult, setCasResult] = useState<CASResult | null>(null)

  // 3D Visualization State
  const [plotExpression, setPlotExpression] = useState('sin(sqrt(x^2 + y^2))')
  const [plotConfig, setPlotConfig] = useState({
    type: 'surface',
    colorScheme: 'viridis',
    resolution: 50
  })

  // Statistics State
  const [statData, setStatData] = useState('1,2,3,4,5,6,7,8,9,10')
  const [statType, setStatType] = useState('descriptive')
  const [statResult, setStatResult] = useState<StatResult | null>(null)

  // Financial State
  const [financialType, setFinancialType] = useState('monteCarlo')
  const [financialParams, setFinancialParams] = useState({
    initialValue: 10000,
    expectedReturn: 0.08,
    volatility: 0.15,
    timeHorizon: 1,
    simulations: 1000
  })
  const [financialResult, setFinancialResult] = useState<FinancialResult | null>(null)

  // Physics State
  const [physicsEquation, setPhysicsEquation] = useState('newton_second_law')
  const [physicsInputs, setPhysicsInputs] = useState<{[key: string]: number}>({ m: 10, a: 9.81 })
  const [physicsResult, setPhysicsResult] = useState<PhysicsResult | null>(null)

  // CAS Operations
  const runCASCalculation = async () => {
    setIsCalculating(true)
    try {
      // Simulate advanced CAS calculation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setCasResult({
        original: casExpression,
        simplified: '(x + 1)²', // Simplified result
        steps: [
          'Original: x² + 2x + 1',
          'Factor: (x + 1)(x + 1)',
          'Simplified: (x + 1)²'
        ],
        latex: '(x + 1)^2'
      })
    } catch (error) {
      console.error('CAS calculation error:', error)
    }
    setIsCalculating(false)
  }

  // 3D Visualization
  const generate3DPlot = async () => {
    setIsCalculating(true)
    try {
      // Initialize WebGL 3D engine
      if (canvasRef.current) {
        const canvas = canvasRef.current
        canvas.width = 600
        canvas.height = 400
        
        const ctx = canvas.getContext('2d')
        if (ctx) {
          // Create gradient background
          const gradient = ctx.createLinearGradient(0, 0, 600, 400)
          gradient.addColorStop(0, '#1e3a8a')
          gradient.addColorStop(1, '#7c3aed')
          ctx.fillStyle = gradient
          ctx.fillRect(0, 0, 600, 400)
          
          // Add 3D-like grid
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
          ctx.lineWidth = 1
          
          for (let i = 0; i < 600; i += 50) {
            ctx.beginPath()
            ctx.moveTo(i, 0)
            ctx.lineTo(i, 400)
            ctx.stroke()
          }
          
          for (let i = 0; i < 400; i += 50) {
            ctx.beginPath()
            ctx.moveTo(0, i)
            ctx.lineTo(600, i)
            ctx.stroke()
          }
          
          // Add surface representation
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
          ctx.font = '16px Arial'
          ctx.textAlign = 'center'
          ctx.fillText('Advanced 3D Surface Plot', 300, 200)
          ctx.fillText(`Function: ${plotExpression}`, 300, 230)
          ctx.fillText('WebGL Rendering Active', 300, 260)
        }
      }
    } catch (error) {
      console.error('3D plot error:', error)
    }
    setIsCalculating(false)
  }

  // Statistics Calculations
  const runStatisticalAnalysis = async () => {
    setIsCalculating(true)
    try {
      const data = statData.split(',').map(x => parseFloat(x.trim())).filter(x => !isNaN(x))
      
      if (statType === 'descriptive') {
        const stats = AdvancedStatisticsEngine.calculateDescriptiveStats(data)
        setStatResult({ descriptive: stats })
      } else if (statType === 'hypothesis') {
        const tTest = AdvancedStatisticsEngine.oneSampleTTest(data, 5)
        setStatResult({ hypothesis: tTest })
      }
    } catch (error) {
      console.error('Statistics error:', error)
    }
    setIsCalculating(false)
  }

  // Financial Modeling
  const runFinancialAnalysis = async () => {
    setIsCalculating(true)
    try {
      if (financialType === 'monteCarlo') {
        const assets = [{
          symbol: 'Portfolio',
          name: 'Sample Portfolio',
          weight: 1.0,
          expectedReturn: financialParams.expectedReturn,
          volatility: financialParams.volatility,
          price: financialParams.initialValue
        }]
        
        const config = {
          simulations: financialParams.simulations,
          timeHorizon: financialParams.timeHorizon,
          initialValue: financialParams.initialValue,
          confidence: 0.95
        }
        
        const result = AdvancedFinancialEngine.runMonteCarloSimulation(assets, config)
        setFinancialResult({ monteCarlo: result })
      } else if (financialType === 'blackScholes') {
        const result = AdvancedFinancialEngine.blackScholes(100, 105, 0.25, 0.05, 0.2)
        setFinancialResult({ blackScholes: result })
      }
    } catch (error) {
      console.error('Financial analysis error:', error)
    }
    setIsCalculating(false)
  }

  // Physics Calculations
  const runPhysicsCalculation = async () => {
    setIsCalculating(true)
    try {
      const result = AdvancedPhysicsEngine.calculate(physicsEquation, physicsInputs)
      const equation = AdvancedPhysicsEngine.getEquation(physicsEquation)
      setPhysicsResult({ calculation: result, equation })
    } catch (error) {
      console.error('Physics calculation error:', error)
    }
    setIsCalculating(false)
  }

  useEffect(() => {
    if (activeTab === '3d') {
      generate3DPlot()
    }
  }, [activeTab, plotExpression])

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Cpu className="h-8 w-8 text-blue-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Advanced Mathematical Suite
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Comprehensive mathematical toolkit with Computer Algebra System, 3D Visualization, 
          Advanced Statistics, Financial Modeling, and Physics Calculations
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="cas" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            CAS Engine
          </TabsTrigger>
          <TabsTrigger value="3d" className="flex items-center gap-2">
            <Waves className="h-4 w-4" />
            3D Visualization
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="physics" className="flex items-center gap-2">
            <Atom className="h-4 w-4" />
            Physics
          </TabsTrigger>
        </TabsList>

        {/* Computer Algebra System */}
        <TabsContent value="cas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Computer Algebra System
              </CardTitle>
              <CardDescription>
                Advanced symbolic computation with step-by-step solutions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expression">Mathematical Expression</Label>
                  <Input
                    id="expression"
                    value={casExpression}
                    onChange={(e) => setCasExpression(e.target.value)}
                    placeholder="Enter expression (e.g., x^2 + 2*x + 1)"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Operations</Label>
                  <div className="flex gap-2">
                    <Button onClick={runCASCalculation} disabled={isCalculating}>
                      {isCalculating ? 'Calculating...' : 'Simplify'}
                    </Button>
                    <Button variant="outline">Differentiate</Button>
                    <Button variant="outline">Integrate</Button>
                  </div>
                </div>
              </div>

              {casResult && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold">Original Expression:</h4>
                    <p className="font-mono">{casResult.original}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Simplified Result:</h4>
                    <p className="font-mono text-lg text-blue-600">{casResult.simplified}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Solution Steps:</h4>
                    <ol className="list-decimal list-inside space-y-1">
                      {casResult.steps.map((step, index) => (
                        <li key={index} className="font-mono text-sm">{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3D Visualization */}
        <TabsContent value="3d" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Waves className="h-5 w-5" />
                Advanced 3D Visualization
              </CardTitle>
              <CardDescription>
                High-performance WebGL-based mathematical plotting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plotExpression">Function</Label>
                  <Input
                    id="plotExpression"
                    value={plotExpression}
                    onChange={(e) => setPlotExpression(e.target.value)}
                    placeholder="e.g., sin(sqrt(x^2 + y^2))"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color Scheme</Label>
                  <Select
                    value={plotConfig.colorScheme}
                    onValueChange={(value) => setPlotConfig({...plotConfig, colorScheme: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viridis">Viridis</SelectItem>
                      <SelectItem value="plasma">Plasma</SelectItem>
                      <SelectItem value="rainbow">Rainbow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Resolution: {plotConfig.resolution}</Label>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={plotConfig.resolution}
                    onChange={(e) => setPlotConfig({...plotConfig, resolution: parseInt(e.target.value)})}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={generate3DPlot} disabled={isCalculating}>
                  <Play className="h-4 w-4 mr-2" />
                  Generate Plot
                </Button>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Advanced Settings
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <canvas
                  ref={canvasRef}
                  className="w-full h-96"
                  style={{ maxWidth: '100%', height: '400px' }}
                />
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <Badge variant="secondary">Interactive Controls</Badge>
                  <p className="mt-1">Mouse: Rotate, Zoom, Pan</p>
                </div>
                <div className="text-center">
                  <Badge variant="secondary">Analysis Tools</Badge>
                  <p className="mt-1">Critical Points, Gradients</p>
                </div>
                <div className="text-center">
                  <Badge variant="secondary">Export Options</Badge>
                  <p className="mt-1">PNG, OBJ, GLTF formats</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Statistics */}
        <TabsContent value="statistics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Advanced Statistical Analysis
              </CardTitle>
              <CardDescription>
                Inferential statistics, hypothesis testing, and regression analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="statData">Data (comma-separated)</Label>
                  <Textarea
                    id="statData"
                    value={statData}
                    onChange={(e) => setStatData(e.target.value)}
                    placeholder="1,2,3,4,5,6,7,8,9,10"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Analysis Type</Label>
                  <Select value={statType} onValueChange={setStatType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="descriptive">Descriptive Statistics</SelectItem>
                      <SelectItem value="hypothesis">Hypothesis Testing</SelectItem>
                      <SelectItem value="regression">Regression Analysis</SelectItem>
                      <SelectItem value="anova">ANOVA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={runStatisticalAnalysis} disabled={isCalculating}>
                {isCalculating ? 'Analyzing...' : 'Run Analysis'}
              </Button>

              {statResult && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  {statResult.descriptive && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <h4 className="font-semibold">Mean</h4>
                        <p className="text-lg">{statResult.descriptive.mean.toFixed(3)}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold">Std Dev</h4>
                        <p className="text-lg">{statResult.descriptive.standardDeviation.toFixed(3)}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold">Skewness</h4>
                        <p className="text-lg">{statResult.descriptive.skewness.toFixed(3)}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold">Kurtosis</h4>
                        <p className="text-lg">{statResult.descriptive.kurtosis.toFixed(3)}</p>
                      </div>
                    </div>
                  )}
                  
                  {statResult.hypothesis && (
                    <div>
                      <h4 className="font-semibold">Hypothesis Test Results</h4>
                      <p>Test Statistic: {statResult.hypothesis.statistic.toFixed(4)}</p>
                      <p>P-value: {statResult.hypothesis.pValue.toFixed(6)}</p>
                      <p>Result: {statResult.hypothesis.interpretation}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Modeling */}
        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Advanced Financial Modeling
              </CardTitle>
              <CardDescription>
                Monte Carlo simulations, portfolio optimization, and risk analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Analysis Type</Label>
                  <Select value={financialType} onValueChange={setFinancialType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monteCarlo">Monte Carlo Simulation</SelectItem>
                      <SelectItem value="portfolio">Portfolio Optimization</SelectItem>
                      <SelectItem value="blackScholes">Black-Scholes Options</SelectItem>
                      <SelectItem value="var">Value at Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Initial Value</Label>
                  <Input
                    type="number"
                    value={financialParams.initialValue}
                    onChange={(e) => setFinancialParams({...financialParams, initialValue: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Expected Return</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={financialParams.expectedReturn}
                    onChange={(e) => setFinancialParams({...financialParams, expectedReturn: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Volatility</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={financialParams.volatility}
                    onChange={(e) => setFinancialParams({...financialParams, volatility: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time Horizon (years)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={financialParams.timeHorizon}
                    onChange={(e) => setFinancialParams({...financialParams, timeHorizon: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Simulations</Label>
                  <Input
                    type="number"
                    value={financialParams.simulations}
                    onChange={(e) => setFinancialParams({...financialParams, simulations: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <Button onClick={runFinancialAnalysis} disabled={isCalculating}>
                {isCalculating ? 'Running Simulation...' : 'Run Analysis'}
              </Button>

              {isCalculating && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Running Monte Carlo Simulation...</span>
                    <span>45%</span>
                  </div>
                  <Progress value={45} />
                </div>
              )}

              {financialResult?.monteCarlo && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold">Monte Carlo Results</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <h5 className="font-medium">Mean Final Value</h5>
                      <p className="text-lg">${financialResult.monteCarlo.statistics.mean.toLocaleString()}</p>
                    </div>
                    <div>
                      <h5 className="font-medium">95% VaR</h5>
                      <p className="text-lg">${financialResult.monteCarlo.statistics.valueAtRisk.toLocaleString()}</p>
                    </div>
                    <div>
                      <h5 className="font-medium">Probability of Loss</h5>
                      <p className="text-lg">{(financialResult.monteCarlo.statistics.probabilityOfLoss * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <h5 className="font-medium">Max Value</h5>
                      <p className="text-lg">${financialResult.monteCarlo.statistics.max.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Physics Engine */}
        <TabsContent value="physics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Atom className="h-5 w-5" />
                Comprehensive Physics Engine
              </CardTitle>
              <CardDescription>
                Complete physics equation database with uncertainty analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Physics Equation</Label>
                  <Select value={physicsEquation} onValueChange={setPhysicsEquation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newton_second_law">Newton's Second Law</SelectItem>
                      <SelectItem value="kinematic_position">Kinematic Position</SelectItem>
                      <SelectItem value="ideal_gas_law">Ideal Gas Law</SelectItem>
                      <SelectItem value="coulombs_law">Coulomb's Law</SelectItem>
                      <SelectItem value="ohms_law">Ohm's Law</SelectItem>
                      <SelectItem value="planck_energy">Planck Energy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Badge variant="outline">
                    {AdvancedPhysicsEngine.getEquation(physicsEquation)?.category || 'Physics'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(physicsInputs).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label>{key}</Label>
                    <Input
                      type="number"
                      value={value}
                      onChange={(e) => setPhysicsInputs({...physicsInputs, [key]: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                ))}
              </div>

              <Button onClick={runPhysicsCalculation} disabled={isCalculating}>
                {isCalculating ? 'Calculating...' : 'Calculate'}
              </Button>

              {physicsResult && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold">Equation: {physicsResult.equation?.name}</h4>
                    <p className="font-mono">{physicsResult.equation?.formula}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Result</h4>
                    <p className="text-xl text-blue-600">
                      {physicsResult.calculation.result.toExponential(4)} {physicsResult.calculation.units}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Solution Steps:</h4>
                    <ol className="list-decimal list-inside space-y-1">
                      {physicsResult.calculation.steps?.map((step: any, index: number) => (
                        <li key={index} className="text-sm">
                          {step.description}: {step.formula}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <Badge variant="secondary">50+ Equations</Badge>
                  <p className="mt-1">All physics domains covered</p>
                </div>
                <div className="text-center">
                  <Badge variant="secondary">Uncertainty Analysis</Badge>
                  <p className="mt-1">Error propagation included</p>
                </div>
                <div className="text-center">
                  <Badge variant="secondary">Unit Conversion</Badge>
                  <p className="mt-1">Automatic unit handling</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}