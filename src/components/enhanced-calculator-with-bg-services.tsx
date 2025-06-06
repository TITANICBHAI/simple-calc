"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnimatedGlowCard } from '@/components/ui/animated-glow-card';
import { 
  Calculator, Brain, Zap, TrendingUp, CheckCircle, 
  Sparkles, Activity, Eye, Settings
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { backgroundService } from '@/lib/background-enhancement-service';

export default function EnhancedCalculatorWithBGServices() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [bgServiceStatus, setBgServiceStatus] = useState(backgroundService.getStatus());
  const [lastEnhancement, setLastEnhancement] = useState<any>(null);
  const [showEnhancementInfo, setShowEnhancementInfo] = useState(false);

  // Update background service status
  useEffect(() => {
    const interval = setInterval(() => {
      setBgServiceStatus(backgroundService.getStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = performCalculation(operation, currentValue, inputValue);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const performCalculation = useCallback(async (operation: string, firstOperand: number, secondOperand: number) => {
    const values = [firstOperand, secondOperand];
    
    // Get background enhancement
    const enhancement = await backgroundService.enhanceCalculation(operation, values);
    setLastEnhancement(enhancement);

    // Show enhancement notification if significant improvement
    if (enhancement.improvement > 1) {
      setShowEnhancementInfo(true);
      toast({
        title: "Calculation Enhanced!",
        description: `${enhancement.method} improved accuracy by ${enhancement.improvement.toFixed(2)}%`,
        duration: 3000
      });
    }

    // Use enhanced result if confidence is high
    if (enhancement.confidence > 0.8) {
      return enhancement.enhanced;
    }

    // Fallback to standard calculation
    switch (operation) {
      case 'add':
        return firstOperand + secondOperand;
      case 'subtract':
        return firstOperand - secondOperand;
      case 'multiply':
        return firstOperand * secondOperand;
      case 'divide':
        return secondOperand !== 0 ? firstOperand / secondOperand : 0;
      case 'equals':
        return secondOperand;
      default:
        return secondOperand;
    }
  }, []);

  const calculate = async () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = await performCalculation(operation, previousValue, inputValue);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
    setLastEnhancement(null);
    setShowEnhancementInfo(false);
  };

  const getEnhancementBadge = () => {
    if (!lastEnhancement) return null;

    const colors = {
      machine_learning: 'bg-purple-100 text-purple-700 border-purple-200',
      statistical_optimization: 'bg-blue-100 text-blue-700 border-blue-200',
      quantum_optimization: 'bg-pink-100 text-pink-700 border-pink-200',
      basic: 'bg-gray-100 text-gray-700 border-gray-200'
    };

    return (
      <Badge variant="outline" className={colors[lastEnhancement.method as keyof typeof colors] || colors.basic}>
        <Brain className="h-3 w-3 mr-1" />
        {lastEnhancement.method.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Background Services Status */}
      <AnimatedGlowCard 
        glowColor="#10b981" 
        intensity="low" 
        animationType="pulse"
        className="p-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Background Enhancement Active</span>
          </div>
          <div className="flex items-center gap-1">
            {bgServiceStatus.services.machineLearning && (
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-600">
                <Brain className="h-2 w-2 mr-1" />
                ML
              </Badge>
            )}
            {bgServiceStatus.services.statistics && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600">
                <TrendingUp className="h-2 w-2 mr-1" />
                Stats
              </Badge>
            )}
            {bgServiceStatus.services.quantum && (
              <Badge variant="outline" className="text-xs bg-pink-50 text-pink-600">
                <Zap className="h-2 w-2 mr-1" />
                Quantum
              </Badge>
            )}
          </div>
        </div>
        
        {bgServiceStatus.totalEnhancements > 0 && (
          <div className="mt-2 text-xs text-gray-600">
            {bgServiceStatus.totalEnhancements} calculations enhanced • 
            Average improvement: {bgServiceStatus.averageImprovement.toFixed(1)}%
          </div>
        )}
      </AnimatedGlowCard>

      {/* Calculator Display */}
      <AnimatedGlowCard 
        glowColor="#3b82f6" 
        intensity="medium" 
        animationType="flow"
        className="p-6"
      >
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-500" />
              Enhanced Calculator
            </div>
            {getEnhancementBadge()}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Display */}
          <div className="bg-gray-900 text-white p-4 rounded-lg text-right">
            <div className="text-3xl font-mono">{display}</div>
            {showEnhancementInfo && lastEnhancement && (
              <div className="text-xs text-green-400 mt-1">
                Enhanced: {lastEnhancement.confidence > 0.8 ? 'High' : 'Medium'} confidence
              </div>
            )}
          </div>

          {/* Button Grid */}
          <div className="grid grid-cols-4 gap-2">
            {/* Row 1 */}
            <Button variant="outline" onClick={clear} className="bg-red-50 hover:bg-red-100">
              C
            </Button>
            <Button variant="outline" onClick={() => inputOperation('divide')}>
              ÷
            </Button>
            <Button variant="outline" onClick={() => inputOperation('multiply')}>
              ×
            </Button>
            <Button variant="outline" onClick={() => setDisplay(display.slice(0, -1) || '0')}>
              ⌫
            </Button>

            {/* Row 2 */}
            <Button variant="outline" onClick={() => inputNumber('7')}>7</Button>
            <Button variant="outline" onClick={() => inputNumber('8')}>8</Button>
            <Button variant="outline" onClick={() => inputNumber('9')}>9</Button>
            <Button variant="outline" onClick={() => inputOperation('subtract')}>
              −
            </Button>

            {/* Row 3 */}
            <Button variant="outline" onClick={() => inputNumber('4')}>4</Button>
            <Button variant="outline" onClick={() => inputNumber('5')}>5</Button>
            <Button variant="outline" onClick={() => inputNumber('6')}>6</Button>
            <Button variant="outline" onClick={() => inputOperation('add')}>
              +
            </Button>

            {/* Row 4 */}
            <Button variant="outline" onClick={() => inputNumber('1')}>1</Button>
            <Button variant="outline" onClick={() => inputNumber('2')}>2</Button>
            <Button variant="outline" onClick={() => inputNumber('3')}>3</Button>
            <Button 
              className="row-span-2 bg-blue-500 hover:bg-blue-600 text-white"
              onClick={calculate}
            >
              =
            </Button>

            {/* Row 5 */}
            <Button 
              variant="outline" 
              className="col-span-2" 
              onClick={() => inputNumber('0')}
            >
              0
            </Button>
            <Button variant="outline" onClick={() => inputNumber('.')}>
              .
            </Button>
          </div>

          {/* Enhancement Info Toggle */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowEnhancementInfo(!showEnhancementInfo)}
            className="w-full text-xs"
          >
            <Eye className="h-3 w-3 mr-1" />
            {showEnhancementInfo ? 'Hide' : 'Show'} Enhancement Details
          </Button>
        </CardContent>
      </AnimatedGlowCard>

      {/* Enhancement Details */}
      {showEnhancementInfo && lastEnhancement && (
        <AnimatedGlowCard 
          glowColor="#8b5cf6" 
          intensity="low" 
          animationType="sparkle"
          className="p-4"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span className="font-medium">Last Enhancement</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Method</div>
                <div className="font-medium">{lastEnhancement.method.replace('_', ' ')}</div>
              </div>
              <div>
                <div className="text-gray-600">Confidence</div>
                <div className="font-medium">{(lastEnhancement.confidence * 100).toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-gray-600">Original</div>
                <div className="font-medium">{lastEnhancement.original}</div>
              </div>
              <div>
                <div className="text-gray-600">Enhanced</div>
                <div className="font-medium">{lastEnhancement.enhanced}</div>
              </div>
            </div>

            {lastEnhancement.improvement > 0.1 && (
              <div className="bg-green-50 p-2 rounded text-sm">
                <CheckCircle className="h-3 w-3 inline mr-1 text-green-600" />
                Improved accuracy by {lastEnhancement.improvement.toFixed(2)}%
              </div>
            )}
          </div>
        </AnimatedGlowCard>
      )}

      {/* Enhancement Suggestions */}
      <AnimatedGlowCard 
        glowColor="#f59e0b" 
        intensity="low" 
        animationType="pulse"
        className="p-3"
      >
        <div className="text-sm">
          <div className="font-medium mb-2 flex items-center gap-2">
            <Activity className="h-4 w-4 text-orange-500" />
            Smart Suggestions
          </div>
          <div className="space-y-1 text-xs text-gray-600">
            {backgroundService.getEnhancementSuggestions().map((suggestion, i) => (
              <div key={i}>• {suggestion}</div>
            ))}
          </div>
        </div>
      </AnimatedGlowCard>
    </div>
  );
}