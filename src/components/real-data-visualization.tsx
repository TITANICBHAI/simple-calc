'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ScatterController,
} from 'chart.js';
import { Line, Bar, Scatter } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, BarChart3, LineChart, Zap } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ScatterController
);

interface RealDataVisualizationProps {
  data: Array<{x: number, y: number, label?: string}>;
  result?: any;
  title?: string;
}

export default function RealDataVisualization({ data, result, title = "Data Visualization" }: RealDataVisualizationProps) {
  const [chartType, setChartType] = React.useState<'line' | 'bar' | 'scatter'>('scatter');

  const chartData = {
    datasets: [
      {
        label: 'Data Points',
        data: data.map(point => ({ x: point.x, y: point.y })),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      ...(result?.slope !== undefined ? [{
        label: 'Linear Regression Line',
        data: [
          { x: Math.min(...data.map(p => p.x)), y: result.slope * Math.min(...data.map(p => p.x)) + result.intercept },
          { x: Math.max(...data.map(p => p.x)), y: result.slope * Math.max(...data.map(p => p.x)) + result.intercept }
        ],
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 3,
        pointRadius: 0,
        type: 'line' as const,
        showLine: true,
      }] : [])
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `(${context.parsed.x.toFixed(2)}, ${context.parsed.y.toFixed(2)})`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear' as const,
        position: 'bottom' as const,
        title: {
          display: true,
          text: 'X Values',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Y Values',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  const exportChart = () => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${title.replace(/\s+/g, '_')}_chart.png`;
      link.href = url;
      link.click();
    }
  };

  const getStatistics = () => {
    if (data.length === 0) return null;
    
    const xValues = data.map(p => p.x);
    const yValues = data.map(p => p.y);
    
    return {
      count: data.length,
      xStats: {
        min: Math.min(...xValues),
        max: Math.max(...xValues),
        mean: xValues.reduce((a, b) => a + b, 0) / xValues.length,
        std: Math.sqrt(xValues.reduce((sq, n) => sq + Math.pow(n - xValues.reduce((a, b) => a + b, 0) / xValues.length, 2), 0) / xValues.length)
      },
      yStats: {
        min: Math.min(...yValues),
        max: Math.max(...yValues),
        mean: yValues.reduce((a, b) => a + b, 0) / yValues.length,
        std: Math.sqrt(yValues.reduce((sq, n) => sq + Math.pow(n - yValues.reduce((a, b) => a + b, 0) / yValues.length, 2), 0) / yValues.length)
      }
    };
  };

  const stats = getStatistics();

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p>No data to visualize</p>
            <p className="text-sm">Upload or generate data to see charts</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {chartType === 'line' && <LineChart className="h-5 w-5" />}
              {chartType === 'bar' && <BarChart3 className="h-5 w-5" />}
              {chartType === 'scatter' && <Zap className="h-5 w-5" />}
              {title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={chartType} onValueChange={(value: 'line' | 'bar' | 'scatter') => setChartType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scatter">Scatter</SelectItem>
                  <SelectItem value="line">Line</SelectItem>
                  <SelectItem value="bar">Bar</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={exportChart}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {chartType === 'scatter' && <Scatter data={chartData} options={chartOptions} />}
            {chartType === 'line' && <Line data={chartData} options={chartOptions} />}
            {chartType === 'bar' && <Bar data={chartData} options={chartOptions} />}
          </div>
        </CardContent>
      </Card>

      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Statistical Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-3 rounded">
                <div className="text-sm font-medium text-blue-800">Dataset Info</div>
                <div className="text-lg font-bold text-blue-600">{stats.count}</div>
                <div className="text-xs text-blue-600">Data Points</div>
              </div>
              
              <div className="bg-green-50 p-3 rounded">
                <div className="text-sm font-medium text-green-800">X Statistics</div>
                <div className="text-xs space-y-1 text-green-700">
                  <div>Mean: {stats.xStats.mean.toFixed(3)}</div>
                  <div>Std: {stats.xStats.std.toFixed(3)}</div>
                  <div>Range: [{stats.xStats.min.toFixed(2)}, {stats.xStats.max.toFixed(2)}]</div>
                </div>
              </div>
              
              <div className="bg-purple-50 p-3 rounded">
                <div className="text-sm font-medium text-purple-800">Y Statistics</div>
                <div className="text-xs space-y-1 text-purple-700">
                  <div>Mean: {stats.yStats.mean.toFixed(3)}</div>
                  <div>Std: {stats.yStats.std.toFixed(3)}</div>
                  <div>Range: [{stats.yStats.min.toFixed(2)}, {stats.yStats.max.toFixed(2)}]</div>
                </div>
              </div>
            </div>
            
            {result && (
              <div className="mt-4 bg-amber-50 p-3 rounded">
                <div className="text-sm font-medium text-amber-800">Model Results</div>
                <div className="text-xs space-y-1 text-amber-700 mt-1">
                  {result.slope && <div>Slope: {result.slope.toFixed(4)}</div>}
                  {result.intercept && <div>Intercept: {result.intercept.toFixed(4)}</div>}
                  {result.r2 && <div>R² Score: {result.r2.toFixed(4)}</div>}
                  {result.accuracy && <div>Accuracy: {(result.accuracy * 100).toFixed(2)}%</div>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}