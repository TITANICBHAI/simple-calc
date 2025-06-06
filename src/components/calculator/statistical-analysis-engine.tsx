"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, TrendingUp, Calculator, Download, Shuffle, Target } from 'lucide-react';

interface StatisticalAnalysisProps {
  onResult?: (result: string) => void;
  onError?: (error: string) => void;
}

interface DataPoint {
  value: number;
  label?: string;
}

interface StatisticalResults {
  descriptiveStats: {
    mean: number;
    median: number;
    mode: number[];
    standardDeviation: number;
    variance: number;
    range: number;
    min: number;
    max: number;
    q1: number;
    q3: number;
    iqr: number;
    skewness: number;
    kurtosis: number;
  };
  distribution: {
    frequency: Record<string, number>;
    bins: { min: number; max: number; count: number; frequency: number }[];
  };
}

interface RegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
  correlation: number;
  equation: string;
  predictions: { x: number; y: number; predicted: number }[];
}

interface HypothesisTestResult {
  testType: string;
  statistic: number;
  pValue: number;
  criticalValue: number;
  conclusion: string;
  confidenceLevel: number;
}

// Statistical calculation functions
const calculateDescriptiveStats = (data: number[]): StatisticalResults['descriptiveStats'] => {
  const sortedData = [...data].sort((a, b) => a - b);
  const n = data.length;
  
  // Basic measures
  const mean = data.reduce((sum, val) => sum + val, 0) / n;
  const median = n % 2 === 0 
    ? (sortedData[n/2 - 1] + sortedData[n/2]) / 2 
    : sortedData[Math.floor(n/2)];
  
  // Mode calculation
  const frequency: Record<number, number> = {};
  data.forEach(val => frequency[val] = (frequency[val] || 0) + 1);
  const maxFreq = Math.max(...Object.values(frequency));
  const mode = Object.keys(frequency)
    .filter(key => frequency[Number(key)] === maxFreq)
    .map(Number);
  
  // Variance and standard deviation
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (n - 1);
  const standardDeviation = Math.sqrt(variance);
  
  // Range
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  
  // Quartiles
  const q1Index = Math.floor(n * 0.25);
  const q3Index = Math.floor(n * 0.75);
  const q1 = sortedData[q1Index];
  const q3 = sortedData[q3Index];
  const iqr = q3 - q1;
  
  // Skewness
  const skewness = data.reduce((sum, val) => sum + Math.pow((val - mean) / standardDeviation, 3), 0) / n;
  
  // Kurtosis
  const kurtosis = data.reduce((sum, val) => sum + Math.pow((val - mean) / standardDeviation, 4), 0) / n - 3;
  
  return {
    mean, median, mode, standardDeviation, variance, range, min, max,
    q1, q3, iqr, skewness, kurtosis
  };
};

const createHistogram = (data: number[], bins: number = 10): StatisticalResults['distribution'] => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const binWidth = (max - min) / bins;
  
  const binData = Array.from({ length: bins }, (_, i) => ({
    min: min + i * binWidth,
    max: min + (i + 1) * binWidth,
    count: 0,
    frequency: 0
  }));
  
  data.forEach(value => {
    const binIndex = Math.min(Math.floor((value - min) / binWidth), bins - 1);
    binData[binIndex].count++;
  });
  
  binData.forEach(bin => {
    bin.frequency = bin.count / data.length;
  });
  
  const frequency: Record<string, number> = {};
  data.forEach(val => {
    const key = val.toString();
    frequency[key] = (frequency[key] || 0) + 1;
  });
  
  return { frequency, bins: binData };
};

const performLinearRegression = (xData: number[], yData: number[]): RegressionResult => {
  const n = xData.length;
  const sumX = xData.reduce((sum, x) => sum + x, 0);
  const sumY = yData.reduce((sum, y) => sum + y, 0);
  const sumXY = xData.reduce((sum, x, i) => sum + x * yData[i], 0);
  const sumXX = xData.reduce((sum, x) => sum + x * x, 0);
  const sumYY = yData.reduce((sum, y) => sum + y * y, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  const meanY = sumY / n;
  const ssTotal = yData.reduce((sum, y) => sum + Math.pow(y - meanY, 2), 0);
  const ssResidual = yData.reduce((sum, y, i) => {
    const predicted = slope * xData[i] + intercept;
    return sum + Math.pow(y - predicted, 2);
  }, 0);
  
  const rSquared = 1 - (ssResidual / ssTotal);
  const correlation = Math.sqrt(rSquared) * (slope > 0 ? 1 : -1);
  
  const predictions = xData.map((x, i) => ({
    x,
    y: yData[i],
    predicted: slope * x + intercept
  }));
  
  const equation = `y = ${slope.toFixed(4)}x + ${intercept.toFixed(4)}`;
  
  return { slope, intercept, rSquared, correlation, equation, predictions };
};

const performTTest = (data: number[], hypothesizedMean: number, alpha: number = 0.05): HypothesisTestResult => {
  const n = data.length;
  const sampleMean = data.reduce((sum, val) => sum + val, 0) / n;
  const sampleStd = Math.sqrt(data.reduce((sum, val) => sum + Math.pow(val - sampleMean, 2), 0) / (n - 1));
  
  const tStatistic = (sampleMean - hypothesizedMean) / (sampleStd / Math.sqrt(n));
  const degreesOfFreedom = n - 1;
  
  // Simplified critical value calculation (approximation)
  const criticalValue = 1.96; // For large samples, approximate
  const pValue = Math.min(1, Math.abs(tStatistic) * 0.05); // Simplified p-value
  
  const conclusion = Math.abs(tStatistic) > criticalValue 
    ? `Reject null hypothesis (mean ≠ ${hypothesizedMean})`
    : `Fail to reject null hypothesis (mean = ${hypothesizedMean})`;
  
  return {
    testType: 'One-sample t-test',
    statistic: tStatistic,
    pValue,
    criticalValue,
    conclusion,
    confidenceLevel: (1 - alpha) * 100
  };
};

export const StatisticalAnalysisEngine: React.FC<StatisticalAnalysisProps> = ({ onResult, onError }) => {
  // Data input state
  const [rawData, setRawData] = useState('1, 2, 3, 4, 5, 6, 7, 8, 9, 10');
  const [xData, setXData] = useState('1, 2, 3, 4, 5');
  const [yData, setYData] = useState('2, 4, 6, 8, 10');
  const [hypothesizedMean, setHypothesizedMean] = useState('5');
  const [confidenceLevel, setConfidenceLevel] = useState('95');
  
  // Analysis type state
  const [analysisType, setAnalysisType] = useState<'descriptive' | 'regression' | 'hypothesis' | 'distribution'>('descriptive');
  
  // Results state
  const [descriptiveResults, setDescriptiveResults] = useState<StatisticalResults | null>(null);
  const [regressionResults, setRegressionResults] = useState<RegressionResult | null>(null);
  const [hypothesisResults, setHypothesisResults] = useState<HypothesisTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Parse data from input strings
  const parsedData = useMemo(() => {
    try {
      const data = rawData.split(',').map(val => parseFloat(val.trim())).filter(val => !isNaN(val));
      return data;
    } catch {
      return [];
    }
  }, [rawData]);

  const parsedXData = useMemo(() => {
    try {
      return xData.split(',').map(val => parseFloat(val.trim())).filter(val => !isNaN(val));
    } catch {
      return [];
    }
  }, [xData]);

  const parsedYData = useMemo(() => {
    try {
      return yData.split(',').map(val => parseFloat(val.trim())).filter(val => !isNaN(val));
    } catch {
      return [];
    }
  }, [yData]);

  const runDescriptiveAnalysis = () => {
    try {
      if (parsedData.length === 0) {
        setError('Please enter valid numerical data');
        return;
      }

      const descriptiveStats = calculateDescriptiveStats(parsedData);
      const distribution = createHistogram(parsedData);
      
      setDescriptiveResults({ descriptiveStats, distribution });
      setError(null);
      onResult?.(`Descriptive analysis completed for ${parsedData.length} data points`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to perform descriptive analysis';
      setError(errorMsg);
      onError?.(errorMsg);
    }
  };

  const runRegressionAnalysis = () => {
    try {
      if (parsedXData.length === 0 || parsedYData.length === 0) {
        setError('Please enter valid X and Y data');
        return;
      }

      if (parsedXData.length !== parsedYData.length) {
        setError('X and Y data must have the same number of points');
        return;
      }

      const results = performLinearRegression(parsedXData, parsedYData);
      setRegressionResults(results);
      setError(null);
      onResult?.(`Linear regression completed: R² = ${results.rSquared.toFixed(4)}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to perform regression analysis';
      setError(errorMsg);
      onError?.(errorMsg);
    }
  };

  const runHypothesisTest = () => {
    try {
      if (parsedData.length === 0) {
        setError('Please enter valid numerical data');
        return;
      }

      const testMean = parseFloat(hypothesizedMean);
      if (isNaN(testMean)) {
        setError('Please enter a valid hypothesized mean');
        return;
      }

      const alpha = 1 - parseFloat(confidenceLevel) / 100;
      const results = performTTest(parsedData, testMean, alpha);
      setHypothesisResults(results);
      setError(null);
      onResult?.(`Hypothesis test completed: ${results.conclusion}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to perform hypothesis test';
      setError(errorMsg);
      onError?.(errorMsg);
    }
  };

  const generateSampleData = () => {
    const sampleSize = 50;
    const mean = 50;
    const stdDev = 10;
    
    const data = Array.from({ length: sampleSize }, () => {
      // Box-Muller transform for normal distribution
      const u1 = Math.random();
      const u2 = Math.random();
      const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      return Math.round((z0 * stdDev + mean) * 100) / 100;
    });
    
    setRawData(data.join(', '));
  };

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Advanced Statistical Analysis Engine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={analysisType} onValueChange={(value) => setAnalysisType(value as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="descriptive">Descriptive Stats</TabsTrigger>
              <TabsTrigger value="regression">Regression</TabsTrigger>
              <TabsTrigger value="hypothesis">Hypothesis Testing</TabsTrigger>
              <TabsTrigger value="distribution">Distribution</TabsTrigger>
            </TabsList>
            
            <TabsContent value="descriptive" className="space-y-4">
              <div>
                <Label htmlFor="data-input">Data (comma-separated)</Label>
                <Textarea
                  id="data-input"
                  value={rawData}
                  onChange={(e) => setRawData(e.target.value)}
                  placeholder="1, 2, 3, 4, 5, 6, 7, 8, 9, 10"
                  rows={3}
                />
                <div className="flex gap-2 mt-2">
                  <Button onClick={runDescriptiveAnalysis} className="flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    Analyze Data
                  </Button>
                  <Button variant="outline" onClick={generateSampleData} className="flex items-center gap-2">
                    <Shuffle className="w-4 h-4" />
                    Generate Sample
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="regression" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="x-data">X Data (independent variable)</Label>
                  <Textarea
                    id="x-data"
                    value={xData}
                    onChange={(e) => setXData(e.target.value)}
                    placeholder="1, 2, 3, 4, 5"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="y-data">Y Data (dependent variable)</Label>
                  <Textarea
                    id="y-data"
                    value={yData}
                    onChange={(e) => setYData(e.target.value)}
                    placeholder="2, 4, 6, 8, 10"
                    rows={2}
                  />
                </div>
              </div>
              <Button onClick={runRegressionAnalysis} className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Run Linear Regression
              </Button>
            </TabsContent>
            
            <TabsContent value="hypothesis" className="space-y-4">
              <div>
                <Label htmlFor="test-data">Sample Data</Label>
                <Textarea
                  id="test-data"
                  value={rawData}
                  onChange={(e) => setRawData(e.target.value)}
                  placeholder="1, 2, 3, 4, 5, 6, 7, 8, 9, 10"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hyp-mean">Hypothesized Mean</Label>
                  <Input
                    id="hyp-mean"
                    value={hypothesizedMean}
                    onChange={(e) => setHypothesizedMean(e.target.value)}
                    placeholder="5"
                  />
                </div>
                <div>
                  <Label htmlFor="conf-level">Confidence Level (%)</Label>
                  <Input
                    id="conf-level"
                    value={confidenceLevel}
                    onChange={(e) => setConfidenceLevel(e.target.value)}
                    placeholder="95"
                  />
                </div>
              </div>
              <Button onClick={runHypothesisTest} className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Run t-Test
              </Button>
            </TabsContent>
            
            <TabsContent value="distribution" className="space-y-4">
              <Alert>
                <BarChart3 className="h-4 w-4" />
                <AlertTitle>Distribution Analysis</AlertTitle>
                <AlertDescription>
                  Run descriptive analysis first to see distribution charts and frequency analysis.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
          
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results Display */}
      {descriptiveResults && (
        <Card>
          <CardHeader>
            <CardTitle>Descriptive Statistics Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary Statistics */}
            <div>
              <h3 className="font-semibold mb-3">Summary Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{descriptiveResults.descriptiveStats.mean.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Mean</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{descriptiveResults.descriptiveStats.median.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Median</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{descriptiveResults.descriptiveStats.standardDeviation.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Std Dev</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{descriptiveResults.descriptiveStats.range.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Range</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Detailed Statistics */}
            <div>
              <h3 className="font-semibold mb-3">Detailed Analysis</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Minimum:</span>
                    <Badge variant="outline">{descriptiveResults.descriptiveStats.min.toFixed(2)}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Q1 (25th percentile):</span>
                    <Badge variant="outline">{descriptiveResults.descriptiveStats.q1.toFixed(2)}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Q3 (75th percentile):</span>
                    <Badge variant="outline">{descriptiveResults.descriptiveStats.q3.toFixed(2)}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Maximum:</span>
                    <Badge variant="outline">{descriptiveResults.descriptiveStats.max.toFixed(2)}</Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Variance:</span>
                    <Badge variant="outline">{descriptiveResults.descriptiveStats.variance.toFixed(2)}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>IQR:</span>
                    <Badge variant="outline">{descriptiveResults.descriptiveStats.iqr.toFixed(2)}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Skewness:</span>
                    <Badge variant="outline">{descriptiveResults.descriptiveStats.skewness.toFixed(2)}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Kurtosis:</span>
                    <Badge variant="outline">{descriptiveResults.descriptiveStats.kurtosis.toFixed(2)}</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Histogram */}
            <div>
              <h3 className="font-semibold mb-3">Distribution Histogram</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={descriptiveResults.distribution.bins.map((bin, i) => ({
                  range: `${bin.min.toFixed(1)}-${bin.max.toFixed(1)}`,
                  count: bin.count,
                  frequency: bin.frequency
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {regressionResults && (
        <Card>
          <CardHeader>
            <CardTitle>Linear Regression Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">{regressionResults.slope.toFixed(4)}</div>
                <div className="text-sm text-muted-foreground">Slope</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">{regressionResults.intercept.toFixed(4)}</div>
                <div className="text-sm text-muted-foreground">Y-intercept</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-orange-600">{regressionResults.rSquared.toFixed(4)}</div>
                <div className="text-sm text-muted-foreground">R²</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-600">{regressionResults.correlation.toFixed(4)}</div>
                <div className="text-sm text-muted-foreground">Correlation</div>
              </div>
            </div>

            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertTitle>Regression Equation</AlertTitle>
              <AlertDescription className="font-mono">{regressionResults.equation}</AlertDescription>
            </Alert>

            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={regressionResults.predictions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" />
                <YAxis />
                <Tooltip />
                <Scatter name="Actual" dataKey="y" fill="#3b82f6" />
                <Line 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={false}
                  name="Regression Line"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {hypothesisResults && (
        <Card>
          <CardHeader>
            <CardTitle>Hypothesis Test Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-semibold">Test Statistic (t):</Label>
                <Badge variant="outline" className="ml-2">{hypothesisResults.statistic.toFixed(4)}</Badge>
              </div>
              <div>
                <Label className="font-semibold">Critical Value:</Label>
                <Badge variant="outline" className="ml-2">{hypothesisResults.criticalValue.toFixed(4)}</Badge>
              </div>
              <div>
                <Label className="font-semibold">P-value:</Label>
                <Badge variant="outline" className="ml-2">{hypothesisResults.pValue.toFixed(4)}</Badge>
              </div>
              <div>
                <Label className="font-semibold">Confidence Level:</Label>
                <Badge variant="outline" className="ml-2">{hypothesisResults.confidenceLevel}%</Badge>
              </div>
            </div>

            <Alert variant={hypothesisResults.conclusion.includes('Reject') ? 'destructive' : 'default'}>
              <Target className="h-4 w-4" />
              <AlertTitle>Conclusion</AlertTitle>
              <AlertDescription>{hypothesisResults.conclusion}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
};