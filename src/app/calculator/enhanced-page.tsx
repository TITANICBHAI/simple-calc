"use client";
import { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import CalculatorDisplay from '@/components/calculator/calculator-display';
import CalculatorKeypad from '@/components/calculator/calculator-keypad';
import { useCalculator } from '@/hooks/use-calculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calculator, BarChart3, Puzzle, TrendingUp, History, Settings, Brain, Coffee } from 'lucide-react';
import AIMathSolver from '@/components/ai-math-solver';
import Link from 'next/link';
import CalculatorErrorBoundaryWithToast from '@/components/calculator/calculator-error-boundary';
import { KofiButton } from '@/components/ui/kofi-button';
import { SmartInputValidator } from '@/components/smart-input-validator';
import { SmartErrorFeedback } from '@/components/smart-error-feedback';
import { HeaderAd, ContentAd, SidebarAd } from '@/components/ui/adsense-ad';

// Lazy load the calculation engines
const CalculationHistory = lazy(() => import('@/components/calculator/calculation-history'));
const ThreeDGraphingEngine = lazy(() => import('@/components/calculator/3d-graphing-engine').then(m => ({ default: m.ThreeDGraphingEngine })));
const EquationSolverEngine = lazy(() => import('@/components/calculator/equation-solver-engine').then(m => ({ default: m.EquationSolverEngine })));
const StatisticalAnalysisEngine = lazy(() => import('@/components/calculator/statistical-analysis-engine').then(m => ({ default: m.StatisticalAnalysisEngine })));
const PluginArchitectureEngine = lazy(() => import('@/components/calculator/plugin-architecture-engine').then(m => ({ default: m.PluginArchitectureEngine })));
const EnhancedPluginSystem = lazy(() => import('@/components/enhanced-plugin-system'));
const Enhanced3DVisualization = lazy(() => import('@/components/enhanced-3d-visualization'));

export default function EnhancedCalculatorPage() {
  const [activeTab, setActiveTab] = useState('standard');
  const [showHistory, setShowHistory] = useState(false);
  const [mounted, setMounted] = useState(false);

  const {
    expression,
    currentValue,
    handleNumber,
    handleOperator,
    handleEquals,
    handleClear,
    handleBackspace,
    handleDecimal,
    handleSpecialOperation,
    handleMemoryOperation,
    history,
    recallFromHistory,
    clearHistory,
    memoryIndicator,
    angleMode,
  } = useCalculator({ isHigherPrecisionMode: false });

  // Legacy compatibility wrapper
  const handleButtonClick = useCallback((value: string, type: string) => {
    switch (type) {
      case 'number':
        handleNumber(value);
        break;
      case 'operator':
        handleOperator(value);
        break;
      case 'action':
        if (value === '=') handleEquals();
        else if (value === 'C') handleClear();
        else if (value === 'CE') handleBackspace();
        else if (value === '.') handleDecimal();
        break;
      case 'special':
        handleSpecialOperation(value);
        break;
      case 'memory':
        handleMemoryOperation(value);
        break;
    }
  }, [handleNumber, handleOperator, handleEquals, handleClear, handleBackspace, handleDecimal, handleSpecialOperation, handleMemoryOperation]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const key = event.key;
    
    if (key >= '0' && key <= '9') {
      handleButtonClick(key, 'number');
    } else if (['+', '-', '*', '/'].includes(key)) {
      handleButtonClick(key, 'operator');
    } else if (key === 'Enter' || key === '=') {
      event.preventDefault();
      handleButtonClick('=', 'action');
    } else if (key === 'Escape' || key === 'c' || key === 'C') {
      handleClear();
    } else if (key === 'Backspace') {
      handleBackspace();
    } else if (key === '.') {
      handleButtonClick('.', 'number');
    }
  }, [handleButtonClick, handleClear, handleBackspace]);

  useEffect(() => {
    if (mounted) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, mounted]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" />;
  }

  return (
    <CalculatorErrorBoundaryWithToast>
      {/* Floating Ko-fi Button with beautiful animations */}
      <KofiButton variant="floating" />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header */}
        <header className="w-full border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Scientific Calculator</h1>
            </div>
            <div className="flex items-center space-x-2">
              <KofiButton size="sm" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
              >
                <History className="h-4 w-4 mr-2" />
                History
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <TabsList className="grid w-full sm:w-auto grid-cols-4 sm:grid-cols-8">
                <TabsTrigger value="standard" className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  <span className="hidden sm:inline">Standard</span>
                </TabsTrigger>
                <TabsTrigger value="ai-solver" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  <span className="hidden sm:inline">AI Solver</span>
                </TabsTrigger>
                <TabsTrigger value="3d-graphing" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">3D Basic</span>
                </TabsTrigger>
                <TabsTrigger value="enhanced-3d" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">3D Enhanced</span>
                </TabsTrigger>
                <TabsTrigger value="equations" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Equations</span>
                </TabsTrigger>
                <TabsTrigger value="statistics" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Statistics</span>
                </TabsTrigger>
                <TabsTrigger value="plugins" className="flex items-center gap-2">
                  <Puzzle className="h-4 w-4" />
                  <span className="hidden sm:inline">Plugins</span>
                </TabsTrigger>
                <TabsTrigger value="enhanced-plugins" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Enhanced</span>
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="animate-pulse">
                  🎯 All engines active
                </Badge>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-4">
              {/* Main Content Area */}
              <div className="lg:col-span-3">
                <TabsContent value="standard" className="mt-0">
                  <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Calculator className="h-5 w-5" />
                          Standard Calculator
                        </span>
                        <Badge variant="outline">Scientific Mode</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <CalculatorDisplay
                        expression={expression}
                        currentValue={currentValue}
                        memoryIndicator={memoryIndicator}
                        angleMode={angleMode}
                      />
                      
                      <CalculatorKeypad
                        onButtonClick={handleButtonClick}
                        onLongPressCKey={handleClear}
                        isAdvancedMode={true}
                        angleMode={angleMode}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="ai-solver" className="mt-0">
                  <AIMathSolver onSolutionFound={(solution) => {
                    // Optionally integrate with calculator display
                    console.log('AI Solution:', solution);
                  }} />
                </TabsContent>

                <TabsContent value="3d-graphing" className="mt-0">
                  <Suspense fallback={
                    <Card className="p-8 text-center">
                      <div className="animate-spin h-8 w-8 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                      <p>Loading 3D Graphing Engine...</p>
                    </Card>
                  }>
                    <ThreeDGraphingEngine />
                  </Suspense>
                </TabsContent>

                <TabsContent value="equations" className="mt-0">
                  <Suspense fallback={
                    <Card className="p-8 text-center">
                      <div className="animate-spin h-8 w-8 mx-auto mb-4 border-4 border-green-500 border-t-transparent rounded-full"></div>
                      <p>Loading Equation Solver...</p>
                    </Card>
                  }>
                    <EquationSolverEngine />
                  </Suspense>
                </TabsContent>

                <TabsContent value="statistics" className="mt-0">
                  <Suspense fallback={
                    <Card className="p-8 text-center">
                      <div className="animate-spin h-8 w-8 mx-auto mb-4 border-4 border-purple-500 border-t-transparent rounded-full"></div>
                      <p>Loading Statistical Analysis...</p>
                    </Card>
                  }>
                    <StatisticalAnalysisEngine />
                  </Suspense>
                </TabsContent>

                <TabsContent value="plugins" className="mt-0">
                  <Suspense fallback={
                    <Card className="p-8 text-center">
                      <div className="animate-spin h-8 w-8 mx-auto mb-4 border-4 border-orange-500 border-t-transparent rounded-full"></div>
                      <p>Loading Plugin Architecture...</p>
                    </Card>
                  }>
                    <PluginArchitectureEngine />
                  </Suspense>
                </TabsContent>

                <TabsContent value="enhanced-3d" className="mt-0">
                  <Suspense fallback={
                    <Card className="p-8 text-center">
                      <div className="animate-spin h-8 w-8 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                      <p>Loading Enhanced 3D Visualization...</p>
                    </Card>
                  }>
                    <Enhanced3DVisualization />
                  </Suspense>
                </TabsContent>

                <TabsContent value="enhanced-plugins" className="mt-0">
                  <Suspense fallback={
                    <Card className="p-8 text-center">
                      <div className="animate-spin h-8 w-8 mx-auto mb-4 border-4 border-purple-500 border-t-transparent rounded-full"></div>
                      <p>Loading Enhanced Plugin System...</p>
                    </Card>
                  }>
                    <EnhancedPluginSystem />
                  </Suspense>
                </TabsContent>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Calculation History */}
                {showHistory && (
                  <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-lg">History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Suspense fallback={<div className="text-center py-4">Loading...</div>}>
                        <CalculationHistory
                          history={history}
                          onRecall={recallFromHistory}
                          onClearHistory={clearHistory}
                        />
                      </Suspense>
                    </CardContent>
                  </Card>
                )}

                {/* Quick Actions */}
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      onClick={() => setActiveTab('3d-graphing')} 
                      variant="outline" 
                      className="w-full justify-start"
                      size="sm"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Plot 3D Function
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('equations')} 
                      variant="outline" 
                      className="w-full justify-start"
                      size="sm"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Solve System
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('statistics')} 
                      variant="outline" 
                      className="w-full justify-start"
                      size="sm"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analyze Data
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('plugins')} 
                      variant="outline" 
                      className="w-full justify-start"
                      size="sm"
                    >
                      <Puzzle className="h-4 w-4 mr-2" />
                      Add Plugins
                    </Button>
                  </CardContent>
                </Card>

                {/* Features Showcase */}
                <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-lg">✨ New Features</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" size="sm">NEW</Badge>
                      <span>3D Surface Plotting</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" size="sm">NEW</Badge>
                      <span>Linear System Solver</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" size="sm">NEW</Badge>
                      <span>Statistical Analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" size="sm">NEW</Badge>
                      <span>Plugin Architecture</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Support Card */}
                <Card className="bg-gradient-to-br from-pink-50 to-rose-100 border-pink-200">
                  <CardContent className="pt-6 text-center">
                    <div className="mb-4">
                      <div className="text-2xl mb-2">❤️</div>
                      <h3 className="font-semibold text-gray-900">Love this calculator?</h3>
                      <p className="text-sm text-gray-600 mt-1">Support the development!</p>
                    </div>
                    <KofiButton className="w-full" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </Tabs>
        </div>

        {/* Floating Ko-fi Button */}
        <KofiButton variant="floating" />
      </div>
    </CalculatorErrorBoundaryWithToast>
  );
}