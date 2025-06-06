"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calculator, 
  Zap, 
  Target, 
  TrendingUp, 
  BarChart3,
  Grid3X3,
  Sigma,
  DollarSign,
  Percent,
  Calendar,
  Code2,
  Brain,
  Activity,
  PieChart,
  LineChart,
  Hash,
  Compass,
  Ruler,
  Shapes,
  SquareDot,
  Triangle,
  Infinity,
  Binary,
  Calculator as CalcIcon,
  CircuitBoard,
  Layers,
  Settings,
  ChevronDown,
  ChevronUp,
  MoreHorizontal
} from 'lucide-react';

interface CalculatorResult {
  value: string;
  expression: string;
  steps?: string[];
  type: 'number' | 'expression' | 'equation';
}

interface ToolCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  tools: CalculatorTool[];
}

interface CalculatorTool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  component: React.ComponentType<any>;
  priority: number;
}

// Enhanced Basic Calculator Component
const EnhancedBasicCalculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [memory, setMemory] = useState(0);
  const [scientificMode, setScientificMode] = useState(false);
  const [angleMode, setAngleMode] = useState<'deg' | 'rad'>('deg');

  const calculate = useCallback((firstValue: string, secondValue: string, operation: string): string => {
    const first = parseFloat(firstValue);
    const second = parseFloat(secondValue);

    if (isNaN(first) || isNaN(second)) return '0';

    switch (operation) {
      case '+': return (first + second).toString();
      case '-': return (first - second).toString();
      case '×': return (first * second).toString();
      case '÷': return second !== 0 ? (first / second).toString() : 'Error';
      case '^': return Math.pow(first, second).toString();
      case '%': return (first % second).toString();
      default: return secondValue;
    }
  }, []);

  const handleNumber = useCallback((num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  }, [display, waitingForNewValue]);

  const handleOperation = useCallback((nextOperation: string) => {
    const inputValue = display;

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || '0';
      const newValue = calculate(currentValue, inputValue, operation);
      
      setDisplay(newValue);
      setPreviousValue(newValue);
      
      // Add to history
      setHistory(prev => [...prev, `${currentValue} ${operation} ${inputValue} = ${newValue}`].slice(-5));
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  }, [display, previousValue, operation, calculate]);

  const handleEquals = useCallback(() => {
    if (operation && previousValue !== null) {
      const newValue = calculate(previousValue, display, operation);
      setDisplay(newValue);
      setHistory(prev => [...prev, `${previousValue} ${operation} ${display} = ${newValue}`].slice(-5));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  }, [display, previousValue, operation, calculate]);

  const handleFunction = useCallback((func: string) => {
    const value = parseFloat(display);
    let result: number;
    const angleMultiplier = angleMode === 'deg' ? Math.PI / 180 : 1;

    switch (func) {
      case 'sin': result = Math.sin(value * angleMultiplier); break;
      case 'cos': result = Math.cos(value * angleMultiplier); break;
      case 'tan': result = Math.tan(value * angleMultiplier); break;
      case 'asin': result = Math.asin(value) / angleMultiplier; break;
      case 'acos': result = Math.acos(value) / angleMultiplier; break;
      case 'atan': result = Math.atan(value) / angleMultiplier; break;
      case 'sinh': result = Math.sinh(value); break;
      case 'cosh': result = Math.cosh(value); break;
      case 'tanh': result = Math.tanh(value); break;
      case 'log': result = Math.log10(value); break;
      case 'ln': result = Math.log(value); break;
      case 'log2': result = Math.log2(value); break;
      case 'sqrt': result = Math.sqrt(value); break;
      case 'cbrt': result = Math.cbrt(value); break;
      case '1/x': result = 1 / value; break;
      case 'x²': result = value * value; break;
      case 'x³': result = value * value * value; break;
      case 'x!': result = value >= 0 ? factorial(Math.floor(value)) : NaN; break;
      case 'e^x': result = Math.exp(value); break;
      case '10^x': result = Math.pow(10, value); break;
      case '2^x': result = Math.pow(2, value); break;
      case '±': result = -value; break;
      case 'abs': result = Math.abs(value); break;
      case 'floor': result = Math.floor(value); break;
      case 'ceil': result = Math.ceil(value); break;
      case 'round': result = Math.round(value); break;
      case 'π': result = Math.PI; break;
      case 'e': result = Math.E; break;
      case 'rand': result = Math.random(); break;
      default: result = value;
    }

    setDisplay(result.toString());
    setHistory(prev => [...prev, `${func}(${value}) = ${result}`].slice(-5));
    setWaitingForNewValue(true);
  }, [display, angleMode]);

  const factorial = (n: number): number => {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
  };

  const handleMemory = useCallback((action: string) => {
    const value = parseFloat(display);
    
    switch (action) {
      case 'MC': setMemory(0); break;
      case 'MR': setDisplay(memory.toString()); setWaitingForNewValue(true); break;
      case 'M+': setMemory(prev => prev + value); break;
      case 'M-': setMemory(prev => prev - value); break;
      case 'MS': setMemory(value); break;
    }
  }, [display, memory]);

  const basicButtons = [
    // Row 1: Clear and operators
    [
      { label: 'C', type: 'clear', className: 'bg-red-100 text-red-700 hover:bg-red-200' },
      { label: '±', type: 'function', className: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
      { label: '%', type: 'operation', className: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
      { label: '÷', type: 'operation', className: 'bg-blue-100 text-blue-700 hover:bg-blue-200' }
    ],
    // Row 2-4: Numbers and basic operations
    [
      { label: '7', type: 'number', className: 'bg-gray-50 hover:bg-gray-100' },
      { label: '8', type: 'number', className: 'bg-gray-50 hover:bg-gray-100' },
      { label: '9', type: 'number', className: 'bg-gray-50 hover:bg-gray-100' },
      { label: '×', type: 'operation', className: 'bg-blue-100 text-blue-700 hover:bg-blue-200' }
    ],
    [
      { label: '4', type: 'number', className: 'bg-gray-50 hover:bg-gray-100' },
      { label: '5', type: 'number', className: 'bg-gray-50 hover:bg-gray-100' },
      { label: '6', type: 'number', className: 'bg-gray-50 hover:bg-gray-100' },
      { label: '-', type: 'operation', className: 'bg-blue-100 text-blue-700 hover:bg-blue-200' }
    ],
    [
      { label: '1', type: 'number', className: 'bg-gray-50 hover:bg-gray-100' },
      { label: '2', type: 'number', className: 'bg-gray-50 hover:bg-gray-100' },
      { label: '3', type: 'number', className: 'bg-gray-50 hover:bg-gray-100' },
      { label: '+', type: 'operation', className: 'bg-blue-100 text-blue-700 hover:bg-blue-200' }
    ],
    [
      { label: '0', type: 'number', className: 'bg-gray-50 hover:bg-gray-100 col-span-2' },
      { label: '.', type: 'decimal', className: 'bg-gray-50 hover:bg-gray-100' },
      { label: '=', type: 'equals', className: 'bg-green-100 text-green-700 hover:bg-green-200' }
    ]
  ];

  const scientificButtons = [
    // Row 1: Memory functions
    [
      { label: 'MC', type: 'memory', className: 'bg-orange-100 text-orange-700 hover:bg-orange-200 text-xs' },
      { label: 'MR', type: 'memory', className: 'bg-orange-100 text-orange-700 hover:bg-orange-200 text-xs' },
      { label: 'M+', type: 'memory', className: 'bg-orange-100 text-orange-700 hover:bg-orange-200 text-xs' },
      { label: 'M-', type: 'memory', className: 'bg-orange-100 text-orange-700 hover:bg-orange-200 text-xs' },
      { label: 'MS', type: 'memory', className: 'bg-orange-100 text-orange-700 hover:bg-orange-200 text-xs' }
    ],
    // Row 2: Trigonometric functions
    [
      { label: 'sin', type: 'function', className: 'bg-purple-100 text-purple-700 hover:bg-purple-200 text-xs' },
      { label: 'cos', type: 'function', className: 'bg-purple-100 text-purple-700 hover:bg-purple-200 text-xs' },
      { label: 'tan', type: 'function', className: 'bg-purple-100 text-purple-700 hover:bg-purple-200 text-xs' },
      { label: 'asin', type: 'function', className: 'bg-purple-100 text-purple-700 hover:bg-purple-200 text-xs' },
      { label: 'acos', type: 'function', className: 'bg-purple-100 text-purple-700 hover:bg-purple-200 text-xs' }
    ],
    // Row 3: More trig and hyperbolic
    [
      { label: 'atan', type: 'function', className: 'bg-purple-100 text-purple-700 hover:bg-purple-200 text-xs' },
      { label: 'sinh', type: 'function', className: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 text-xs' },
      { label: 'cosh', type: 'function', className: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 text-xs' },
      { label: 'tanh', type: 'function', className: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 text-xs' },
      { label: angleMode, type: 'special', className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 text-xs' }
    ],
    // Row 4: Logarithmic functions
    [
      { label: 'log', type: 'function', className: 'bg-green-100 text-green-700 hover:bg-green-200 text-xs' },
      { label: 'ln', type: 'function', className: 'bg-green-100 text-green-700 hover:bg-green-200 text-xs' },
      { label: 'log2', type: 'function', className: 'bg-green-100 text-green-700 hover:bg-green-200 text-xs' },
      { label: 'e^x', type: 'function', className: 'bg-green-100 text-green-700 hover:bg-green-200 text-xs' },
      { label: '10^x', type: 'function', className: 'bg-green-100 text-green-700 hover:bg-green-200 text-xs' }
    ],
    // Row 5: Power and root functions
    [
      { label: 'x²', type: 'function', className: 'bg-teal-100 text-teal-700 hover:bg-teal-200 text-xs' },
      { label: 'x³', type: 'function', className: 'bg-teal-100 text-teal-700 hover:bg-teal-200 text-xs' },
      { label: 'sqrt', type: 'function', className: 'bg-teal-100 text-teal-700 hover:bg-teal-200 text-xs' },
      { label: 'cbrt', type: 'function', className: 'bg-teal-100 text-teal-700 hover:bg-teal-200 text-xs' },
      { label: '^', type: 'operation', className: 'bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs' }
    ],
    // Row 6: Special functions and constants
    [
      { label: '1/x', type: 'function', className: 'bg-pink-100 text-pink-700 hover:bg-pink-200 text-xs' },
      { label: 'x!', type: 'function', className: 'bg-pink-100 text-pink-700 hover:bg-pink-200 text-xs' },
      { label: 'abs', type: 'function', className: 'bg-pink-100 text-pink-700 hover:bg-pink-200 text-xs' },
      { label: 'π', type: 'function', className: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200 text-xs' },
      { label: 'e', type: 'function', className: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200 text-xs' }
    ]
  ];

  const handleButtonClick = (button: any) => {
    switch (button.type) {
      case 'number':
      case 'decimal':
        handleNumber(button.label);
        break;
      case 'operation':
        handleOperation(button.label);
        break;
      case 'equals':
        handleEquals();
        break;
      case 'function':
        handleFunction(button.label);
        break;
      case 'memory':
        handleMemory(button.label);
        break;
      case 'special':
        if (button.label === 'deg' || button.label === 'rad') {
          setAngleMode(angleMode === 'deg' ? 'rad' : 'deg');
        }
        break;
      case 'clear':
        setDisplay('0');
        setPreviousValue(null);
        setOperation(null);
        setWaitingForNewValue(false);
        break;
    }
  };

  return (
    <div className="space-y-4">
      {/* Display */}
      <div className="bg-gray-900 text-white p-6 rounded-lg">
        <div className="text-sm text-gray-400 mb-1 flex justify-between">
          <span>{operation && previousValue ? `${previousValue} ${operation}` : ''}</span>
          <span className="text-yellow-400">{angleMode.toUpperCase()}</span>
        </div>
        <div className="text-3xl font-mono text-right">{display}</div>
        {memory !== 0 && (
          <div className="text-xs text-blue-400 mt-1">Memory: {memory}</div>
        )}
      </div>

      {/* Scientific Mode Toggle */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => setScientificMode(!scientificMode)}
          className="flex items-center gap-2"
        >
          {scientificMode ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {scientificMode ? 'Hide' : 'Show'} Scientific Functions
        </Button>
      </div>

      {/* Scientific Functions (Expandable) */}
      {scientificMode && (
        <div className="grid grid-cols-5 gap-1 p-3 bg-gray-50 rounded-lg border">
          {scientificButtons.flat().map((button, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className={`h-10 font-semibold ${button.className}`}
              onClick={() => handleButtonClick(button)}
            >
              {button.label}
            </Button>
          ))}
        </div>
      )}

      {/* Basic Calculator Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {basicButtons.flat().map((button, index) => (
          <Button
            key={index}
            variant="outline"
            size="lg"
            className={`h-12 font-semibold ${button.className} ${button.label === '0' ? 'col-span-2' : ''}`}
            onClick={() => handleButtonClick(button)}
          >
            {button.label}
          </Button>
        ))}
      </div>

      {/* History */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Calculations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              {history.map((entry, index) => (
                <div key={index} className="text-gray-600 font-mono">{entry}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Quick Tools Components
const QuickPercentageCalculator: React.FC = () => {
  const [value, setValue] = useState('');
  const [percentage, setPercentage] = useState('');
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const val = parseFloat(value);
    const perc = parseFloat(percentage);
    if (!isNaN(val) && !isNaN(perc)) {
      setResult((val * perc) / 100);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Percent className="h-5 w-5" />
          Quick Percentage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <Input
            placeholder="Percentage"
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
          />
        </div>
        <Button onClick={calculate} className="w-full">Calculate</Button>
        {result !== null && (
          <div className="p-3 bg-green-50 rounded text-center">
            <span className="font-semibold">{percentage}% of {value} = {result}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const QuickTipCalculator: React.FC = () => {
  const [bill, setBill] = useState('');
  const [tip, setTip] = useState('15');
  const [people, setPeople] = useState('1');

  const total = useMemo(() => {
    const billAmount = parseFloat(bill) || 0;
    const tipAmount = (billAmount * parseFloat(tip)) / 100;
    const totalAmount = billAmount + tipAmount;
    const perPerson = totalAmount / (parseFloat(people) || 1);
    
    return {
      tip: tipAmount,
      total: totalAmount,
      perPerson: perPerson
    };
  }, [bill, tip, people]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Tip Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          placeholder="Bill amount"
          value={bill}
          onChange={(e) => setBill(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Tip %"
            value={tip}
            onChange={(e) => setTip(e.target.value)}
          />
          <Input
            placeholder="People"
            value={people}
            onChange={(e) => setPeople(e.target.value)}
          />
        </div>
        {bill && (
          <div className="space-y-2 p-3 bg-blue-50 rounded">
            <div>Tip: ${total.tip.toFixed(2)}</div>
            <div>Total: ${total.total.toFixed(2)}</div>
            <div className="font-semibold">Per Person: ${total.perPerson.toFixed(2)}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Main Hub Component
export default function OptimizedCalculatorHub() {
  const [activeCategory, setActiveCategory] = useState('basic');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const categories: ToolCategory[] = [
    {
      id: 'basic',
      name: 'Basic Calculator',
      icon: <Calculator className="h-5 w-5" />,
      color: 'blue',
      tools: []
    },
    {
      id: 'quick',
      name: 'Quick Tools',
      icon: <Zap className="h-5 w-5" />,
      color: 'green',
      tools: [
        {
          id: 'percentage',
          name: 'Percentage & Discount Calculator',
          description: 'Calculate percentages, discounts, markups, tax rates, and percentage changes. Essential for shopping, business calculations, and financial analysis.',
          icon: <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-200 to-red-200 rounded-full opacity-30 animate-pulse"></div>
            <div className="relative bg-white rounded-full p-1 shadow-sm">
              <Percent className="h-4 w-4 text-orange-600" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 text-xs bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold">%</div>
          </div>,
          component: QuickPercentageCalculator,
          priority: 1
        },
        {
          id: 'tip',
          name: 'Restaurant & Tip Calculator',
          description: 'Calculate tips, split bills among multiple people, add tax, and determine cost per person. Perfect for dining out and service calculations.',
          icon: <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full opacity-40 animate-pulse"></div>
            <div className="relative bg-white rounded-full p-1 shadow-sm">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 text-xs">🍽️</div>
          </div>,
          component: QuickTipCalculator,
          priority: 2
        },
        {
          id: 'unit-converter',
          name: 'Measurement Converter',
          description: 'Convert between metric and imperial units for length, weight, temperature, volume, area, and speed. Includes cooking measurements and scientific units.',
          icon: <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full opacity-40 animate-pulse"></div>
            <div className="relative bg-white rounded-full p-1 shadow-sm">
              <Ruler className="h-4 w-4 text-blue-600" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 text-xs">⇄</div>
          </div>,
          component: QuickPercentageCalculator, // Placeholder
          priority: 3
        },
        {
          id: 'time-calculator',
          name: 'Time & Date Calculator',
          description: 'Calculate time differences, add/subtract time periods, work with business days, and convert time zones. Perfect for project planning.',
          icon: <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-40 animate-pulse"></div>
            <div className="relative bg-white rounded-full p-1 shadow-sm">
              <Calendar className="h-4 w-4 text-purple-600" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 text-xs bg-purple-500 text-white rounded-full w-4 h-4 flex items-center justify-center">⏰</div>
          </div>,
          component: QuickPercentageCalculator, // Placeholder
          priority: 4
        }
      ]
    },
    {
      id: 'advanced',
      name: 'Advanced Mathematics',
      icon: <Brain className="h-5 w-5" />,
      color: 'purple',
      tools: [
        {
          id: 'matrix-calculator',
          name: 'Matrix & Linear Algebra',
          description: 'Matrix operations, determinants, eigenvalues, eigenvectors, matrix inversion, and solving systems of linear equations. Essential for engineering and data science.',
          icon: <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-200 to-indigo-300 rounded-lg opacity-50 animate-pulse"></div>
            <div className="relative bg-white rounded-lg p-1.5 shadow-md">
              <Grid3X3 className="h-4 w-4 text-purple-700" />
            </div>
            <div className="absolute -top-1 -right-1 bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-mono">A</div>
          </div>,
          component: QuickPercentageCalculator, // Placeholder
          priority: 1
        },
        {
          id: 'equation-solver',
          name: 'Polynomial Equation Solver',
          description: 'Solve quadratic, cubic, quartic equations and polynomial systems using Newton-Raphson, bisection, and other numerical methods with step-by-step solutions.',
          icon: <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-200 to-teal-300 rounded-lg opacity-50 animate-pulse"></div>
            <div className="relative bg-white rounded-lg p-1.5 shadow-md">
              <Hash className="h-4 w-4 text-emerald-700" />
            </div>
            <div className="absolute -top-1 -right-1 bg-teal-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">x²</div>
          </div>,
          component: QuickPercentageCalculator, // Placeholder
          priority: 2
        },
        {
          id: 'calculus-tools',
          name: 'Calculus & Analysis Tools',
          description: 'Derivatives, integrals, limits, series expansions, and multivariable calculus. Includes symbolic computation and numerical analysis methods.',
          icon: <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-200 to-pink-300 rounded-lg opacity-50 animate-pulse"></div>
            <div className="relative bg-white rounded-lg p-1.5 shadow-md">
              <Infinity className="h-4 w-4 text-rose-700" />
            </div>
            <div className="absolute -top-1 -right-1 bg-pink-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">∫</div>
          </div>,
          component: QuickPercentageCalculator, // Placeholder
          priority: 3
        },
        {
          id: 'statistics-suite',
          name: 'Statistics & Data Analysis',
          description: 'Descriptive statistics, probability distributions, hypothesis testing, regression analysis, and statistical modeling for research and data science.',
          icon: <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-200 to-orange-300 rounded-lg opacity-50 animate-pulse"></div>
            <div className="relative bg-white rounded-lg p-1.5 shadow-md">
              <BarChart3 className="h-4 w-4 text-amber-700" />
            </div>
            <div className="absolute -top-1 -right-1 bg-orange-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">σ</div>
          </div>,
          component: QuickPercentageCalculator, // Placeholder
          priority: 4
        }
      ]
    },
    {
      id: 'geometry',
      name: 'Geometry & Trigonometry',
      icon: <Triangle className="h-5 w-5" />,
      color: 'teal',
      tools: [
        {
          id: 'triangle-solver',
          name: 'Triangle & Trigonometry Solver',
          description: 'Solve triangles using Law of Sines, Law of Cosines, and trigonometric functions. Calculate angles, sides, area, and perimeter from any known values.',
          icon: <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-200 to-blue-300 rounded-lg opacity-50 animate-pulse"></div>
            <div className="relative bg-white rounded-lg p-1.5 shadow-md">
              <Triangle className="h-4 w-4 text-cyan-700" />
            </div>
            <div className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">∠</div>
          </div>,
          component: QuickPercentageCalculator, // Placeholder
          priority: 1
        },
        {
          id: 'coordinate-geometry',
          name: 'Coordinate & Analytic Geometry',
          description: 'Distance, midpoint, slope calculations, line equations, circle equations, and polygon area analysis on coordinate planes.',
          icon: <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-200 to-purple-300 rounded-lg opacity-50 animate-pulse"></div>
            <div className="relative bg-white rounded-lg p-1.5 shadow-md">
              <Compass className="h-4 w-4 text-violet-700" />
            </div>
            <div className="absolute -top-1 -right-1 bg-purple-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">xy</div>
          </div>,
          component: QuickPercentageCalculator, // Placeholder
          priority: 2
        },
        {
          id: 'area-volume',
          name: 'Area & Volume Calculator',
          description: 'Calculate areas and volumes for 2D and 3D shapes: circles, polygons, spheres, cylinders, pyramids, cones, and irregular objects.',
          icon: <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-lime-200 to-green-300 rounded-lg opacity-50 animate-pulse"></div>
            <div className="relative bg-white rounded-lg p-1.5 shadow-md">
              <Shapes className="h-4 w-4 text-lime-700" />
            </div>
            <div className="absolute -top-1 -right-1 bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">V</div>
          </div>,
          component: QuickPercentageCalculator, // Placeholder
          priority: 3
        },
        {
          id: 'trig-functions',
          name: 'Trigonometric Calculator',
          description: 'Sin, cos, tan functions, unit circle, inverse trigonometric functions, identities, and wave analysis. Supports both degrees and radians.',
          icon: <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-200 to-indigo-300 rounded-lg opacity-50 animate-pulse"></div>
            <div className="relative bg-white rounded-lg p-1.5 shadow-md">
              <Activity className="h-4 w-4 text-sky-700" />
            </div>
            <div className="absolute -top-1 -right-1 bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">sin</div>
          </div>,
          component: QuickPercentageCalculator, // Placeholder
          priority: 4
        }
      ]
    },
    {
      id: 'financial',
      name: 'Financial Mathematics',
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'green',
      tools: [
        {
          id: 'loan-mortgage',
          name: 'Loan & Mortgage Calculator',
          description: 'Monthly payments, amortization schedules, refinancing analysis, and total interest calculations. Includes PMI, property taxes, and insurance.',
          icon: <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-200 to-green-300 rounded-lg opacity-50 animate-pulse"></div>
            <div className="relative bg-white rounded-lg p-1.5 shadow-md">
              <DollarSign className="h-4 w-4 text-emerald-700" />
            </div>
            <div className="absolute -top-1 -right-1 bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">🏠</div>
          </div>,
          component: QuickPercentageCalculator, // Placeholder
          priority: 1
        },
        {
          id: 'investment-analyzer',
          name: 'Investment & Compound Interest',
          description: 'Compound interest, ROI calculations, NPV, IRR analysis, and portfolio growth projections. Perfect for financial planning and investment decisions.',
          icon: <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-200 to-cyan-300 rounded-lg opacity-50 animate-pulse"></div>
            <div className="relative bg-white rounded-lg p-1.5 shadow-md">
              <TrendingUp className="h-4 w-4 text-teal-700" />
            </div>
            <div className="absolute -top-1 -right-1 bg-cyan-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">↗</div>
          </div>,
          component: QuickPercentageCalculator, // Placeholder
          priority: 2
        },
        {
          id: 'retirement-planner',
          name: 'Retirement & Savings Planner',
          description: '401k, IRA, and pension planning with inflation adjustments. Calculate how much to save and withdrawal strategies for retirement goals.',
          icon: <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-200 to-blue-300 rounded-lg opacity-50 animate-pulse"></div>
            <div className="relative bg-white rounded-lg p-1.5 shadow-md">
              <Target className="h-4 w-4 text-indigo-700" />
            </div>
            <div className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">401k</div>
          </div>,
          component: QuickPercentageCalculator, // Placeholder
          priority: 3
        },
        {
          id: 'tax-calculator',
          name: 'Tax & Deduction Calculator',
          description: 'Federal and state tax calculations, deductions, capital gains, and estimated quarterly payments. Stay compliant with current tax laws.',
          icon: <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-red-200 to-pink-300 rounded-lg opacity-50 animate-pulse"></div>
            <div className="relative bg-white rounded-lg p-1.5 shadow-md">
              <Percent className="h-4 w-4 text-red-700" />
            </div>
            <div className="absolute -top-1 -right-1 bg-pink-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">$</div>
          </div>,
          component: QuickPercentageCalculator, // Placeholder
          priority: 4
        }
      ]
    },
    {
      id: 'scientific',
      name: 'Scientific Computing',
      icon: <CircuitBoard className="h-5 w-5" />,
      color: 'indigo',
      tools: [
        {
          id: 'number-base',
          name: 'Number Base & Binary Converter',
          description: 'Convert between binary, decimal, hexadecimal, and octal number systems. Includes bitwise operations and computer science applications.',
          icon: <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-gray-300 rounded-lg opacity-50 animate-pulse"></div>
            <div className="relative bg-white rounded-lg p-1.5 shadow-md">
              <Binary className="h-4 w-4 text-slate-700" />
            </div>
            <div className="absolute -top-1 -right-1 bg-gray-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-mono">01</div>
          </div>,
          component: QuickPercentageCalculator, // Placeholder
          priority: 1
        },
        {
          id: 'scientific-notation',
          name: 'Scientific Notation & Precision',
          description: 'Handle very large and small numbers with scientific notation. Control significant figures, precision, and engineering unit prefixes.',
          icon: <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 to-amber-300 rounded-lg opacity-50 animate-pulse"></div>
            <div className="relative bg-white rounded-lg p-1.5 shadow-md">
              <Infinity className="h-4 w-4 text-yellow-700" />
            </div>
            <div className="absolute -top-1 -right-1 bg-amber-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">e</div>
          </div>,
          component: QuickPercentageCalculator, // Placeholder
          priority: 2
        },
        {
          id: 'physics-formulas',
          name: 'Physics Formulas & Constants',
          description: 'Kinematics, dynamics, thermodynamics, electromagnetism, and quantum physics calculations with built-in physical constants and unit conversions.',
          icon: <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-200 to-red-300 rounded-lg opacity-50 animate-pulse"></div>
            <div className="relative bg-white rounded-lg p-1.5 shadow-md">
              <Zap className="h-4 w-4 text-orange-700" />
            </div>
            <div className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">F</div>
          </div>,
          component: QuickPercentageCalculator, // Placeholder
          priority: 3
        },
        {
          id: 'chemistry-tools',
          name: 'Chemistry & Molecular Calculator',
          description: 'Molecular mass, stoichiometry, gas laws, pH calculations, and chemical equation balancing with interactive periodic table reference.',
          icon: <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-200 to-teal-300 rounded-lg opacity-50 animate-pulse"></div>
            <div className="relative bg-white rounded-lg p-1.5 shadow-md">
              <CircuitBoard className="h-4 w-4 text-emerald-700" />
            </div>
            <div className="absolute -top-1 -right-1 bg-teal-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">H₂O</div>
          </div>,
          component: QuickPercentageCalculator, // Placeholder
          priority: 4
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Calculator Hub
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A comprehensive calculator suite with enhanced basic functions, quick tools, and advanced mathematical capabilities.
          </p>
        </div>

        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 gap-2">
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="flex items-center gap-2 text-sm"
              >
                {category.icon}
                <span className="hidden sm:inline">{category.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-6 w-6" />
                  Enhanced Basic Calculator
                  <Badge variant="secondary">Scientific Functions</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Advanced calculator with scientific functions, memory operations, and calculation history.
                </p>
              </CardHeader>
              <CardContent>
                <EnhancedBasicCalculator />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quick" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <QuickPercentageCalculator />
              <QuickTipCalculator />
            </div>
            
            {/* Additional Quick Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.find(c => c.id === 'quick')?.tools.slice(2).map((tool) => (
                <Card key={tool.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                        {tool.icon}
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold">{tool.name}</CardTitle>
                        <Badge variant="secondary" className="text-xs mt-1">Quick Tool</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-600 leading-relaxed">{tool.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.find(c => c.id === 'advanced')?.tools.map((tool) => (
                <Card key={tool.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-200 transition-colors">
                        {tool.icon}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-sm font-semibold">{tool.name}</CardTitle>
                        <Badge variant="outline" className="text-xs mt-1">Advanced</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-600 leading-relaxed mb-3">{tool.description}</p>
                    <Button size="sm" variant="outline" className="w-full text-xs">
                      Launch Calculator
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="geometry" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.find(c => c.id === 'geometry')?.tools.map((tool) => (
                <Card key={tool.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-teal-100 text-teal-600 rounded-lg group-hover:bg-teal-200 transition-colors">
                        {tool.icon}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-sm font-semibold">{tool.name}</CardTitle>
                        <Badge variant="outline" className="text-xs mt-1">Geometry</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-600 leading-relaxed mb-3">{tool.description}</p>
                    <Button size="sm" variant="outline" className="w-full text-xs">
                      Open Tool
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.find(c => c.id === 'financial')?.tools.map((tool) => (
                <Card key={tool.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-100 text-green-600 rounded-lg group-hover:bg-green-200 transition-colors">
                        {tool.icon}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-sm font-semibold">{tool.name}</CardTitle>
                        <Badge variant="outline" className="text-xs mt-1">Financial</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-600 leading-relaxed mb-3">{tool.description}</p>
                    <Button size="sm" variant="outline" className="w-full text-xs">
                      Calculate Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="scientific" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.find(c => c.id === 'scientific')?.tools.map((tool) => (
                <Card key={tool.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-200 transition-colors">
                        {tool.icon}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-sm font-semibold">{tool.name}</CardTitle>
                        <Badge variant="outline" className="text-xs mt-1">Scientific</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-600 leading-relaxed mb-3">{tool.description}</p>
                    <Button size="sm" variant="outline" className="w-full text-xs">
                      Start Computing
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}