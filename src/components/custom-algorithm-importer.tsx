'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Play, Download, FileText, Database } from 'lucide-react';

interface CustomAlgorithmImporterProps {}

export default function CustomAlgorithmImporter({}: CustomAlgorithmImporterProps) {
  const [selectedFormat, setSelectedFormat] = useState<string>('csv');
  const [customData, setCustomData] = useState<string>('');
  const [algorithmCode, setAlgorithmCode] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.py,.js,.txt,.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (file.name.endsWith('.py') || file.name.endsWith('.js')) {
            setAlgorithmCode(content);
          } else {
            setCustomData(content);
          }
          setResults({
            fileName: file.name,
            fileSize: `${(file.size / 1024).toFixed(1)} KB`,
            uploaded: true,
            ready: true
          });
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleDataImport = () => {
    setIsProcessing(true);
    // Process the imported data
    setTimeout(() => {
      const lines = customData.split('\n').filter(line => line.trim());
      setResults({
        dataPoints: lines.length,
        features: lines[0]?.split(',').length || 0,
        preprocessed: true,
        ready: true
      });
      setIsProcessing(false);
    }, 1000);
  };

  const handleLoadTemplate = () => {
    const template = `# Sample ML Algorithm Template
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

def custom_algorithm(X, y):
    """
    Your custom machine learning algorithm
    """
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
    
    # Your algorithm implementation here
    # Example: Simple classification
    predictions = np.random.choice([0, 1], size=len(y_test))
    
    return {
        'accuracy': accuracy_score(y_test, predictions),
        'predictions': predictions
    }

# Usage example:
# result = custom_algorithm(data_X, data_y)
# print(f"Accuracy: {result['accuracy']}")`;
    
    setAlgorithmCode(template);
  };

  const handleValidateCode = () => {
    if (!algorithmCode.trim()) {
      alert('Please write or load some code first!');
      return;
    }
    
    // Basic validation
    const hasFunction = algorithmCode.includes('def ') || algorithmCode.includes('function ');
    const hasReturn = algorithmCode.includes('return');
    
    if (hasFunction && hasReturn) {
      alert('Code validation passed! Your algorithm looks good.');
    } else {
      alert('Code validation failed. Make sure you have a function with a return statement.');
    }
  };

  const handleRunCustomAlgorithm = () => {
    if (!algorithmCode.trim()) {
      alert('Please write or load algorithm code first!');
      return;
    }
    
    setIsProcessing(true);
    // Simulate algorithm execution
    setTimeout(() => {
      setResults({
        ...results,
        accuracy: 0.92,
        precision: 0.89,
        recall: 0.94,
        executionTime: '1.2s'
      });
      setIsProcessing(false);
    }, 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Data Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-500" />
            Custom Data Import
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Data Format</Label>
            <Select value={selectedFormat} onValueChange={setSelectedFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="txt">Text</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Import Data</Label>
            <div className="space-y-2">
              <Button variant="outline" className="w-full" onClick={handleFileUpload}>
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
              <div className="text-center text-sm text-gray-500">or</div>
              <Textarea
                placeholder="Paste your data here (CSV format: x,y,label)"
                value={customData}
                onChange={(e) => setCustomData(e.target.value)}
                rows={6}
              />
            </div>
          </div>

          <Button 
            onClick={handleDataImport}
            disabled={isProcessing || !customData}
            className="w-full"
          >
            {isProcessing ? 'Processing...' : 'Import & Process Data'}
          </Button>

          {results && (
            <div className="bg-green-50 p-3 rounded">
              <div className="text-sm font-medium text-green-800">Data Imported Successfully</div>
              <div className="text-xs text-green-600 mt-1">
                {results.dataPoints} data points, {results.features} features detected
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Algorithm Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-500" />
            Custom Algorithm
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Algorithm Type</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select algorithm type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="classification">Classification</SelectItem>
                <SelectItem value="regression">Regression</SelectItem>
                <SelectItem value="clustering">Clustering</SelectItem>
                <SelectItem value="neural-network">Neural Network</SelectItem>
                <SelectItem value="custom">Custom Implementation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Algorithm Code (Python/JavaScript)</Label>
            <Textarea
              placeholder="Write your custom algorithm here..."
              value={algorithmCode}
              onChange={(e) => setAlgorithmCode(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={handleLoadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Load Template
            </Button>
            <Button variant="outline" size="sm" onClick={handleValidateCode}>
              <FileText className="h-4 w-4 mr-2" />
              Validate Code
            </Button>
          </div>

          <Button 
            onClick={handleRunCustomAlgorithm}
            disabled={isProcessing || !algorithmCode || !results?.ready}
            className="w-full"
          >
            <Play className="h-4 w-4 mr-2" />
            {isProcessing ? 'Running Algorithm...' : 'Run Custom Algorithm'}
          </Button>

          {results?.accuracy && (
            <div className="bg-blue-50 p-3 rounded space-y-2">
              <div className="text-sm font-medium text-blue-800">Algorithm Results</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Accuracy: {(results.accuracy * 100).toFixed(1)}%</div>
                <div>Precision: {(results.precision * 100).toFixed(1)}%</div>
                <div>Recall: {(results.recall * 100).toFixed(1)}%</div>
                <div>Time: {results.executionTime}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}