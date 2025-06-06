"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BarChart3, TrendingUp, Calculator, Target } from 'lucide-react';
import Link from 'next/link';
import { KofiButton } from '@/components/ui/kofi-button';
import AdSenseAd from '@/components/AdSenseAd';
import { SmartHeader } from '@/components/smart-header';

interface StatisticalResults {
  mean: number;
  median: number;
  mode: number[];
  range: number;
  variance: number;
  standardDeviation: number;
  min: number;
  max: number;
  count: number;
  sum: number;
  quartiles: {
    q1: number;
    q2: number;
    q3: number;
    iqr: number;
  };
}

const StatisticsCalculator: React.FC = () => {
  const [dataInput, setDataInput] = useState('1, 2, 3, 4, 5, 6, 7, 8, 9, 10');
  const [sampleSize, setSampleSize] = useState('30');
  const [populationSize, setPopulationSize] = useState('1000');
  const [confidenceLevel, setConfidenceLevel] = useState('95');
  const [marginError, setMarginError] = useState('5');

  // Parse and calculate statistics
  const statistics = useMemo((): StatisticalResults | null => {
    try {
      const numbers = dataInput
        .split(/[,\s\n]+/)
        .map(str => parseFloat(str.trim()))
        .filter(num => !isNaN(num));

      if (numbers.length === 0) return null;

      const sorted = [...numbers].sort((a, b) => a - b);
      const n = numbers.length;
      const sum = numbers.reduce((acc, num) => acc + num, 0);
      const mean = sum / n;

      // Median
      const median = n % 2 === 0 
        ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
        : sorted[Math.floor(n / 2)];

      // Mode
      const frequency: { [key: number]: number } = {};
      numbers.forEach(num => frequency[num] = (frequency[num] || 0) + 1);
      const maxFreq = Math.max(...Object.values(frequency));
      const mode = Object.keys(frequency)
        .filter(num => frequency[parseFloat(num)] === maxFreq)
        .map(num => parseFloat(num));

      // Variance and Standard Deviation
      const variance = numbers.reduce((acc, num) => acc + Math.pow(num - mean, 2), 0) / n;
      const standardDeviation = Math.sqrt(variance);

      // Quartiles
      const q1 = sorted[Math.floor(n * 0.25)];
      const q2 = median;
      const q3 = sorted[Math.floor(n * 0.75)];
      const iqr = q3 - q1;

      return {
        mean,
        median,
        mode,
        range: sorted[n - 1] - sorted[0],
        variance,
        standardDeviation,
        min: sorted[0],
        max: sorted[n - 1],
        count: n,
        sum,
        quartiles: { q1, q2, q3, iqr }
      };
    } catch {
      return null;
    }
  }, [dataInput]);

  // Sample size calculator
  const calculateSampleSize = () => {
    const z = confidenceLevel === '90' ? 1.645 : confidenceLevel === '95' ? 1.96 : 2.576;
    const p = 0.5; // Maximum variability
    const e = parseFloat(marginError) / 100;
    const N = parseFloat(populationSize);
    
    const n = (z * z * p * (1 - p)) / (e * e);
    const adjustedN = n / (1 + ((n - 1) / N));
    
    return Math.ceil(adjustedN);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Floating Ko-fi Button */}
      <KofiButton variant="floating" />
      
      <SmartHeader 
        title="MathCore AI Statistics" 
        subtitle="Advanced statistical analysis and data visualization tools"
        showBackButton={true}
        showAIBadge={true}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Top Ad */}
        <div className="max-w-4xl mx-auto mb-8 text-center">
          <AdSenseAd 
            adSlot="0123456789"
            adFormat="rectangle"
            className="mb-6"
            adStyle={{ display: 'block', textAlign: 'center', minHeight: '280px' }}
          />
        </div>

        <Tabs defaultValue="descriptive" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="descriptive">Descriptive Statistics</TabsTrigger>
            <TabsTrigger value="sample-size">Sample Size Calculator</TabsTrigger>
            <TabsTrigger value="probability">Probability Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="descriptive" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Data Input
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="data">Enter your data (comma or space separated):</Label>
                    <Textarea
                      id="data"
                      value={dataInput}
                      onChange={(e) => setDataInput(e.target.value)}
                      placeholder="1, 2, 3, 4, 5, 6, 7, 8, 9, 10"
                      className="min-h-32 font-mono"
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDataInput('1, 2, 3, 4, 5, 6, 7, 8, 9, 10')}
                    >
                      Sample Data 1
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDataInput('85, 90, 78, 92, 88, 76, 95, 89, 83, 91')}
                    >
                      Test Scores
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDataInput('12.5, 15.2, 11.8, 16.3, 14.1, 13.7, 15.9, 12.3, 14.8, 13.2')}
                    >
                      Measurements
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Results Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Statistical Results
                    {statistics && (
                      <Badge variant="secondary">{statistics.count} values</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {statistics ? (
                    <div className="space-y-4">
                      {/* Central Tendency */}
                      <div>
                        <h4 className="font-semibold mb-2 text-blue-600">Central Tendency</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="bg-blue-50 p-2 rounded">
                            <span className="font-medium">Mean:</span> {statistics.mean.toFixed(2)}
                          </div>
                          <div className="bg-blue-50 p-2 rounded">
                            <span className="font-medium">Median:</span> {statistics.median.toFixed(2)}
                          </div>
                          <div className="bg-blue-50 p-2 rounded col-span-2">
                            <span className="font-medium">Mode:</span> {statistics.mode.join(', ')}
                          </div>
                        </div>
                      </div>

                      {/* Variability */}
                      <div>
                        <h4 className="font-semibold mb-2 text-green-600">Variability</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="bg-green-50 p-2 rounded">
                            <span className="font-medium">Range:</span> {statistics.range.toFixed(2)}
                          </div>
                          <div className="bg-green-50 p-2 rounded">
                            <span className="font-medium">Std Dev:</span> {statistics.standardDeviation.toFixed(2)}
                          </div>
                          <div className="bg-green-50 p-2 rounded col-span-2">
                            <span className="font-medium">Variance:</span> {statistics.variance.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* Quartiles */}
                      <div>
                        <h4 className="font-semibold mb-2 text-purple-600">Quartiles</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="bg-purple-50 p-2 rounded">
                            <span className="font-medium">Q1:</span> {statistics.quartiles.q1.toFixed(2)}
                          </div>
                          <div className="bg-purple-50 p-2 rounded">
                            <span className="font-medium">Q3:</span> {statistics.quartiles.q3.toFixed(2)}
                          </div>
                          <div className="bg-purple-50 p-2 rounded col-span-2">
                            <span className="font-medium">IQR:</span> {statistics.quartiles.iqr.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* Summary */}
                      <div>
                        <h4 className="font-semibold mb-2 text-orange-600">Summary</h4>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="bg-orange-50 p-2 rounded">
                            <span className="font-medium">Min:</span> {statistics.min}
                          </div>
                          <div className="bg-orange-50 p-2 rounded">
                            <span className="font-medium">Max:</span> {statistics.max}
                          </div>
                          <div className="bg-orange-50 p-2 rounded">
                            <span className="font-medium">Sum:</span> {statistics.sum.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Enter valid numerical data to see statistics</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sample-size" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Sample Size Calculator
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Calculate the required sample size for your survey or study
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="population">Population Size</Label>
                      <Input
                        id="population"
                        type="number"
                        value={populationSize}
                        onChange={(e) => setPopulationSize(e.target.value)}
                        placeholder="1000"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="confidence">Confidence Level (%)</Label>
                      <select 
                        className="w-full p-2 border rounded-md"
                        value={confidenceLevel}
                        onChange={(e) => setConfidenceLevel(e.target.value)}
                      >
                        <option value="90">90%</option>
                        <option value="95">95%</option>
                        <option value="99">99%</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="margin">Margin of Error (%)</Label>
                      <Input
                        id="margin"
                        type="number"
                        value={marginError}
                        onChange={(e) => setMarginError(e.target.value)}
                        placeholder="5"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-blue-50 to-green-50 p-6 rounded-lg">
                      <h3 className="font-semibold text-lg mb-2">Required Sample Size</h3>
                      <div className="text-3xl font-bold text-blue-600">
                        {calculateSampleSize()}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        participants needed for your study
                      </p>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Formula used:</strong> Cochran's formula for finite populations</p>
                      <p><strong>Assumptions:</strong> Maximum variability (p = 0.5)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="probability" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Normal Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <p>Normal distribution calculator coming soon!</p>
                    <p className="text-sm">Z-scores, percentiles, and probability calculations</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Hypothesis Testing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <p>Hypothesis testing tools coming soon!</p>
                    <p className="text-sm">t-tests, chi-square, ANOVA</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Middle Content Ad */}
        <div className="max-w-4xl mx-auto my-12 text-center">
          <AdSenseAd 
            adSlot="1234567890"
            adFormat="auto"
            className="mb-8"
            adStyle={{ display: 'block', textAlign: 'center', minHeight: '250px' }}
          />
        </div>

        {/* Statistical Analysis Disclaimer */}
        <Card className="mt-12 border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              ⚠️ Statistical Analysis Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700 space-y-3">
            <p><strong>EDUCATIONAL USE ONLY:</strong> These statistical tools are for educational and research purposes only. They do not constitute professional statistical consultation.</p>
            <p><strong>NO ACCURACY GUARANTEE:</strong> While we implement standard statistical formulas, we make NO WARRANTY regarding the accuracy, completeness, or reliability of these calculations.</p>
            <p><strong>VERIFY CRITICAL ANALYSIS:</strong> Always verify important statistical analyses with professional statisticians and multiple statistical software packages.</p>
            <p><strong>NOT RESEARCH ADVICE:</strong> These tools do not constitute advice for academic research, clinical studies, or professional data analysis.</p>
            <p><strong>ASSUMPTION LIMITATIONS:</strong> Statistical calculations assume proper data collection methods and may not account for all real-world variables.</p>
            <p><strong>USE AT YOUR OWN RISK:</strong> You are fully responsible for any decisions or conclusions based on these statistical calculations. We are NOT liable for any consequences.</p>
          </CardContent>
        </Card>

        {/* Bottom Ad */}
        <div className="max-w-4xl mx-auto mt-12 mb-8 text-center">
          <AdSenseAd 
            adSlot="2345678901"
            adFormat="auto"
            className="mb-8"
            adStyle={{ display: 'block', textAlign: 'center', minHeight: '250px' }}
          />
        </div>
      </div>
    </div>
  );
};

export default StatisticsCalculator;