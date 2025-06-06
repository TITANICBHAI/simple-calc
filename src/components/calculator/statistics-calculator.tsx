"use client";

import { useState, type ChangeEvent, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BarChart3, RotateCw, AlertCircleIcon, Sigma } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine,
  Cell
} from 'recharts';

interface StatsResults {
  count: number;
  sum: number;
  mean: number | string;
  median: number | string;
  mode: string;
  min: number | string;
  max: number | string;
  range: number | string;
  variance: number | string;
  stdDev: number | string;
  q1: number | string;
  q3: number | string;
  iqr: number | string;
}

const StatisticsCalculator: React.FC = () => {
  const [inputData, setInputData] = useState<string>('');
  const [parsedNumbers, setParsedNumbers] = useState<number[]>([]);
  const [results, setResults] = useState<StatsResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [invalidEntries, setInvalidEntries] = useState<string[]>([]);
  const { toast } = useToast();

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputData(e.target.value);
    setError(null);
    setResults(null);
  };

  const calculateMedian = (arr: number[]): number => {
    if (arr.length === 0) return NaN; // Should not happen if called with sorted validNumbers
    const sortedArr = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sortedArr.length / 2);
    if (sortedArr.length % 2 === 0) {
      return (sortedArr[mid - 1] + sortedArr[mid]) / 2;
    }
    return sortedArr[mid];
  };
  
  const formatStatistic = (num: number | string, defaultPrecision = 5): string => {
    if (typeof num === 'string') return num; // Already "N/A" or formatted
    if (isNaN(num)) return "N/A";
    if (!isFinite(num)) return num > 0 ? "Infinity" : "-Infinity";

    const absNum = Math.abs(num);
    if (absNum > 0 && (absNum < 1e-6 || absNum > 1e9)) { // Use exponential for very small or very large
        return num.toExponential(Math.max(2, defaultPrecision - 2)); // Adjust precision for exponential display
    }
    // Use toLocaleString for nice formatting with significant digits, but then parse to remove potential grouping separators for simple numbers
    // This is a bit of a heuristic to get nice display
    const localeString = num.toLocaleString(undefined, { 
        maximumFractionDigits: defaultPrecision, 
        minimumFractionDigits: 0 
    });
    // If it's a simple integer or few decimals, localeString is fine.
    // If it becomes very long due to many decimals, we might want to parse it again
    // For now, toPrecision often gives better control for scientific-like outputs.
    return parseFloat(num.toPrecision(defaultPrecision)).toString();
  };


  const calculateStatistics = () => {
    setError(null);
    setResults(null);
    setIsLoading(true);
    setInvalidEntries([]);

    setTimeout(() => { // Simulate async for large datasets
      if (!inputData.trim()) {
        setError("Please enter some numbers to calculate statistics.");
        toast({ title: "Input Empty", description: "No data to analyze.", variant: "default" });
        setParsedNumbers([]);
        setIsLoading(false);
        return;
      }

      const rawEntries = inputData.split(/\s|,+|\n+/).map(item => item.trim()).filter(item => item !== '');
      const numbersArray = rawEntries.map(item => parseFloat(item));
      const validNumbers = numbersArray.filter(num => !isNaN(num) && isFinite(num));
      const invalids = rawEntries.filter((item, idx) => isNaN(numbersArray[idx]) || !isFinite(numbersArray[idx]));
      setInvalidEntries(invalids);

      if (validNumbers.length === 0) {
        setError("No valid numbers found in the input. Please enter numeric data separated by spaces or commas.");
        toast({ title: "Invalid Data", description: "Could not find any valid numbers.", variant: "destructive" });
        setParsedNumbers([]);
        setIsLoading(false);
        return;
      }
      
      if (invalids.length > 0) {
        toast({
          title: "Some entries ignored",
          description: `Ignored: ${invalids.join(', ')}`,
          variant: "default"
        });
      }

      setParsedNumbers(validNumbers);

      const count = validNumbers.length;
      const sum = validNumbers.reduce((acc, val) => acc + val, 0);
      const mean = sum / count;

      const sortedNumbers = [...validNumbers].sort((a, b) => a - b);
      const median = calculateMedian(sortedNumbers);

      const frequencyMap: { [key: number]: number } = {};
      let maxFrequency = 0;
      validNumbers.forEach(num => {
        frequencyMap[num] = (frequencyMap[num] || 0) + 1;
        if (frequencyMap[num] > maxFrequency) {
          maxFrequency = frequencyMap[num];
        }
      });

      let modeArr: number[] = [];
      if (maxFrequency > 1 && count > 0) { 
          const distinctFrequencies = new Set(Object.values(frequencyMap));
          // Check if not all numbers have the same frequency (unless it's a single unique number repeated)
          if (!(distinctFrequencies.size === 1 && Object.keys(frequencyMap).length > 1 && Object.keys(frequencyMap).length !== count && count !== maxFrequency)) {
              for (const numStr in frequencyMap) { // Iterate string keys
                  if (frequencyMap[Number(numStr)] === maxFrequency) { // Convert key to number
                      modeArr.push(Number(numStr));
                  }
              }
          }
      } else if (count > 0 && Object.keys(frequencyMap).length === count && count > 1) {
          // All numbers are unique and there's more than one number, so no mode
      } else if (count === 1) { 
          modeArr.push(validNumbers[0]); 
      }
      const modeStr = modeArr.length > 0 ? modeArr.sort((a,b) => a-b).map(n => formatStatistic(n)).join(', ') : "N/A";

      const min = Math.min(...validNumbers);
      const max = Math.max(...validNumbers);
      const range = max - min;

      let variance = NaN;
      let stdDev = NaN;
      if (count > 0) {
          variance = validNumbers.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / count; // Population variance
          stdDev = Math.sqrt(variance);
      }

      let q1: number | string = "N/A";
      let q3: number | string = "N/A";
      let iqr: number | string = "N/A";

      if (count >= 4) { 
          const midIndex = Math.floor(count / 2);
          let lowerHalf: number[];
          let upperHalf: number[];

          if (count % 2 === 0) {
              lowerHalf = sortedNumbers.slice(0, midIndex);
              upperHalf = sortedNumbers.slice(midIndex);
          } else {
              lowerHalf = sortedNumbers.slice(0, midIndex); 
              upperHalf = sortedNumbers.slice(midIndex + 1); 
          }
          
          if (lowerHalf.length > 0) q1 = calculateMedian(lowerHalf);
          if (upperHalf.length > 0) q3 = calculateMedian(upperHalf);
          
          if (typeof q1 === 'number' && typeof q3 === 'number') {
              iqr = q3 - q1;
          }
      }

      setResults({
        count,
        sum: parseFloat(sum.toPrecision(7)), // Use toPrecision for sum as well for consistency
        mean: formatStatistic(mean),
        median: formatStatistic(median),
        mode: modeStr, // Mode is already a formatted string or "N/A"
        min: formatStatistic(min),
        max: formatStatistic(max),
        range: formatStatistic(range),
        variance: formatStatistic(variance),
        stdDev: formatStatistic(stdDev),
        q1: formatStatistic(q1),
        q3: formatStatistic(q3),
        iqr: formatStatistic(iqr),
      });

      toast({ title: "Statistics Calculated", description: "Results are now displayed." });
      setIsLoading(false);
    }, 200); // Simulate async
  };

  const handleReset = () => {
    setInputData('');
    setParsedNumbers([]);
    setResults(null);
    setError(null);
    setIsLoading(false);
    toast({ title: "Statistics Calculator Reset", description: "Fields cleared." });
  };

  return (
    <Card className="w-full shadow-lg" aria-label="Statistics Calculator">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <BarChart3 className="mr-2 h-6 w-6 text-accent" />
          Statistics Calculator (P)
        </CardTitle>
        <p className="text-sm text-muted-foreground">Enter numbers separated by commas, spaces, or newlines.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="stats-data-input">Data Input</Label>
          <Textarea
            id="stats-data-input"
            value={inputData}
            onChange={handleInputChange}
            placeholder="e.g., 1, 2, 3, 4, 5 or 10 20 15 25"
            className="font-mono min-h-[100px] text-sm"
            rows={5}
            aria-invalid={!!error}
            aria-describedby={error ? 'stats-error' : undefined}
          />
          {invalidEntries.length > 0 && (
            <div className="text-xs text-destructive" role="alert" aria-live="polite">
              Ignored invalid entries: {invalidEntries.join(', ')}
            </div>
          )}
        </div>
        <div aria-live="polite" aria-atomic="true">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full flex-grow">
              <span className="sr-only">Calculating statistics...</span>
              <Sigma className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-3 text-lg mt-4 text-muted-foreground">Calculating...</p>
            </div>
          )}
        </div>
        <Button onClick={calculateStatistics} className="w-full" disabled={isLoading} aria-busy={isLoading} aria-label="Calculate statistics">
          <Sigma className="mr-2 h-4 w-4" /> Calculate Statistics
        </Button>
        {error && (
          <Alert variant="destructive" id="stats-error">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Input Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {results && !isLoading && (
          <div className="space-y-3 pt-4 border-t mt-4">
            <h3 className="text-md font-semibold text-center text-muted-foreground">Results:</h3>
            <ScrollArea className="max-h-[300px] w-full rounded-md border p-2 bg-muted/20" aria-label="Statistics results"> 
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 p-2 text-sm">
                    <div className="font-medium text-foreground">Count:</div><div className="font-mono text-accent">{results.count}</div>
                    <div className="font-medium text-foreground">Sum:</div><div className="font-mono text-accent">{results.sum}</div>
                    <div className="font-medium text-foreground">Mean:</div><div className="font-mono text-accent">{results.mean}</div>
                    <div className="font-medium text-foreground">Median:</div><div className="font-mono text-accent">{results.median}</div>
                    <div className="font-medium text-foreground">Mode(s):</div><div className="font-mono text-accent break-all">{results.mode}</div>
                    <div className="font-medium text-foreground">Min:</div><div className="font-mono text-accent">{results.min}</div>
                    <div className="font-medium text-foreground">Max:</div><div className="font-mono text-accent">{results.max}</div>
                    <div className="font-medium text-foreground">Range:</div><div className="font-mono text-accent">{results.range}</div>
                    <div className="font-medium text-foreground">Q1 (First Quartile):</div><div className="font-mono text-accent">{results.q1}</div>
                    <div className="font-medium text-foreground">Q3 (Third Quartile):</div><div className="font-mono text-accent">{results.q3}</div>
                    <div className="font-medium text-foreground">IQR (Interquartile Range):</div><div className="font-mono text-accent">{results.iqr}</div>
                    <div className="font-medium text-foreground">Variance (Population):</div><div className="font-mono text-accent">{results.variance}</div>
                    <div className="font-medium text-foreground">Std. Deviation (Population):</div><div className="font-mono text-accent">{results.stdDev}</div>
                </div>
            </ScrollArea>
            {/* --- Advanced Visualizations --- */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Histogram */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Histogram</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={parsedNumbers.map((v) => ({ value: v }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="value" type="number" allowDecimals={true} />
                    <YAxis allowDecimals={true} />
                    <RechartsTooltip />
                    <RechartsLegend />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Box Plot */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Box Plot</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <ScatterChart>
                    <XAxis dataKey="x" type="number" hide />
                    <YAxis dataKey="y" type="number" />
                    <CartesianGrid strokeDasharray="3 3" />
                    <RechartsTooltip />
                    <Scatter
                      data={[
                        { x: 1, y: Number(results.q1) },
                        { x: 2, y: Number(results.median) },
                        { x: 3, y: Number(results.q3) },
                        { x: 0, y: Number(results.min) },
                        { x: 4, y: Number(results.max) },
                      ]}
                      fill="#82ca9d"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              {/* Scatter Plot */}
              <div className="md:col-span-2">
                <h4 className="text-sm font-semibold mb-2">Scatter Plot</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <ScatterChart>
                    <XAxis dataKey="x" type="number" />
                    <YAxis dataKey="y" type="number" />
                    <CartesianGrid strokeDasharray="3 3" />
                    <RechartsTooltip />
                    <Scatter
                      data={parsedNumbers.map((v, i) => ({ x: i + 1, y: v }))}
                      fill="#8884d8"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <div className="w-full flex flex-col items-center gap-4">
          <Button onClick={calculateStatistics} className="w-full max-w-xs" disabled={isLoading} aria-busy={isLoading} aria-label="Calculate statistics">
            Calculate Statistics
          </Button>
          <Button onClick={handleReset} variant="outline" className="w-full max-w-xs" disabled={isLoading} aria-label="Reset statistics calculator">
            Reset
          </Button>
          <ins className="adsbygoogle"
               style={{ display: 'block', textAlign: 'center' }}
               data-ad-client="ca-pub-1074051846339488"
               data-ad-slot="8922282796"
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
          <script dangerouslySetInnerHTML={{ __html: '(adsbygoogle = window.adsbygoogle || []).push({});' }} />
        </div>
      </CardFooter>
    </Card>
  );
};

export default StatisticsCalculator;


