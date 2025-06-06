"use client";

import { type FC } from 'react';
import { Alert } from '@/components/ui/alert';
import { ChevronRight } from 'lucide-react';
import { KatexDisplay } from '@/components/ui/katex-display';
import { type SolutionStep } from '@/types/expression-solver';
import { cn } from '@/lib/utils';

interface SolutionStepsProps {
  steps: SolutionStep[];
  className?: string;
}

const typeToIcon: Record<SolutionStep['type'], string> = {
  simplification: '🔄',
  substitution: '🔀',
  evaluation: '=',
  expansion: '↔️',
  factorization: '📦',
  derivative: '∂'
};

const typeToColor: Record<SolutionStep['type'], string> = {
  simplification: 'text-blue-500 dark:text-blue-400',
  substitution: 'text-purple-500 dark:text-purple-400',
  evaluation: 'text-green-500 dark:text-green-400',
  expansion: 'text-orange-500 dark:text-orange-400',
  factorization: 'text-yellow-500 dark:text-yellow-400',
  derivative: 'text-red-500 dark:text-red-400'
};

export const SolutionSteps: FC<SolutionStepsProps> = ({ steps, className }) => {
  if (!steps.length) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={cn(
            "flex items-start space-x-2 p-2 rounded-md transition-colors",
            "hover:bg-muted/50"
          )}
        >
          <div className={cn(
            "flex items-center justify-center w-6 h-6 rounded-full font-medium",
            typeToColor[step.type]
          )}>
            {typeToIcon[step.type]}
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              {step.description}
            </p>
            <div className="flex items-center space-x-2">
              <KatexDisplay math={step.expression} displayMode={false} />
              {step.result !== step.expression && (
                <>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
          </div>
        </div>
      ))}
    </div>
  );
};
