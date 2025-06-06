"use client";

import React, { useState, type FC } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronDown, ChevronRight, Info } from 'lucide-react';
import { KatexDisplay } from '@/components/ui/katex-display';
import { type SolutionStep } from '@/types/expression-solver';
import { cn } from '@/lib/utils';

interface StepDisplayProps {
  step: SolutionStep;
  isLast: boolean;
}

const StepDisplay: FC<StepDisplayProps> = ({ step, isLast }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className={cn(
      "p-4 transition-all duration-200",
      isExpanded ? "border-accent/50" : "border-border",
      isLast ? "bg-accent/10" : "hover:bg-muted/50"
    )}>
      <div className="flex items-start gap-4">
        <div className="flex items-center h-6">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? "Collapse step" : "Expand step"}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Step {step.order}
            </span>
            <span className={cn(
              "text-sm font-medium",
              typeToColor[step.type]
            )}>
              ({step.type.charAt(0).toUpperCase() + step.type.slice(1)})
            </span>
          </div>

          <p className="text-sm font-medium">
            {step.description}
          </p>

          {isExpanded && (
            <>
              <Alert variant="default" className="bg-muted/50 py-2">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  {typeToDescription[step.type]}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <div className="flex items-center gap-2 overflow-x-auto p-2 rounded-md bg-muted/30">
                  <KatexDisplay 
                    math={step.expression} 
                    displayMode={false}
                  />
                  {step.result !== step.expression && (
                    <>
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <KatexDisplay 
                        math={String(step.result)} 
                        displayMode={false}
                        className={cn(
                          "font-medium",
                          typeToColor[step.type]
                        )} 
                      />
                    </>
                  )}
                </div>

                {step.type === 'substitution' && (
                  <div className="text-xs text-muted-foreground italic">
                    {step.expression.split('=')[0]} is replaced with {step.expression.split('=')[1]}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

interface ExpressionSolverStepsProps {
  steps: SolutionStep[];
  className?: string;
}

export const ExpressionSolverSteps: FC<ExpressionSolverStepsProps> = ({ steps, className }) => {
  const [showAllSteps, setShowAllSteps] = useState(true);

  if (!steps.length) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Solution Steps</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAllSteps(!showAllSteps)}
          className="text-xs"
        >
          {showAllSteps ? "Hide Details" : "Show Details"}
        </Button>
      </div>
      {showAllSteps && (
        <div className="space-y-1">
          {steps.map((step, index) => (
            <StepDisplay
              key={step.id}
              step={step}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const typeToColor: Record<SolutionStep['type'], string> = {
  'simplification': 'text-blue-500 dark:text-blue-400',
  'substitution': 'text-green-500 dark:text-green-400',
  'evaluation': 'text-purple-500 dark:text-purple-400',
  'expansion': 'text-orange-500 dark:text-orange-400',
  'factorization': 'text-pink-500 dark:text-pink-400',
  'derivative': 'text-red-500 dark:text-red-400'
};

const typeToDescription: Record<SolutionStep['type'], string> = {
  'simplification': 'Simplifying expression using algebraic rules',
  'substitution': 'Replacing variables with their values',
  'evaluation': 'Computing numerical result',
  'expansion': 'Expanding algebraic terms',
  'factorization': 'Factoring the expression',
  'derivative': 'Computing derivative'
};
