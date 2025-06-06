"use client";

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, Lightbulb, X, RefreshCw } from 'lucide-react';
import { aiService, type AIResponse } from '@/lib/ai-service';
import { cn } from '@/lib/utils';

interface SmartErrorFeedbackProps {
  error?: string;
  input?: string;
  errorType?: 'syntax' | 'mathematical' | 'computation' | 'general';
  onRetry?: () => void;
  onCorrection?: (correctedInput: string) => void;
  className?: string;
  showAIHelp?: boolean;
}

export function SmartErrorFeedback({
  error,
  input,
  errorType = 'general',
  onRetry,
  onCorrection,
  className,
  showAIHelp = true
}: SmartErrorFeedbackProps) {
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (error && input && showAIHelp) {
      getAIHelp();
    }
  }, [error, input, showAIHelp]);

  const getAIHelp = async () => {
    if (!input || !error) return;
    
    setIsLoading(true);
    try {
      const response = await aiService.getErrorCorrection(input, errorType);
      setAiResponse(response);
    } catch (err) {
      console.error('AI help failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const extractCorrectedVersion = (aiText: string) => {
    // Try to extract corrected version from AI response
    const patterns = [
      /corrected version:?\s*["']?([^"'\n]+)["']?/i,
      /should be:?\s*["']?([^"'\n]+)["']?/i,
      /try:?\s*["']?([^"'\n]+)["']?/i,
    ];

    for (const pattern of patterns) {
      const match = aiText.match(pattern);
      if (match) return match[1].trim();
    }
    return null;
  };

  if (!error) return null;

  return (
    <div className={cn(
      "border rounded-lg p-4 space-y-3 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
      className
    )}>
      {/* Error Header */}
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-red-800 dark:text-red-300">
            {errorType === 'syntax' ? 'Syntax Error' :
             errorType === 'mathematical' ? 'Mathematical Error' :
             errorType === 'computation' ? 'Computation Error' :
             'Error'}
          </h4>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            {error}
          </p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-800/30 transition-colors"
            title="Retry"
          >
            <RefreshCw className="h-4 w-4 text-red-600 dark:text-red-400" />
          </button>
        )}
      </div>

      {/* AI Help Section */}
      {showAIHelp && (
        <div className="border-t border-red-200 dark:border-red-800 pt-3">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Getting smart suggestions...
            </div>
          ) : aiResponse?.success ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-red-800 dark:text-red-300">
                  AI Assistant
                </span>
                {aiResponse.provider && (
                  <span className="text-xs text-red-600/70 dark:text-red-400/70">
                    • {aiResponse.provider}
                  </span>
                )}
              </div>
              
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-md p-3 text-sm">
                <p className="text-red-700 dark:text-red-300">
                  {aiResponse.result}
                </p>
                
                {/* Auto-correct button */}
                {onCorrection && (() => {
                  const corrected = extractCorrectedVersion(aiResponse.result || '');
                  return corrected ? (
                    <button
                      onClick={() => onCorrection(corrected)}
                      className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-md transition-colors"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Apply Correction
                    </button>
                  ) : null;
                })()}
              </div>
            </div>
          ) : aiResponse && !aiResponse.success ? (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <Info className="h-4 w-4" />
              AI help temporarily unavailable
            </div>
          ) : null}
        </div>
      )}

      {/* Error Details Toggle */}
      {error.length > 100 && (
        <div className="border-t border-red-200 dark:border-red-800 pt-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
          
          {showDetails && (
            <div className="mt-2 p-2 bg-red-100/50 dark:bg-red-900/30 rounded text-xs font-mono text-red-700 dark:text-red-300 whitespace-pre-wrap">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SmartErrorFeedback;