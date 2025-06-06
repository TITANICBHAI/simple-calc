"use client";

import { useState, type ChangeEvent, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LineChart as LineChartIcon, Info, Sigma, Loader2, RotateCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { parseExpression } from '@/lib/math-parser/symbolicParser';
import { generateGraphData, GraphingOptions } from '@/lib/math-parser/advancedMath';

interface DataPoint {
  x: number;
  y: number | null;
}

const MATH_CONTEXT_PROPERTIES = [
  'abs', 'acos', 'acosh', 'asin', 'asinh', 'atan', 'atanh', 'atan2',
  'cbrt', 'ceil', 'clz32', 'cos', 'cosh', 'exp', 'expm1', 'floor',
  'fround', 'hypot', 'imul', 'log', 'log1p', 'log10', 'log2', 'max',
  'min', 'pow', 'random', 'round', 'sign', 'sin', 'sinh', 'sqrt',
  'tan', 'tanh', 'trunc', 'E', 'LN10', 'LN2', 'LOG10E', 'LOG2E', 'PI',
  'SQRT1_2', 'SQRT2'
];

const MATH_CONTEXT_STRING = `
  const { ${MATH_CONTEXT_PROPERTIES.join(', ')} } = Math;
`;

const DISALLOWED_KEYWORDS = /\b(let|var|const|function|return|if|else|for|while|switch|case|new|this|window|document|alert|eval|setTimeout|setInterval|fetch|XMLHttpRequest|localStorage|sessionStorage|cookie|getElementBy|querySelector|constructor|prototype|__proto__|import|export|yield|debugger|with|delete|instanceof|typeof|void)\b/gi;

interface GraphEquation {
  id: string;
  equation: string;
  color: string;
  label: string;
  visible: boolean;
}

const DEFAULT_COLORS = [
  '#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080',
  '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff', '#000000'
];

const generateId = () => Math.random().toString(36).substr(2, 9);

const GraphingCalculator: React.FC = () => {
  const [equations, setEquations] = useState<GraphEquation[]>(
    [
      { id: generateId(), equation: 'sin(x)', color: DEFAULT_COLORS[0], label: 'sin(x)', visible: true }
    ]
  );
  const [activeEquationId, setActiveEquationId] = useState<string>(equations[0].id);
  const [xMinInput, setXMinInput] = useState<string>('-10');
  const [xMaxInput, setXMaxInput] = useState<string>('10');
  const [yMinInput, setYMinInput] = useState<string>('');
  const [yMaxInput, setYMaxInput] = useState<string>('');

  const [data, setData] = useState<Record<string, DataPoint[]> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const [chartXDomain, setChartXDomain] = useState<[number | 'auto', number | 'auto']>(['auto', 'auto']);
  const [chartYDomain, setChartYDomain] = useState<[number | 'auto', number | 'auto']>(['auto', 'auto']);

  const [graphType, setGraphType] = useState<'explicit' | 'implicit' | 'parametric'>('explicit');
  const [graphVars, setGraphVars] = useState<string[]>(['x', 'y']);

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    setError(null);
  };

  const sanitizeAndValidateEquation = (eq: string): string | null => {
    let sanitized = eq.trim();
    if (!sanitized) {
      setError("Equation cannot be empty.");
      return null;
    }
    
    if (DISALLOWED_KEYWORDS.test(sanitized)) {
        setError("Equation contains disallowed keywords. Please use mathematical expressions and functions only.");
        return null;
    }
    
    sanitized = sanitized.replace(/\^/g, '**'); 

    if (!/\bx\b/i.test(sanitized) && isNaN(parseFloat(sanitized))) {
      const isMathConstant = MATH_CONTEXT_PROPERTIES.some(prop => sanitized.toUpperCase() === prop || `Math.${prop.toUpperCase()}` === sanitized.toUpperCase());
      if (!isMathConstant) {
        setError("Warning: Equation does not involve 'x'. If plotting a constant (e.g. '5' or 'PI'), this is fine. Otherwise, include 'x'.");
      }
    }
    return sanitized;
  };

  const handlePlot = () => {
    setError(null);
    setData(null);
    setIsLoading(true);
    let parsedXMin = parseFloat(xMinInput);
    let parsedXMax = parseFloat(xMaxInput);
    let parsedYMin = parseFloat(yMinInput);
    let parsedYMax = parseFloat(yMaxInput);
    let errorMessages: string[] = [];
    if (isNaN(parsedXMin) || isNaN(parsedXMax)) {
      errorMessages.push('X Min and X Max must be valid numbers.');
    } else if (parsedXMin >= parsedXMax) {
      errorMessages.push('X Min must be less than X Max.');
    }
    if (graphType !== 'explicit' && (isNaN(parsedYMin) || isNaN(parsedYMax))) {
      errorMessages.push('Y Min and Y Max must be valid numbers for implicit/parametric.');
    }
    if (errorMessages.length > 0) {
      setError(errorMessages.join(' '));
      setIsLoading(false);
      toast({ title: 'Input Error', description: errorMessages.join(' '), variant: 'destructive' });
      return;
    }
    const allData: Record<string, DataPoint[]> = {};
    let anyValid = false;
    for (const eq of equations) {
      if (!eq.visible || !eq.equation.trim()) continue;
      try {
        const ast = parseExpression(eq.equation);
        const options: GraphingOptions = {
          type: graphType,
          variable: graphVars[0],
          variables: graphVars,
          domain: [parsedXMin, parsedXMax],
          range: graphType !== 'explicit' ? [parsedYMin, parsedYMax] : undefined,
          step: (parsedXMax - parsedXMin) / 300,
        };
        const points = generateGraphData(ast, options);
        if (points && points.length > 0) anyValid = true;
        allData[eq.id] = points;
      } catch (e) {
        allData[eq.id] = [];
      }
    }
    if (!anyValid) {
      setError('No valid data points for any equation.');
      setData(null);
    } else {
      setData(allData);
      toast({ title: 'Graph Plotted', description: `Plotted ${Object.keys(allData).length} function(s).` });
    }
    setIsLoading(false);
  };

  const handleReset = () => {
    setEquations([{ id: generateId(), equation: 'sin(x)', color: DEFAULT_COLORS[0], label: 'sin(x)', visible: true }]);
    setActiveEquationId(equations[0].id);
    setXMinInput('-10');
    setXMaxInput('10');
    setYMinInput('');
    setYMaxInput('');
    setData(null);
    setError(null);
    setIsLoading(false);
    setChartXDomain(['auto', 'auto']);
    setChartYDomain(['auto', 'auto']);
    toast({ title: "Graphing Calculator Reset", description: "Inputs reset." });
  };

  const availableMathProperties = useMemo(() => MATH_CONTEXT_PROPERTIES.sort().join(', '), []);

  // Add equation
  const handleAddEquation = () => {
    const newId = generateId();
    setEquations(prev => [
      ...prev,
      {
        id: newId,
        equation: '',
        color: DEFAULT_COLORS[prev.length % DEFAULT_COLORS.length],
        label: '',
        visible: true
      }
    ]);
    setActiveEquationId(newId);
  };

  // Remove equation
  const handleRemoveEquation = (id: string) => {
    setEquations(prev => prev.filter(eq => eq.id !== id));
    if (activeEquationId === id && equations.length > 1) {
      setActiveEquationId(equations[0].id);
    }
  };

  // Update equation
  const handleEquationChange = (id: string, value: string) => {
    setEquations(prev => prev.map(eq => eq.id === id ? { ...eq, equation: value, label: value } : eq));
  };

  // Toggle visibility
  const handleToggleVisibility = (id: string) => {
    setEquations(prev => prev.map(eq => eq.id === id ? { ...eq, visible: !eq.visible } : eq));
  };

  // Change color
  const handleColorChange = (id: string, color: string) => {
    setEquations(prev => prev.map(eq => eq.id === id ? { ...eq, color } : eq));
  };

  // Export graph as PNG or SVG
  const handleExport = (type: 'png' | 'svg') => {
    const chartArea = document.querySelector('.recharts-responsive-container');
    if (!chartArea) {
      toast({ title: 'Export Error', description: 'Graph area not found.', variant: 'destructive' });
      return;
    }
    const svg = chartArea.querySelector('svg');
    if (!svg) {
      toast({ title: 'Export Error', description: 'SVG not found.', variant: 'destructive' });
      return;
    }
    if (type === 'svg') {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'graph.svg';
      a.click();
      URL.revokeObjectURL(url);
    } else if (type === 'png') {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      const canvas = document.createElement('canvas');
      const bbox = svg.getBoundingClientRect();
      canvas.width = bbox.width;
      canvas.height = bbox.height;
      const ctx = canvas.getContext('2d');
      const img = new window.Image();
      const svg64 = btoa(unescape(encodeURIComponent(svgString)));
      img.onload = function () {
        ctx?.drawImage(img, 0, 0);
        canvas.toBlob(blob => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'graph.png';
            a.click();
            URL.revokeObjectURL(url);
          }
        });
      };
      img.src = 'data:image/svg+xml;base64,' + svg64;
    }
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <LineChartIcon className="mr-2 h-6 w-6 text-accent" />
          Graphing Calculator (P)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="default" className="bg-muted/30">
          <Info className="h-4 w-4" />
          <AlertTitle>Experimental Feature: Input Carefully</AlertTitle>
          <AlertDescription className="text-xs space-y-1">
            <p>Enter an equation using <code className="font-mono">x</code> as the variable.</p>
            <p>Examples: <code className="font-mono">x**2</code>, <code className="font-mono">sin(x)</code>, <code className="font-mono">log(x)</code>, <code className="font-mono">1/x</code>, <code className="font-mono">cos(PI*x) * exp(-0.1*x)</code>.</p>
            <p>Available `Math` functions & constants (case-sensitive): <code className="font-mono">{availableMathProperties}</code>. Use <code className="font-mono">**</code> for exponentiation. Trigonometric functions expect radians.</p>
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Equations</Label>
          <div className="space-y-2">
            {equations.map((eq, idx) => (
              <div key={eq.id} className="flex items-center gap-2">
                <input
                  type="color"
                  value={eq.color}
                  onChange={e => handleColorChange(eq.id, e.target.value)}
                  aria-label={`Color for equation ${idx + 1}`}
                  className="w-8 h-8 border rounded"
                />
                <Input
                  type="text"
                  value={eq.equation}
                  onChange={e => handleEquationChange(eq.id, e.target.value)}
                  placeholder={`e.g., sin(x), x**2`}
                  className="font-mono flex-1"
                  aria-label={`Equation ${idx + 1}`}
                  onFocus={() => setActiveEquationId(eq.id)}
                />
                <Button variant={eq.visible ? "default" : "outline"} size="icon" onClick={() => handleToggleVisibility(eq.id)} aria-label={eq.visible ? "Hide" : "Show"}>
                  {eq.visible ? <Sigma className="h-4 w-4" /> : <Sigma className="h-4 w-4 opacity-30" />}
                </Button>
                {equations.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveEquation(eq.id)} aria-label="Remove equation">
                    <span aria-hidden="true">✕</span>
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-2" onClick={handleAddEquation} aria-label="Add equation">+ Add Function</Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="x-min" className="text-sm font-medium">X Min</Label>
          <Input
            id="x-min"
            type="text"
            inputMode="decimal"
            value={xMinInput}
            onChange={handleInputChange(setXMinInput)}
            placeholder="-10"
            aria-label="Minimum x-value for graph"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="x-max" className="text-sm font-medium">X Max</Label>
          <Input
            id="x-max"
            type="text"
            inputMode="decimal"
            value={xMaxInput}
            onChange={handleInputChange(setXMaxInput)}
            placeholder="10"
            aria-label="Maximum x-value for graph"
          />
        </div>
         <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="y-min" className="text-sm font-medium">Y Min (Optional)</Label>
            <Input
              id="y-min"
              type="text"
              inputMode="decimal"
              value={yMinInput}
              onChange={handleInputChange(setYMinInput)}
              placeholder="Auto"
              aria-label="Minimum y-value for graph (optional)"
            />
          </div>
          <div>
            <Label htmlFor="y-max" className="text-sm font-medium">Y Max (Optional)</Label>
            <Input
              id="y-max"
              type="text"
              inputMode="decimal"
              value={yMaxInput}
              onChange={handleInputChange(setYMaxInput)}
              placeholder="Auto"
              aria-label="Maximum y-value for graph (optional)"
            />
          </div>
        </div>

        {/* Graph Type Selection UI */}
        <div className="flex gap-2 mb-2">
          <Label>Graph Type:</Label>
          <select value={graphType} onChange={e => setGraphType(e.target.value as any)} className="rounded border px-2 py-1">
            <option value="explicit">Explicit (y = f(x))</option>
            <option value="implicit">Implicit (F(x, y) = 0)</option>
            <option value="parametric">Parametric (x = f(t), y = g(t))</option>
          </select>
        </div>

        <Button onClick={handlePlot} disabled={isLoading} className="w-full" aria-busy={isLoading} aria-label="Plot graph">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Plotting...
            </>
          ) : (
            <>
              <Sigma className="mr-2 h-5 w-5" />
              Plot Graph
            </>
          )}
        </Button>
        <div aria-live="polite" aria-atomic="true">
          {error && (
            <Alert variant="destructive" className="mt-4" role="alert">
              <LineChartIcon className="h-4 w-4" />
              <AlertTitle>Graphing Info/Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {data && Object.keys(data).length > 0 && !error && (
            <div className="mt-6 h-80 w-full border border-border rounded-lg p-2 bg-card/50" aria-label="Graph plot area" tabIndex={0} role="region" aria-describedby="graph-desc">
              <span id="graph-desc" className="sr-only">Interactive graph of multiple functions over the specified x range. Use keyboard to focus and screen reader to hear this description.</span>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data[equations[0].id]}
                  margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="x"
                    type="number"
                    stroke="hsl(var(--foreground))"
                    domain={chartXDomain}
                    tickFormatter={(tick) => typeof tick === 'number' ? tick.toLocaleString(undefined, { maximumSignificantDigits: 3 }) : String(tick) }
                    allowDuplicatedCategory={false}
                  />
                  <YAxis
                    stroke="hsl(var(--foreground))"
                    domain={chartYDomain}
                    tickFormatter={(tick) => typeof tick === 'number' ? tick.toLocaleString(undefined, { maximumSignificantDigits: 3 }) : String(tick)}
                    allowDataOverflow={true}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      borderColor: 'hsl(var(--border))',
                      color: 'hsl(var(--popover-foreground))',
                    }}
                    labelStyle={{ fontWeight: 'bold' }}
                    formatter={(value) => {
                      const formattedValue = typeof value === 'number' 
                        ? value.toLocaleString(undefined, { maximumFractionDigits: 4, minimumFractionDigits: 0 }) 
                        : value === null ? 'undefined' : 'N/A';
                      return formattedValue;
                    }}
                  />
                  <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
                  {equations.filter(eq => eq.visible).map((eq, idx) => (
                    <Line
                      key={eq.id}
                      type="monotone"
                      dataKey="y"
                      data={data[eq.id]}
                      stroke={eq.color}
                      strokeWidth={2}
                      dot={false}
                      name={eq.label || eq.equation || `f${idx+1}(x)`}
                      connectNulls={true}
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          {data && Object.values(data).every(arr => Array.isArray(arr) && arr.filter((p: DataPoint) => p.y !== null).length === 0) && !error && !isLoading && (
            <p className="text-center text-muted-foreground mt-4" role="status">No valid data points to plot. Please check your equations and range. If using functions like log(x), ensure 'x' is in the valid domain for the chosen range.</p>
          )}
        </div>

        {/* Export buttons */}
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={() => handleExport('png')} aria-label="Export as PNG">Export PNG</Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('svg')} aria-label="Export as SVG">Export SVG</Button>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={handleReset} className="w-full" aria-label="Reset graph inputs">
          <RotateCw className="mr-2 h-4 w-4" /> Reset Graph
        </Button>
        <ins className="adsbygoogle"
             style={{ display: 'block', textAlign: 'center' }}
             data-ad-client="ca-pub-1074051846339488"
             data-ad-slot="8922282796"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script dangerouslySetInnerHTML={{ __html: '(adsbygoogle = window.adsbygoogle || []).push({});' }} />
      </CardFooter>
    </Card>
  );
};

export default GraphingCalculator;
