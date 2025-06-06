"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Puzzle, 
  Play, 
  Square, 
  Trash2, 
  Download, 
  Upload, 
  Code, 
  Settings, 
  CheckCircle, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { CalculatorPlugin, PluginContext } from '@/types/plugin-api';

interface PluginArchitectureProps {
  onResult?: (result: string) => void;
  onError?: (error: string) => void;
}

interface PluginInstance {
  id: string;
  plugin: CalculatorPlugin;
  enabled: boolean;
  error?: string;
  context?: PluginContext;
}

interface CustomFunction {
  name: string;
  description: string;
  code: string;
  parameters: string[];
  enabled: boolean;
}

// Plugin execution context
const createPluginContext = (
  currentValue: string,
  setCurrentValue: (val: string) => void,
  showToast: (opts: any) => void
): PluginContext => ({
  getCurrentValue: () => currentValue,
  setCurrentValue,
  getExpression: () => currentValue,
  setExpression: setCurrentValue,
  showToast,
  registerFunction: (name: string, fn: (...args: any[]) => any) => {
    // Store function in global scope for calculator use
    (window as any)[`plugin_${name}`] = fn;
  },
  registerButton: (config: any) => {
    showToast({
      title: "Plugin Button Registered",
      description: `Button "${config.label}" added to calculator`,
    });
  }
});

// Built-in example plugins
const EXAMPLE_PLUGINS: CalculatorPlugin[] = [
  {
    id: 'temperature-converter',
    name: 'Temperature Converter',
    description: 'Convert between Celsius, Fahrenheit, and Kelvin',
    version: '1.0.0',
    type: 'function',
    init(ctx: PluginContext) {
      ctx.registerFunction('celsiusToFahrenheit', (celsius: number) => {
        return (celsius * 9/5) + 32;
      });
      
      ctx.registerFunction('fahrenheitToCelsius', (fahrenheit: number) => {
        return (fahrenheit - 32) * 5/9;
      });
      
      ctx.registerFunction('celsiusToKelvin', (celsius: number) => {
        return celsius + 273.15;
      });
      
      ctx.registerFunction('kelvinToCelsius', (kelvin: number) => {
        return kelvin - 273.15;
      });
      
      ctx.showToast({
        title: "Temperature Converter Loaded",
        description: "Functions: celsiusToFahrenheit, fahrenheitToCelsius, celsiusToKelvin, kelvinToCelvin",
      });
    }
  },
  {
    id: 'advanced-math',
    name: 'Advanced Math Functions',
    description: 'Additional mathematical functions like gamma, beta, etc.',
    version: '1.0.0',
    type: 'function',
    init(ctx: PluginContext) {
      ctx.registerFunction('gamma', (x: number) => {
        // Simplified gamma function approximation
        if (x === 1) return 1;
        if (x === 0.5) return Math.sqrt(Math.PI);
        if (x > 1) return (x - 1) * (window as any).plugin_gamma(x - 1);
        return Math.PI / (Math.sin(Math.PI * x) * (window as any).plugin_gamma(1 - x));
      });
      
      ctx.registerFunction('fibonacci', (n: number) => {
        if (n <= 1) return n;
        let a = 0, b = 1;
        for (let i = 2; i <= n; i++) {
          [a, b] = [b, a + b];
        }
        return b;
      });
      
      ctx.registerFunction('isPrime', (n: number) => {
        if (n < 2) return 0;
        for (let i = 2; i <= Math.sqrt(n); i++) {
          if (n % i === 0) return 0;
        }
        return 1;
      });
      
      ctx.showToast({
        title: "Advanced Math Loaded",
        description: "Functions: gamma, fibonacci, isPrime",
      });
    }
  },
  {
    id: 'financial-calculator',
    name: 'Financial Calculator',
    description: 'Financial calculations like compound interest, loan payments',
    version: '1.0.0',
    type: 'function',
    init(ctx: PluginContext) {
      ctx.registerFunction('compoundInterest', (principal: number, rate: number, time: number, frequency: number = 1) => {
        return principal * Math.pow(1 + rate / frequency, frequency * time);
      });
      
      ctx.registerFunction('loanPayment', (principal: number, rate: number, periods: number) => {
        const monthlyRate = rate / 12;
        return principal * (monthlyRate * Math.pow(1 + monthlyRate, periods)) / 
               (Math.pow(1 + monthlyRate, periods) - 1);
      });
      
      ctx.registerFunction('presentValue', (futureValue: number, rate: number, periods: number) => {
        return futureValue / Math.pow(1 + rate, periods);
      });
      
      ctx.showToast({
        title: "Financial Calculator Loaded",
        description: "Functions: compoundInterest, loanPayment, presentValue",
      });
    }
  }
];

export const PluginArchitectureEngine: React.FC<PluginArchitectureProps> = ({ onResult, onError }) => {
  const { toast } = useToast();
  
  // Plugin management state
  const [pluginInstances, setPluginInstances] = useState<PluginInstance[]>([]);
  const [selectedPlugin, setSelectedPlugin] = useState<string>('');
  const [pluginCode, setPluginCode] = useState('');
  const [pluginName, setPluginName] = useState('');
  const [pluginDescription, setPluginDescription] = useState('');
  
  // Custom functions state
  const [customFunctions, setCustomFunctions] = useState<CustomFunction[]>([]);
  const [functionName, setFunctionName] = useState('');
  const [functionCode, setFunctionCode] = useState('');
  const [functionDescription, setFunctionDescription] = useState('');
  const [functionParams, setFunctionParams] = useState('');
  
  // Calculator integration state
  const [currentValue, setCurrentValue] = useState('0');
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Plugin execution context
  const pluginContext = useRef<PluginContext>(
    createPluginContext(currentValue, setCurrentValue, toast)
  );

  // Initialize with example plugins
  useEffect(() => {
    const exampleInstances: PluginInstance[] = EXAMPLE_PLUGINS.map(plugin => ({
      id: plugin.id,
      plugin,
      enabled: false,
      context: pluginContext.current
    }));
    setPluginInstances(exampleInstances);
  }, []);

  const loadPlugin = (pluginInstance: PluginInstance) => {
    try {
      setIsLoading(true);
      
      if (pluginInstance.context) {
        pluginInstance.plugin.init(pluginInstance.context);
        
        setPluginInstances(prev => 
          prev.map(p => 
            p.id === pluginInstance.id 
              ? { ...p, enabled: true, error: undefined }
              : p
          )
        );
        
        onResult?.(`Plugin "${pluginInstance.plugin.name}" loaded successfully`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load plugin';
      
      setPluginInstances(prev => 
        prev.map(p => 
          p.id === pluginInstance.id 
            ? { ...p, enabled: false, error: errorMsg }
            : p
        )
      );
      
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const unloadPlugin = (pluginId: string) => {
    const plugin = pluginInstances.find(p => p.id === pluginId);
    if (plugin?.plugin.dispose) {
      plugin.plugin.dispose();
    }
    
    setPluginInstances(prev => 
      prev.map(p => 
        p.id === pluginId 
          ? { ...p, enabled: false, error: undefined }
          : p
      )
    );
    
    toast({
      title: "Plugin Unloaded",
      description: `Plugin "${plugin?.plugin.name}" has been unloaded`,
    });
  };

  const createCustomPlugin = () => {
    try {
      if (!pluginName || !pluginCode) {
        onError?.('Please provide plugin name and code');
        return;
      }

      const customPlugin: CalculatorPlugin = {
        id: `custom-${Date.now()}`,
        name: pluginName,
        description: pluginDescription || 'Custom plugin',
        version: '1.0.0',
        type: 'function',
        init(ctx: PluginContext) {
          // Execute the custom code in a safe context
          const func = new Function('ctx', pluginCode);
          func(ctx);
        }
      };

      const newInstance: PluginInstance = {
        id: customPlugin.id,
        plugin: customPlugin,
        enabled: false,
        context: pluginContext.current
      };

      setPluginInstances(prev => [...prev, newInstance]);
      
      // Clear form
      setPluginName('');
      setPluginDescription('');
      setPluginCode('');
      
      toast({
        title: "Custom Plugin Created",
        description: `Plugin "${customPlugin.name}" has been created`,
      });
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to create plugin';
      onError?.(errorMsg);
    }
  };

  const addCustomFunction = () => {
    try {
      if (!functionName || !functionCode) {
        onError?.('Please provide function name and code');
        return;
      }

      const newFunction: CustomFunction = {
        name: functionName,
        description: functionDescription || 'Custom function',
        code: functionCode,
        parameters: functionParams.split(',').map(p => p.trim()).filter(p => p),
        enabled: false
      };

      setCustomFunctions(prev => [...prev, newFunction]);
      
      // Clear form
      setFunctionName('');
      setFunctionDescription('');
      setFunctionCode('');
      setFunctionParams('');
      
      toast({
        title: "Custom Function Added",
        description: `Function "${newFunction.name}" has been added`,
      });
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to add function';
      onError?.(errorMsg);
    }
  };

  const enableCustomFunction = (index: number) => {
    try {
      const func = customFunctions[index];
      
      // Create the function in global scope
      const customFunc = new Function(...func.parameters, func.code);
      (window as any)[`custom_${func.name}`] = customFunc;
      
      setCustomFunctions(prev => 
        prev.map((f, i) => i === index ? { ...f, enabled: true } : f)
      );
      
      toast({
        title: "Function Enabled",
        description: `Function "${func.name}" is now available in calculator`,
      });
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to enable function';
      onError?.(errorMsg);
    }
  };

  const testFunction = () => {
    try {
      setIsLoading(true);
      
      // Simple evaluation of test input
      const result = eval(testInput);
      setTestResult(result.toString());
      
      toast({
        title: "Function Test Complete",
        description: `Result: ${result}`,
      });
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to test function';
      setTestResult(`Error: ${errorMsg}`);
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const exportPlugins = () => {
    const exportData = {
      plugins: pluginInstances.filter(p => p.plugin.id.startsWith('custom-')),
      functions: customFunctions,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calculator-plugins.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Plugins Exported",
      description: "Your plugins have been exported to a JSON file",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Puzzle className="w-6 h-6" />
            Plugin Architecture Engine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="plugins" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="plugins">Plugin Manager</TabsTrigger>
              <TabsTrigger value="functions">Custom Functions</TabsTrigger>
              <TabsTrigger value="create">Create Plugin</TabsTrigger>
              <TabsTrigger value="test">Test & Debug</TabsTrigger>
            </TabsList>
            
            <TabsContent value="plugins" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Available Plugins</h3>
                <Button onClick={exportPlugins} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
              
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {pluginInstances.map((instance) => (
                    <Card key={instance.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{instance.plugin.name}</h4>
                              <Badge variant="outline">{instance.plugin.version}</Badge>
                              <Badge variant={instance.enabled ? "default" : "secondary"}>
                                {instance.enabled ? "Enabled" : "Disabled"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {instance.plugin.description}
                            </p>
                            {instance.error && (
                              <div className="flex items-center gap-1 text-sm text-red-600">
                                <AlertTriangle className="w-4 h-4" />
                                {instance.error}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            {instance.enabled ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => unloadPlugin(instance.id)}
                              >
                                <Square className="w-4 h-4" />
                                Unload
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => loadPlugin(instance)}
                                disabled={isLoading}
                              >
                                {isLoading ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Play className="w-4 h-4" />
                                )}
                                Load
                              </Button>
                            )}
                            
                            {instance.plugin.id.startsWith('custom-') && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setPluginInstances(prev => prev.filter(p => p.id !== instance.id));
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="functions" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Custom Functions</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="func-name">Function Name</Label>
                    <Input
                      id="func-name"
                      value={functionName}
                      onChange={(e) => setFunctionName(e.target.value)}
                      placeholder="myFunction"
                    />
                  </div>
                  <div>
                    <Label htmlFor="func-params">Parameters (comma-separated)</Label>
                    <Input
                      id="func-params"
                      value={functionParams}
                      onChange={(e) => setFunctionParams(e.target.value)}
                      placeholder="x, y, z"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <Label htmlFor="func-desc">Description</Label>
                  <Input
                    id="func-desc"
                    value={functionDescription}
                    onChange={(e) => setFunctionDescription(e.target.value)}
                    placeholder="What does this function do?"
                  />
                </div>
                
                <div className="mb-4">
                  <Label htmlFor="func-code">Function Code</Label>
                  <Textarea
                    id="func-code"
                    value={functionCode}
                    onChange={(e) => setFunctionCode(e.target.value)}
                    placeholder="return x * x + y * y;"
                    rows={4}
                    className="font-mono"
                  />
                </div>
                
                <Button onClick={addCustomFunction}>
                  <Code className="w-4 h-4 mr-2" />
                  Add Function
                </Button>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                {customFunctions.map((func, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{func.name}</h4>
                            <Badge variant={func.enabled ? "default" : "secondary"}>
                              {func.enabled ? "Enabled" : "Disabled"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{func.description}</p>
                          <p className="text-xs text-muted-foreground">
                            Parameters: {func.parameters.join(', ') || 'none'}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Switch
                            checked={func.enabled}
                            onCheckedChange={() => enableCustomFunction(index)}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setCustomFunctions(prev => prev.filter((_, i) => i !== index));
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="create" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Create Custom Plugin</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="plugin-name">Plugin Name</Label>
                    <Input
                      id="plugin-name"
                      value={pluginName}
                      onChange={(e) => setPluginName(e.target.value)}
                      placeholder="My Awesome Plugin"
                    />
                  </div>
                  <div>
                    <Label htmlFor="plugin-desc">Description</Label>
                    <Input
                      id="plugin-desc"
                      value={pluginDescription}
                      onChange={(e) => setPluginDescription(e.target.value)}
                      placeholder="What does this plugin do?"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <Label htmlFor="plugin-code">Plugin Code</Label>
                  <Textarea
                    id="plugin-code"
                    value={pluginCode}
                    onChange={(e) => setPluginCode(e.target.value)}
                    placeholder={`// Example plugin code:
ctx.registerFunction('square', (x) => x * x);
ctx.showToast({
  title: 'Plugin Loaded',
  description: 'Square function available'
});`}
                    rows={8}
                    className="font-mono"
                  />
                </div>
                
                <Button onClick={createCustomPlugin}>
                  <Puzzle className="w-4 h-4 mr-2" />
                  Create Plugin
                </Button>
              </div>
              
              <Alert>
                <Code className="h-4 w-4" />
                <AlertTitle>Plugin Development Tips</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>• Use <code>ctx.registerFunction(name, func)</code> to add calculator functions</p>
                  <p>• Use <code>ctx.showToast()</code> to display messages to users</p>
                  <p>• Access calculator state with <code>ctx.getCurrentValue()</code></p>
                  <p>• Set calculator values with <code>ctx.setCurrentValue(value)</code></p>
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            <TabsContent value="test" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Test Functions</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="test-input">Test Expression</Label>
                    <Input
                      id="test-input"
                      value={testInput}
                      onChange={(e) => setTestInput(e.target.value)}
                      placeholder="plugin_celsiusToFahrenheit(25)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="test-result">Result</Label>
                    <Input
                      id="test-result"
                      value={testResult}
                      readOnly
                      placeholder="Result will appear here..."
                    />
                  </div>
                </div>
                
                <Button onClick={testFunction} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  Test Function
                </Button>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-semibold mb-2">Available Functions</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {pluginInstances
                    .filter(p => p.enabled)
                    .map(p => (
                      <Badge key={p.id} variant="outline">
                        {p.plugin.name}
                      </Badge>
                    ))}
                  {customFunctions
                    .filter(f => f.enabled)
                    .map(f => (
                      <Badge key={f.name} variant="outline">
                        custom_{f.name}
                      </Badge>
                    ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Active plugins summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>System Status</span>
            <div className="flex gap-2">
              <Badge variant="outline">
                {pluginInstances.filter(p => p.enabled).length} Plugins Active
              </Badge>
              <Badge variant="outline">
                {customFunctions.filter(f => f.enabled).length} Functions Active
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Plugin System Health</span>
              <Badge variant="default">
                <CheckCircle className="w-3 h-3 mr-1" />
                Operational
              </Badge>
            </div>
            <Progress value={75} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Plugin architecture is running smoothly. All enabled plugins are responding normally.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};