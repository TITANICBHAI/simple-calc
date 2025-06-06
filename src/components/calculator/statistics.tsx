'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface StatResult {
  mean: number;
  median: number;
  mode: number[];
  range: number;
  variance: number;
  standardDeviation: number;
  count: number;
  sum: number;
  min: number;
  max: number;
}

export default function Statistics() {
  const [dataInput, setDataInput] = useState('');
  const [results, setResults] = useState<StatResult | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  const parseData = (input: string): number[] => {
    return input
      .split(/[,\s\n]+/)
      .map(str => str.trim())
      .filter(str => str.length > 0)
      .map(str => parseFloat(str))
      .filter(num => !isNaN(num));
  };

  const calculateStats = (data: number[]): StatResult => {
    if (data.length === 0) {
      throw new Error('No valid data provided');
    }

    const sortedData = [...data].sort((a, b) => a - b);
    const sum = data.reduce((acc, val) => acc + val, 0);
    const mean = sum / data.length;

    // Median
    const median = data.length % 2 === 0
      ? (sortedData[data.length / 2 - 1] + sortedData[data.length / 2]) / 2
      : sortedData[Math.floor(data.length / 2)];

    // Mode
    const frequency: { [key: number]: number } = {};
    data.forEach(num => {
      frequency[num] = (frequency[num] || 0) + 1;
    });
    const maxFreq = Math.max(...Object.values(frequency));
    const mode = Object.keys(frequency)
      .filter(key => frequency[Number(key)] === maxFreq)
      .map(Number);

    // Range
    const range = Math.max(...data) - Math.min(...data);

    // Variance and Standard Deviation
    const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / data.length;
    const standardDeviation = Math.sqrt(variance);

    return {
      mean: Number(mean.toFixed(4)),
      median: Number(median.toFixed(4)),
      mode,
      range: Number(range.toFixed(4)),
      variance: Number(variance.toFixed(4)),
      standardDeviation: Number(standardDeviation.toFixed(4)),
      count: data.length,
      sum: Number(sum.toFixed(4)),
      min: Math.min(...data),
      max: Math.max(...data)
    };
  };

  const handleCalculate = () => {
    try {
      const data = parseData(dataInput);
      if (data.length === 0) {
        alert('Please enter valid numbers separated by commas, spaces, or new lines');
        return;
      }

      const stats = calculateStats(data);
      setResults(stats);

      // Prepare chart data
      const sortedData = [...data].sort((a, b) => a - b);
      const chartData = sortedData.map((value, index) => ({
        index: index + 1,
        value,
        name: `Point ${index + 1}`
      }));
      setChartData(chartData);
    } catch (error) {
      alert('Error calculating statistics. Please check your data.');
    }
  };

  const generateSampleData = () => {
    const samples = [
      '12, 15, 18, 22, 25, 28, 30, 32, 35, 38',
      '5.2, 7.1, 8.9, 12.3, 15.6, 18.2, 21.4, 24.8',
      '100\n150\n200\n250\n300\n350\n400',
      '1.5, 2.3, 1.8, 2.7, 3.1, 2.9, 2.2, 1.9, 2.5, 2.8'
    ];
    const randomSample = samples[Math.floor(Math.random() * samples.length)];
    setDataInput(randomSample);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Enter your data (separated by commas, spaces, or new lines):
            </label>
            <Textarea
              placeholder="Example: 12, 15, 18, 22, 25, 28, 30"
              value={dataInput}
              onChange={(e) => setDataInput(e.target.value)}
              className="min-h-24"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCalculate} className="flex-1">
              Calculate Statistics
            </Button>
            <Button variant="outline" onClick={generateSampleData}>
              Use Sample Data
            </Button>
            <Button variant="outline" onClick={() => {setDataInput(''); setResults(null); setChartData([])}}>
              Clear
            </Button>
          </div>
        </div>
      </Card>

      {results && (
        <Tabs defaultValue="results" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="results">Statistical Results</TabsTrigger>
            <TabsTrigger value="charts">Data Visualization</TabsTrigger>
          </TabsList>

          <TabsContent value="results">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Central Tendency</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Mean (Average):</span>
                    <span className="font-mono font-semibold">{results.mean}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Median:</span>
                    <span className="font-mono font-semibold">{results.median}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mode:</span>
                    <span className="font-mono font-semibold">
                      {results.mode.length > 3 ? 'Multiple modes' : results.mode.join(', ')}
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Spread & Range</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Range:</span>
                    <span className="font-mono font-semibold">{results.range}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Variance:</span>
                    <span className="font-mono font-semibold">{results.variance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Standard Deviation:</span>
                    <span className="font-mono font-semibold">{results.standardDeviation}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Basic Info</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Count:</span>
                    <span className="font-mono font-semibold">{results.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sum:</span>
                    <span className="font-mono font-semibold">{results.sum}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Min & Max</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Minimum:</span>
                    <span className="font-mono font-semibold">{results.min}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Maximum:</span>
                    <span className="font-mono font-semibold">{results.max}</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="charts">
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Data Distribution (Bar Chart)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="index" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Data Trend (Line Chart)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="index" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}