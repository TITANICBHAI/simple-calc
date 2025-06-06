'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { APITestService, APITestResult } from '@/lib/api-test-service';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';

export default function APITestPage() {
  const [testResults, setTestResults] = useState<APITestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);

  const runSingleTest = async (testName: 'groq' | 'huggingface' | 'google') => {
    setIsLoading(true);
    setSelectedTest(testName);
    
    try {
      let result: APITestResult;
      switch (testName) {
        case 'groq':
          result = await APITestService.testGroq();
          break;
        case 'huggingface':
          result = await APITestService.testHuggingFace();
          break;
        case 'google':
          result = await APITestService.testGoogle();
          break;
      }
      
      setTestResults([result]);
    } catch (error) {
      setTestResults([{
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: testName,
      }]);
    } finally {
      setIsLoading(false);
      setSelectedTest(null);
    }
  };

  const runAllTests = async () => {
    setIsLoading(true);
    setSelectedTest('all');
    
    try {
      const results = await APITestService.testAllAPIs();
      setTestResults(results);
    } catch (error) {
      setTestResults([{
        success: false,
        error: error instanceof Error ? error.message : 'Failed to run tests',
        provider: 'All',
      }]);
    } finally {
      setIsLoading(false);
      setSelectedTest(null);
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getStatusBadge = (success: boolean) => {
    return (
      <Badge variant={success ? "default" : "destructive"}>
        {success ? "Working" : "Failed"}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">API Connection Test</h1>
        <p className="text-muted-foreground">
          Test your AI API connections to ensure they're working properly.
        </p>
      </div>

      <div className="grid gap-4 mb-8">
        <div className="flex flex-wrap gap-4">
          <Button 
            onClick={() => runSingleTest('groq')}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading && selectedTest === 'groq' && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Test Groq API
          </Button>
          
          <Button 
            onClick={() => runSingleTest('huggingface')}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading && selectedTest === 'huggingface' && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Test Hugging Face API
          </Button>
          
          <Button 
            onClick={() => runSingleTest('google')}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading && selectedTest === 'google' && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Test Google Gemini API
          </Button>
          
          <Button 
            onClick={runAllTests}
            disabled={isLoading}
          >
            {isLoading && selectedTest === 'all' && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Test All APIs
          </Button>
        </div>
      </div>

      {testResults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Test Results</h2>
          
          {testResults.map((result, index) => (
            <Card key={index} className="w-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.success)}
                    <CardTitle className="text-lg">{result.provider}</CardTitle>
                    {getStatusBadge(result.success)}
                  </div>
                  {result.responseTime && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {result.responseTime}ms
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {result.success ? (
                  <div>
                    <CardDescription className="mb-3">
                      ✅ API is working correctly
                    </CardDescription>
                    {result.response && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-medium text-green-800 mb-2">Response:</h4>
                        <p className="text-green-700 text-sm">{result.response}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <CardDescription className="mb-3">
                      ❌ API connection failed
                    </CardDescription>
                    {result.error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-medium text-red-800 mb-2">Error:</h4>
                        <p className="text-red-700 text-sm">{result.error}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {testResults.length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              Click any test button above to check your API connections.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}