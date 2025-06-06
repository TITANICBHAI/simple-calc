"use client";

import { useState, type ChangeEvent, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart3, RefreshCw, AlertCircle, Sigma, TrendingUp, Calculator } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

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

export default function StatisticsCalculator() {
  const [inputData, setInputData] = useState<string>('');
  const [parsedNumbers, setParsedNumbers] = useState<number[]>([]);
  const [results, setResults] = useState<StatsResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputData(e.target.value);
    setError(null);
    setResults(null);
  };

  const calculateMedian = (arr: number[]): number => {
    if (arr.length === 0) return NaN;
    const sortedArr = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sortedArr.length / 2);
    if (sortedArr.length % 2 === 0) {
      return (sortedArr[mid - 1] + sortedArr[mid]) / 2;
    }
    return sortedArr[mid];
  };
  
  const formatStatistic = (num: number | string, defaultPrecision = 5): string => {
    if (typeof num === 'string') return num;
    if (isNaN(num)) return "N/A";
    if (!isFinite(num)) return num > 0 ? "Infinity" : "-Infinity";

    const absNum = Math.abs(num);
    if (absNum > 0 && (absNum < 1e-6 || absNum > 1e9)) {
        return num.toExponential(Math.max(2, defaultPrecision - 2));
    }
    return parseFloat(num.toPrecision(defaultPrecision)).toString();
  };

  const calculateStatistics = () => {
    setError(null);
    setResults(null);

    if (!inputData.trim()) {
      setError("Please enter some numbers to calculate statistics.");
      toast({ title: "Input Empty", description: "No data to analyze.", variant: "default" });
      setParsedNumbers([]);
      return;
    }

    const numbersArray = inputData
      .split(/[\s,\n]+/)
      .map(item => item.trim())
      .filter(item => item !== '')
      .map(item => parseFloat(item));

    const validNumbers = numbersArray.filter(num => !isNaN(num) && isFinite(num));

    if (validNumbers.length === 0) {
      setError("No valid numbers found in the input. Please enter numeric data separated by spaces, commas, or new lines.");
      toast({ title: "Invalid Data", description: "Could not find any valid numbers.", variant: "destructive" });
      setParsedNumbers([]);
      return;
    }
    
    setParsedNumbers(validNumbers);

    // Calculate statistics
    const count = validNumbers.length;
    const sum = validNumbers.reduce((acc, num) => acc + num, 0);
    const mean = count > 0 ? sum / count : NaN;
    
    const sortedNumbers = [...validNumbers].sort((a, b) => a - b);
    const median = calculateMedian(validNumbers);
    
    // Calculate mode
    const frequencyMap = new Map<number, number>();
    validNumbers.forEach(num => {
      frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1);
    });
    
    const maxFreq = Math.max(...Array.from(frequencyMap.values()));
    const modes = Array.from(frequencyMap.entries())
      .filter(([, freq]) => freq === maxFreq)
      .map(([num]) => num);
    
    const mode = maxFreq === 1 ? "No mode" : modes.length === 1 ? String(modes[0]) : `Multiple: ${modes.join(', ')}`;
    
    const min = Math.min(...validNumbers);
    const max = Math.max(...validNumbers);
    const range = max - min;
    
    // Calculate variance and standard deviation
    const variance = count > 1 ? 
      validNumbers.reduce((acc, num) => acc + Math.pow(num - mean, 2), 0) / (count - 1) : 
      NaN;
    const stdDev = Math.sqrt(variance);
    
    // Calculate quartiles
    const q1Index = Math.floor(count * 0.25);
    const q3Index = Math.floor(count * 0.75);
    const q1 = count >= 4 ? sortedNumbers[q1Index] : NaN;
    const q3 = count >= 4 ? sortedNumbers[q3Index] : NaN;
    const iqr = !isNaN(q1) && !isNaN(q3) ? q3 - q1 : NaN;

    const calculatedResults: StatsResults = {
      count,
      sum,
      mean: formatStatistic(mean),
      median: formatStatistic(median),
      mode,
      min: formatStatistic(min),
      max: formatStatistic(max),
      range: formatStatistic(range),
      variance: formatStatistic(variance),
      stdDev: formatStatistic(stdDev),
      q1: formatStatistic(q1),
      q3: formatStatistic(q3),
      iqr: formatStatistic(iqr)
    };

    setResults(calculatedResults);
    toast({ 
      title: "Statistics Calculated", 
      description: `Analyzed ${count} data points successfully.`
    });
  };

  const loadSampleData = () => {
    const samples = [
      "12, 15, 18, 22, 25, 28, 30, 32, 35, 40",
      "85 90 78 92 88 76 95 89 91 87",
      "2.5\n3.1\n2.8\n3.4\n2.9\n3.2\n2.7\n3.0",
      "100, 150, 200, 175, 125, 180, 160, 140, 190, 165"
    ];
    
    const randomSample = samples[Math.floor(Math.random() * samples.length)];
    setInputData(randomSample);
    toast({ 
      title: "Sample Data Loaded", 
      description: "You can now calculate statistics for this sample dataset."
    });
  };

  const handleReset = () => {
    setInputData('');
    setParsedNumbers([]);
    setResults(null);
    setError(null);
    toast({ title: "Statistics Calculator Reset", description: "All fields cleared." });
  };

  // Generate distribution insights
  const distributionInsights = useMemo(() => {
    if (!results || !parsedNumbers.length) return [];
    
    const insights = [];
    const mean = parseFloat(results.mean as string);
    const stdDev = parseFloat(results.stdDev as string);
    
    if (!isNaN(mean) && !isNaN(stdDev)) {
      const coefficientOfVariation = Math.abs(stdDev / mean);
      
      if (coefficientOfVariation < 0.1) {
        insights.push("Low variability - data points are clustered closely around the mean");
      } else if (coefficientOfVariation > 0.3) {
        insights.push("High variability - data points are widely spread");
      }
      
      // Check for potential outliers (simple 2-sigma rule)
      const outliers = parsedNumbers.filter(num => 
        Math.abs(num - mean) > 2 * stdDev
      );
      
      if (outliers.length > 0) {
        insights.push(`Potential outliers detected: ${outliers.join(', ')}`);
      }
    }
    
    return insights;
  }, [results, parsedNumbers]);

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <BarChart3 className="mr-2 h-6 w-6 text-blue-500" />
          Statistics Calculator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Calculate comprehensive statistical measures for your data
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="data-input">Data Input</Label>
          <Textarea
            id="data-input"
            value={inputData}
            onChange={handleInputChange}
            placeholder="Enter numbers separated by spaces, commas, or new lines&#10;Example: 12, 15, 18, 22, 25&#10;or&#10;12&#10;15&#10;18&#10;22&#10;25"
            className="min-h-24 font-mono"
            rows={4}
          />
          <div className="flex gap-2">
            <Button onClick={loadSampleData} variant="outline" size="sm">
              <TrendingUp className="mr-1 h-4 w-4" />
              Load Sample Data
            </Button>
            <Badge variant="secondary" className="text-xs">
              {parsedNumbers.length} numbers detected
            </Badge>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button onClick={calculateStatistics} disabled={!inputData.trim()}>
            <Calculator className="mr-2 h-4 w-4" />
            Calculate Statistics
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>

        {results && (
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-green-50">
              <h3 className="font-semibold text-base mb-3 flex items-center">
                <Sigma className="mr-2 h-5 w-5 text-blue-600" />
                Statistical Summary
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-600">Count</div>
                  <div className="text-lg font-semibold text-blue-600">{results.count}</div>
                </div>
                
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-600">Sum</div>
                  <div className="text-lg font-semibold text-green-600">{formatStatistic(results.sum)}</div>
                </div>
                
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-600">Mean (Average)</div>
                  <div className="text-lg font-semibold text-purple-600">{results.mean}</div>
                </div>
                
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-600">Median</div>
                  <div className="text-lg font-semibold text-orange-600">{results.median}</div>
                </div>
                
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-600">Mode</div>
                  <div className="text-lg font-semibold text-red-600">{results.mode}</div>
                </div>
                
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-600">Range</div>
                  <div className="text-lg font-semibold text-indigo-600">{results.range}</div>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-pink-50">
              <h4 className="font-semibold text-base mb-3">Variability Measures</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-600">Standard Deviation</div>
                  <div className="text-lg font-semibold text-purple-600">{results.stdDev}</div>
                </div>
                
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-600">Variance</div>
                  <div className="text-lg font-semibold text-pink-600">{results.variance}</div>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-gradient-to-r from-yellow-50 to-orange-50">
              <h4 className="font-semibold text-base mb-3">Quartile Analysis</h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-600">Minimum</div>
                  <div className="text-lg font-semibold text-red-600">{results.min}</div>
                </div>
                
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-600">Q1 (25%)</div>
                  <div className="text-lg font-semibold text-yellow-600">{results.q1}</div>
                </div>
                
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-600">Q3 (75%)</div>
                  <div className="text-lg font-semibold text-orange-600">{results.q3}</div>
                </div>
                
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-600">Maximum</div>
                  <div className="text-lg font-semibold text-green-600">{results.max}</div>
                </div>
              </div>
              
              <div className="mt-3 bg-white p-3 rounded border">
                <div className="text-sm text-gray-600">Interquartile Range (IQR)</div>
                <div className="text-lg font-semibold text-blue-600">{results.iqr}</div>
              </div>
            </div>

            {distributionInsights.length > 0 && (
              <div className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-blue-50">
                <h4 className="font-semibold text-base mb-2">Data Insights</h4>
                <ul className="space-y-1">
                  {distributionInsights.map((insight, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}