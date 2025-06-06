"use client";

import React, { type FC, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { validateVariableValue, suggestVariableValue } from '@/lib/math-parser/variableUtils';

interface VariableInputsProps {
  variables: string[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
  className?: string;
}

export const VariableInputs: FC<VariableInputsProps> = ({
  variables,
  values,
  onChange,
  className
}) => {
  const validateInput = useCallback((value: string) => {
    const result = validateVariableValue(value);
    return {
      isValid: result.isValid,
      message: result.error || 'Valid number'
    };
  }, []);

  if (variables.length === 0) return null;

  return (
    <div className={className}>
      <Label className="text-sm font-medium mb-2 block">
        Variable Values
      </Label>
      <div className="grid grid-cols-2 gap-2">
        {variables.map(variable => {
          const value = values[variable] || '';
          const validation = validateInput(value);

          return (
            <TooltipProvider key={variable}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="space-y-1">
                    <Label 
                      htmlFor={`var-${variable}`}
                      className={`text-xs ${!validation.isValid && value ? 'text-destructive' : ''}`}
                    >
                      {variable} =
                    </Label>
                    <Input
                      id={`var-${variable}`}
                      type="text"
                      inputMode="decimal"
                      value={value}
                      onChange={(e) => onChange(variable, e.target.value)}
                      placeholder={suggestVariableValue(variable)}
                      className={`font-mono ${!validation.isValid && value ? 'border-destructive' : ''}`}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className={!validation.isValid ? 'text-destructive' : ''}>
                    {validation.message}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
};
