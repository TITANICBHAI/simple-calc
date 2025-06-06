"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Square,
  Volume2,
  VolumeX,
  Download,
  Share
} from 'lucide-react';

interface SolutionStep {
  id: number;
  title: string;
  explanation: string;
  formula?: string;
  calculation: string;
  result: string;
  highlight?: string[];
  animation?: 'fadeIn' | 'slideIn' | 'highlight' | 'transform';
  duration: number;
}

interface AnimatedSolutionWalkthroughProps {
  problem: string;
  steps: SolutionStep[];
  onComplete?: () => void;
}

export default function AnimatedSolutionWalkthrough({ 
  problem, 
  steps, 
  onComplete 
}: AnimatedSolutionWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showAllSteps, setShowAllSteps] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const stepDuration = (steps[currentStep]?.duration || 3000) / speed;

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && currentStep < steps.length) {
      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + (100 / (stepDuration / 100));
          
          if (newProgress >= 100) {
            if (currentStep < steps.length - 1) {
              setCurrentStep(prev => prev + 1);
              return 0;
            } else {
              setIsPlaying(false);
              onComplete?.();
              return 100;
            }
          }
          
          return newProgress;
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentStep, stepDuration, steps.length, onComplete]);

  const playPause = () => {
    setIsPlaying(!isPlaying);
    if (soundEnabled) {
      // Simple audio feedback
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSl+zPDUaiwGJ4TO8deOSAoSXrXl2KFPFAhKpd/qvmwhBSl+zPDUaiwGKHj');
      audio.play().catch(() => {}); // Ignore errors for now
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setProgress(0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setProgress(0);
    }
  };

  const resetWalkthrough = () => {
    setCurrentStep(0);
    setProgress(0);
    setIsPlaying(false);
  };

  const jumpToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    setProgress(0);
    setIsPlaying(false);
  };

  const exportWalkthrough = () => {
    const walkthroughData = {
      problem,
      steps,
      timestamp: new Date().toISOString(),
      totalDuration: steps.reduce((sum, step) => sum + step.duration, 0)
    };
    
    const blob = new Blob([JSON.stringify(walkthroughData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `solution-walkthrough-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Problem Statement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🎬</span>
            Animated Solution Walkthrough
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-l-4 border-blue-500">
            <h3 className="font-semibold text-lg mb-2">Problem:</h3>
            <p className="text-base">{problem}</p>
          </div>
        </CardContent>
      </Card>

      {/* Main Walkthrough Display */}
      <Card>
        <CardContent className="p-6">
          {/* Step Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline">
                Step {currentStep + 1} of {steps.length}
              </Badge>
              <Badge variant="secondary">
                {Math.round(progress)}% Complete
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Current Step Content */}
          {currentStepData && (
            <div 
              className={`transition-all duration-500 ${
                isPlaying ? 'animate-pulse' : ''
              }`}
              key={currentStep}
            >
              <div className="space-y-4">
                {/* Step Title */}
                <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {currentStepData.title}
                </h2>

                {/* Explanation */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-base leading-relaxed">
                    {currentStepData.explanation}
                  </p>
                </div>

                {/* Formula (if provided) */}
                {currentStepData.formula && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border-l-4 border-yellow-500">
                    <h4 className="font-semibold mb-2">Formula:</h4>
                    <code className="text-base font-mono">{currentStepData.formula}</code>
                  </div>
                )}

                {/* Calculation */}
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border-l-4 border-green-500">
                  <h4 className="font-semibold mb-2">Calculation:</h4>
                  <code className="text-lg font-mono">{currentStepData.calculation}</code>
                </div>

                {/* Result */}
                <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border-l-4 border-purple-500">
                  <h4 className="font-semibold mb-2">Result:</h4>
                  <p className="text-lg font-bold">{currentStepData.result}</p>
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={playPause}
                disabled={steps.length === 0}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={nextStep}
                disabled={currentStep >= steps.length - 1}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={resetWalkthrough}
              >
                <Square className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              
              <select 
                value={speed} 
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="px-2 py-1 text-sm border rounded"
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={exportWalkthrough}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Navigation */}
      {showAllSteps && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">All Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => jumpToStep(index)}
                  className={`p-3 text-left rounded-lg border transition-colors ${
                    index === currentStep
                      ? 'bg-blue-100 dark:bg-blue-950/20 border-blue-300'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="font-semibold text-sm">Step {index + 1}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{step.title}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Toggle All Steps */}
      <div className="text-center">
        <Button
          variant="outline"
          onClick={() => setShowAllSteps(!showAllSteps)}
        >
          {showAllSteps ? 'Hide' : 'Show'} All Steps
        </Button>
      </div>
    </div>
  );
}