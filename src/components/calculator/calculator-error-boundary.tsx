"use client";

import React, { Component, ErrorInfo } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  children: React.ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class CalculatorErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo
    });
    
    // Log error to your preferred error tracking service
    console.error('Calculator Error:', error);
    console.error('Error Details:', errorInfo);
  }

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    this.props.onReset?.();
  };

  public render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription className="space-y-4">
            <p className="text-sm">
              {this.state.error?.message || 'An unexpected error occurred in the calculator.'}
            </p>
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="text-xs mt-2">
                <summary className="cursor-pointer">Technical Details</summary>
                <pre className="mt-2 p-2 bg-black/10 rounded overflow-auto">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            <div className="flex justify-end mt-4">
              <Button 
                onClick={this.handleReset}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RotateCw className="h-4 w-4" />
                Reset Calculator
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

// HOC to provide toast context to error boundary
export default function CalculatorErrorBoundaryWithToast(props: Props) {
  const { toast } = useToast();

  return (
    <CalculatorErrorBoundary
      {...props}
      onReset={() => {
        toast({
          title: "Calculator Reset",
          description: "The calculator has been reset due to an error.",
          variant: "default"
        });
        props.onReset?.();
      }}
    />
  );
}
