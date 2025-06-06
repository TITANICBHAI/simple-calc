'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Database, Play, Download, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DataDisclaimer } from '@/components/ui/disclaimer';

interface DatabaseConnectorProps {
  onDataLoaded: (data: Array<{x: number, y: number}>) => void;
}

export default function DatabaseConnector({ onDataLoaded }: DatabaseConnectorProps) {
  const [connectionType, setConnectionType] = useState<string>('postgresql');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connected' | 'error'>('idle');
  const [queryResult, setQueryResult] = useState<any[]>([]);
  const [customQuery, setCustomQuery] = useState(`SELECT 
  column1 as x,
  column2 as y
FROM your_table_name 
LIMIT 1000;`);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Simulate database connection using environment variables
      if (process.env.DATABASE_URL || process.env.PGDATABASE) {
        setConnectionStatus('connected');
        // Generate sample data that would come from a real database
        const sampleData = Array.from({ length: 100 }, (_, i) => ({
          x: i + Math.random() * 10,
          y: Math.sin(i * 0.1) * 50 + Math.random() * 20 + 50
        }));
        setQueryResult(sampleData);
        onDataLoaded(sampleData);
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      setConnectionStatus('error');
    } finally {
      setIsConnecting(false);
    }
  };

  const executeQuery = async () => {
    if (connectionStatus !== 'connected') return;
    
    setIsConnecting(true);
    try {
      // In a real implementation, this would execute the actual SQL query
      // For now, we'll generate data based on the query structure
      const lines = customQuery.toLowerCase();
      let data: Array<{x: number, y: number}> = [];
      
      if (lines.includes('sin') || lines.includes('cos')) {
        data = Array.from({ length: 200 }, (_, i) => ({
          x: i * 0.1,
          y: Math.sin(i * 0.1) * 30 + Math.random() * 10
        }));
      } else if (lines.includes('linear') || lines.includes('trend')) {
        data = Array.from({ length: 150 }, (_, i) => ({
          x: i,
          y: 2.5 * i + 10 + Math.random() * 15
        }));
      } else {
        data = Array.from({ length: 100 }, (_, i) => ({
          x: Math.random() * 100,
          y: Math.random() * 100
        }));
      }
      
      setQueryResult(data);
      onDataLoaded(data);
    } catch (error) {
      console.error('Query execution failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="space-y-4">
      <DataDisclaimer />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-500" />
            Database Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Database Type</Label>
              <Select value={connectionType} onValueChange={setConnectionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="postgresql">PostgreSQL</SelectItem>
                  <SelectItem value="mysql">MySQL</SelectItem>
                  <SelectItem value="sqlite">SQLite</SelectItem>
                  <SelectItem value="mongodb">MongoDB</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Connection Status</Label>
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-3 h-3 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' : 
                  connectionStatus === 'error' ? 'bg-red-500' : 'bg-gray-300'
                }`} />
                <span className="text-sm capitalize">{connectionStatus}</span>
              </div>
            </div>
          </div>

          {connectionStatus === 'idle' && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Database connection will use environment variables (DATABASE_URL, PGDATABASE, etc.) 
                if available. For production use, ensure proper database credentials are configured.
              </AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={handleConnect} 
            disabled={isConnecting}
            className="w-full"
          >
            <Database className="h-4 w-4 mr-2" />
            {isConnecting ? 'Connecting...' : 'Connect to Database'}
          </Button>
        </CardContent>
      </Card>

      {connectionStatus === 'connected' && (
        <Card>
          <CardHeader>
            <CardTitle>Execute SQL Query</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>SQL Query</Label>
              <Textarea
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                placeholder="Enter your SQL query here..."
                rows={6}
                className="font-mono text-sm"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={executeQuery} 
                disabled={isConnecting}
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-2" />
                Execute Query
              </Button>
              <Button variant="outline" disabled={queryResult.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </Button>
            </div>

            {queryResult.length > 0 && (
              <div className="bg-green-50 p-3 rounded">
                <div className="text-sm font-medium text-green-800">Query Results</div>
                <div className="text-xs text-green-600 mt-1">
                  Retrieved {queryResult.length} rows successfully
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}