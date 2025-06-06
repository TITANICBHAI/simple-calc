"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Check, X, AlertCircle, Lightbulb, Loader2 } from 'lucide-react';
import { aiService, type AIResponse } from '@/lib/ai-service';
import { cn } from '@/lib/utils';

interface SmartInputValidatorProps {
  value: string;
  onChange: (value: string) => void;
  onValidation?: (isValid: boolean, feedback?: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  type?: 'expression' | 'equation' | 'general';
  showSuggestions?: boolean;
}

export function SmartInputValidator({
  value,
  onChange,
  onValidation,
  placeholder = "Enter mathematical expression...",
  className,
  disabled = false,
  type = 'expression',
  showSuggestions = true
}: SmartInputValidatorProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<AIResponse | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);

  // Debounced validation
  const validateInput = useCallback(async (inputValue: string) => {
    if (!inputValue.trim() || inputValue.length < 2) {
      setValidationResult(null);
      setShowFeedback(false);
      return;
    }

    setIsValidating(true);
    try {
      const result = await aiService.validateExpression(inputValue);
      setValidationResult(result);
      setShowFeedback(true);
      
      if (onValidation) {
        const isValid = result.success && (result.result?.includes('✅') ?? false);
        onValidation(isValid, result.result);
      }

      // Get suggestions if enabled
      if (showSuggestions && result.success) {
        const suggestionsResult = await aiService.suggestOperations(inputValue);
        if (suggestionsResult.success && suggestionsResult.result) {
          const suggestionLines = suggestionsResult.result
            .split('\n')
            .filter(line => line.trim())
            .slice(0, 3);
          setSuggestions(suggestionLines);
        }
      }
    } catch (error) {
      console.error('Validation error:', error);
      setValidationResult({
        success: false,
        error: 'Validation temporarily unavailable'
      });
    } finally {
      setIsValidating(false);
    }
  }, [onValidation, showSuggestions]);

  // Debounce validation calls
  useEffect(() => {
    const timer = setTimeout(() => {
      validateInput(value);
    }, 1000);

    return () => clearTimeout(timer);
  }, [value, validateInput]);

  const getValidationIcon = () => {
    if (isValidating) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }

    if (!validationResult) return null;

    if (validationResult.success && validationResult.result?.includes('✅')) {
      return <Check className="h-4 w-4 text-green-500" />;
    }

    if (validationResult.success && validationResult.result?.includes('❌')) {
      return <X className="h-4 w-4 text-red-500" />;
    }

    return <AlertCircle className="h-4 w-4 text-yellow-500" />;
  };

  const getInputBorderColor = () => {
    if (!validationResult) return 'border-gray-300';
    
    if (validationResult.success && validationResult.result?.includes('✅')) {
      return 'border-green-500';
    }
    
    if (validationResult.success && validationResult.result?.includes('❌')) {
      return 'border-red-500';
    }
    
    return 'border-yellow-500';
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full px-4 py-3 pr-12 rounded-lg border-2 transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-blue-500/20",
            "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
            getInputBorderColor(),
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
        />
        
        {/* Validation Icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {getValidationIcon()}
        </div>
      </div>

      {/* Feedback */}
      {showFeedback && validationResult && (
        <div className={cn(
          "p-3 rounded-lg border text-sm transition-all duration-200",
          validationResult.success && validationResult.result?.includes('✅') 
            ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300"
            : validationResult.success && validationResult.result?.includes('❌')
            ? "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
            : "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300"
        )}>
          <div className="flex items-start gap-2">
            {getValidationIcon()}
            <div className="flex-1">
              {validationResult.success ? (
                <p>{validationResult.result}</p>
              ) : (
                <p>AI feedback temporarily unavailable. Using {validationResult.provider || 'fallback'} validation.</p>
              )}
              {validationResult.provider && (
                <p className="text-xs opacity-75 mt-1">
                  Powered by {validationResult.provider}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && showSuggestions && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
              Smart Suggestions
            </span>
          </div>
          <div className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  // Extract operation from suggestion if possible
                  const operation = suggestion.match(/([^:]+)/)?.[1]?.trim();
                  if (operation) {
                    onChange(operation);
                  }
                }}
                className="block w-full text-left text-xs text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SmartInputValidator;