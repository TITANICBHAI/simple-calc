"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  Lightbulb,
  Download,
  Copy,
  HelpCircle,
  Calculator,
  BarChart3,
  DollarSign,
  Ruler
} from 'lucide-react';

interface ValidationRule {
  pattern: RegExp;
  message: string;
  type: 'error' | 'warning' | 'info';
  suggestion?: string;
}

interface InputExample {
  label: string;
  value: string;
  description: string;
  category: string;
}

interface EnhancedInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type: 'function' | 'equation' | 'data' | 'financial' | 'geometry';
  unit?: string;
  currency?: boolean;
  required?: boolean;
  onValidation?: (isValid: boolean, errors: string[]) => void;
  onExport?: (data: any) => void;
}

const VALIDATION_RULES: Record<string, ValidationRule[]> = {
  function: [
    {
      pattern: /\^/g,
      message: "Use ** for exponents instead of ^",
      type: 'error',
      suggestion: "Replace x^2 with x**2 or use the x² button"
    },
    {
      pattern: /[a-z]+\(/g,
      message: "Make sure function names are valid (sin, cos, tan, log, exp, sqrt, abs)",
      type: 'warning'
    },
    {
      pattern: /\d+[a-z]/g,
      message: "Missing multiplication operator",
      type: 'error',
      suggestion: "Use * for multiplication: 2x should be 2*x"
    },
    {
      pattern: /\([^)]*$/,
      message: "Unmatched parentheses",
      type: 'error'
    }
  ],
  equation: [
    {
      pattern: /^[^=]*$/,
      message: "Equation must contain an equals sign (=)",
      type: 'error'
    },
    {
      pattern: /=.*=/,
      message: "Equation should have only one equals sign",
      type: 'error'
    }
  ],
  data: [
    {
      pattern: /^[\d\s,.-]+$/,
      message: "Data should contain only numbers, commas, spaces, and decimal points",
      type: 'error'
    },
    {
      pattern: /,,/,
      message: "Remove extra commas",
      type: 'warning'
    }
  ],
  financial: [
    {
      pattern: /[^0-9.,%-]/,
      message: "Use only numbers, decimals, commas, and % for financial data",
      type: 'error'
    },
    {
      pattern: /^\d+\.\d{3,}/,
      message: "Consider using only 2 decimal places for currency",
      type: 'warning'
    }
  ],
  geometry: [
    {
      pattern: /^0$|^0\./,
      message: "Dimensions cannot be zero or negative",
      type: 'error'
    },
    {
      pattern: /^-/,
      message: "Negative dimensions are not valid",
      type: 'error'
    }
  ]
};

const INPUT_EXAMPLES: Record<string, InputExample[]> = {
  function: [
    { label: "Quadratic", value: "x**2 + 2*x + 1", description: "Standard quadratic function", category: "Basic" },
    { label: "Trigonometric", value: "sin(x) + cos(2*x)", description: "Combined trig functions", category: "Trigonometry" },
    { label: "Exponential", value: "exp(-x**2/2)", description: "Gaussian-like function", category: "Advanced" },
    { label: "Logarithmic", value: "log(x) + sqrt(x)", description: "Natural log with square root", category: "Advanced" },
    { label: "Rational", value: "1/(x**2 + 1)", description: "Simple rational function", category: "Basic" },
    { label: "Piecewise", value: "abs(x) - 2", description: "Absolute value function", category: "Basic" }
  ],
  equation: [
    { label: "Linear", value: "2*x + 3 = 7", description: "Simple linear equation", category: "Basic" },
    { label: "Quadratic", value: "x**2 + 5*x + 6 = 0", description: "Quadratic equation", category: "Intermediate" },
    { label: "System", value: "x + y = 5, 2*x - y = 1", description: "System of equations", category: "Advanced" },
    { label: "Trigonometric", value: "sin(x) = 0.5", description: "Trig equation", category: "Trigonometry" },
    { label: "Exponential", value: "2**x = 8", description: "Exponential equation", category: "Advanced" }
  ],
  data: [
    { label: "Test Scores", value: "85, 92, 78, 96, 88, 91, 84", description: "Student test scores", category: "Education" },
    { label: "Sales Data", value: "1200, 1350, 980, 1100, 1450", description: "Monthly sales figures", category: "Business" },
    { label: "Measurements", value: "12.5, 13.1, 12.8, 13.0, 12.9", description: "Scientific measurements", category: "Science" },
    { label: "Survey Results", value: "1, 2, 3, 2, 4, 3, 5, 2, 3, 4", description: "Likert scale responses", category: "Research" }
  ],
  financial: [
    { label: "Loan Amount", value: "250000", description: "Home loan principal", category: "Loans" },
    { label: "Interest Rate", value: "3.5%", description: "Annual interest rate", category: "Rates" },
    { label: "Investment", value: "10000.00", description: "Initial investment amount", category: "Investments" },
    { label: "Monthly Payment", value: "1200.50", description: "Monthly payment amount", category: "Payments" }
  ],
  geometry: [
    { label: "Rectangle", value: "length: 10, width: 8", description: "Rectangle dimensions", category: "2D Shapes" },
    { label: "Circle", value: "radius: 5", description: "Circle radius", category: "2D Shapes" },
    { label: "Cylinder", value: "radius: 3, height: 8", description: "Cylinder dimensions", category: "3D Shapes" },
    { label: "Triangle", value: "side1: 3, side2: 4, side3: 5", description: "Triangle sides", category: "2D Shapes" }
  ]
};

const HELPFUL_HINTS: Record<string, string[]> = {
  function: [
    "Use ** for exponents (x**2 instead of x^2)",
    "Multiply explicitly: 2*x instead of 2x",
    "Available functions: sin, cos, tan, log, exp, sqrt, abs",
    "Use parentheses to group operations: sin(2*x + 1)"
  ],
  equation: [
    "Include an equals sign (=) in your equation",
    "For systems, separate equations with commas",
    "Use ** for exponents in equations too",
    "Example: x**2 + 3*x - 4 = 0"
  ],
  data: [
    "Separate values with commas",
    "Use decimal points (not commas) for decimals",
    "Remove any units or labels from numbers",
    "Example: 12.5, 15.2, 18.7, 21.3"
  ],
  financial: [
    "Use decimal format: 1250.00",
    "Percentages can include %: 3.5%",
    "Use commas for thousands: 250,000",
    "Currency formatting is automatic"
  ],
  geometry: [
    "All dimensions must be positive",
    "Specify units when needed",
    "Use format: dimension: value",
    "Example: radius: 5 cm"
  ]
};

export const EnhancedInput: React.FC<EnhancedInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  type,
  unit,
  currency,
  required,
  onValidation,
  onExport
}) => {
  const [focused, setFocused] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [showExamples, setShowExamples] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateInput = (inputValue: string) => {
    const rules = VALIDATION_RULES[type] || [];
    const newErrors: string[] = [];
    const newWarnings: string[] = [];

    if (required && !inputValue.trim()) {
      newErrors.push("This field is required");
    }

    rules.forEach(rule => {
      const matches = inputValue.match(rule.pattern);
      if (matches) {
        if (rule.type === 'error') {
          newErrors.push(rule.message);
        } else if (rule.type === 'warning') {
          newWarnings.push(rule.message);
        }
      }
    });

    setErrors(newErrors);
    setWarnings(newWarnings);
    onValidation?.(newErrors.length === 0, newErrors);
  };

  useEffect(() => {
    validateInput(value);
  }, [value, type, required]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    // Auto-format based on type
    if (type === 'financial' && currency) {
      // Remove non-numeric characters except decimal point
      newValue = newValue.replace(/[^0-9.]/g, '');
      
      // Ensure only one decimal point
      const parts = newValue.split('.');
      if (parts.length > 2) {
        newValue = parts[0] + '.' + parts.slice(1).join('');
      }
      
      // Limit decimal places to 2
      if (parts[1] && parts[1].length > 2) {
        newValue = parts[0] + '.' + parts[1].substring(0, 2);
      }
    }

    onChange(newValue);
  };

  const insertExample = (example: InputExample) => {
    onChange(example.value);
    setShowExamples(false);
    inputRef.current?.focus();
  };

  const formatDisplayValue = (inputValue: string) => {
    if (type === 'financial' && currency && inputValue) {
      const num = parseFloat(inputValue);
      if (!isNaN(num)) {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(num);
      }
    }
    return inputValue;
  };

  const getIcon = () => {
    switch (type) {
      case 'function': return <Calculator className="h-4 w-4" />;
      case 'data': return <BarChart3 className="h-4 w-4" />;
      case 'financial': return <DollarSign className="h-4 w-4" />;
      case 'geometry': return <Ruler className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const examples = INPUT_EXAMPLES[type] || [];
  const hints = HELPFUL_HINTS[type] || [];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="flex items-center gap-2">
          {getIcon()}
          {label}
          {required && <span className="text-red-500">*</span>}
          {unit && <Badge variant="outline" className="text-xs">{unit}</Badge>}
        </Label>
        
        <div className="flex items-center gap-2">
          {value && onExport && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onExport(value)}
            >
              <Download className="h-3 w-3" />
            </Button>
          )}
          
          <Popover open={showExamples} onOpenChange={setShowExamples}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm">
                <Lightbulb className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
              <div className="p-3 border-b">
                <h4 className="font-semibold text-sm">Examples & Hints</h4>
              </div>
              
              <div className="p-3 space-y-3">
                <div>
                  <h5 className="text-xs font-medium text-muted-foreground mb-2">Quick Examples</h5>
                  <div className="grid gap-1">
                    {examples.slice(0, 4).map((example, index) => (
                      <button
                        key={index}
                        onClick={() => insertExample(example)}
                        className="text-left p-2 rounded text-xs hover:bg-gray-50 border"
                      >
                        <div className="font-medium">{example.label}</div>
                        <div className="text-muted-foreground font-mono">{example.value}</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h5 className="text-xs font-medium text-muted-foreground mb-2">Helpful Hints</h5>
                  <div className="space-y-1">
                    {hints.map((hint, index) => (
                      <div key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                        <span className="text-blue-500">•</span>
                        {hint}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm">
                <HelpCircle className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Input Format</h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  {type === 'function' && (
                    <>
                      <p>Enter mathematical functions using:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>** for exponents (x**2)</li>
                        <li>* for multiplication (2*x)</li>
                        <li>Functions: sin, cos, tan, log, exp, sqrt, abs</li>
                      </ul>
                    </>
                  )}
                  {type === 'data' && (
                    <>
                      <p>Enter data as comma-separated values:</p>
                      <p className="font-mono bg-gray-100 p-1 rounded">12.5, 15.2, 18.7</p>
                    </>
                  )}
                  {type === 'financial' && (
                    <>
                      <p>Financial values with proper formatting:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Use decimal points: 1250.00</li>
                        <li>Percentages: 3.5% or 0.035</li>
                        <li>Large numbers: 250,000</li>
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          value={value}
          onChange={handleInputChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={focused ? (examples[0]?.value || placeholder) : placeholder}
          className={`${errors.length > 0 ? 'border-red-500' : warnings.length > 0 ? 'border-yellow-500' : ''}`}
        />
        
        {errors.length === 0 && warnings.length === 0 && value && (
          <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
        )}
        
        {currency && value && type === 'financial' && (
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
            {formatDisplayValue(value)}
          </div>
        )}
      </div>
      
      {focused && examples.length > 0 && (
        <div className="text-xs text-muted-foreground">
          Try: {examples[0].value} — {examples[0].description}
        </div>
      )}
      
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {warnings.length > 0 && errors.length === 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default EnhancedInput;