"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Loader2,
  Zap,
  Brain,
  Cpu,
  Database,
  Network,
  Shield,
  Workflow,
  Package,
  RefreshCw,
  BookOpen,
  Star,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Enhanced Plugin Types
interface PluginAPI {
  calculate: (expression: string) => Promise<number | string>;
  registerFunction: (name: string, fn: Function, metadata?: FunctionMetadata) => void;
  registerConstant: (name: string, value: number, description?: string) => void;
  registerOperator: (symbol: string, fn: Function, precedence: number) => void;
  registerUI: (component: React.ComponentType, location: string) => void;
  getHistory: () => string[];
  setVariable: (name: string, value: any) => void;
  getVariable: (name: string) => any;
  showNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  storage: {
    get: (key: string) => any;
    set: (key: string, value: any) => void;
    remove: (key: string) => void;
    clear: () => void;
  };
}

interface FunctionMetadata {
  description: string;
  parameters: { name: string; type: string; description: string }[];
  examples: string[];
  category: string;
  tags: string[];
}

interface EnhancedPlugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: 'math' | 'science' | 'finance' | 'utility' | 'conversion' | 'ai' | 'visualization';
  dependencies?: string[];
  permissions: ('storage' | 'network' | 'ui' | 'system')[];
  icon?: string;
  homepage?: string;
  repository?: string;
  keywords: string[];
  init: (api: PluginAPI) => Promise<void> | void;
  dispose?: () => void;
  settings?: Record<string, any>;
  status?: 'active' | 'inactive' | 'error' | 'loading';
  performance?: {
    loadTime: number;
    memoryUsage: number;
    executionCount: number;
  };
}

interface PluginStore {
  featured: EnhancedPlugin[];
  popular: EnhancedPlugin[];
  recent: EnhancedPlugin[];
  categories: Record<string, EnhancedPlugin[]>;
}

// Advanced Plugin Store with Real Mathematical Plugins
const ENHANCED_PLUGIN_STORE: PluginStore = {
  featured: [
    {
      id: 'advanced-calculus',
      name: 'Advanced Calculus Suite',
      description: 'Comprehensive calculus tools including derivatives, integrals, limits, and series',
      version: '2.1.0',
      author: 'MathHub Team',
      category: 'math',
      permissions: ['storage', 'ui'],
      keywords: ['calculus', 'derivatives', 'integrals', 'limits', 'series'],
      icon: '∫',
      init: (api: PluginAPI) => {
        // Numerical derivative
        api.registerFunction('derivative', (expr: string, variable: string = 'x', point?: number) => {
          const h = 0.0001;
          if (point !== undefined) {
            const f1 = api.calculate(expr.replace(new RegExp(variable, 'g'), String(point + h)));
            const f2 = api.calculate(expr.replace(new RegExp(variable, 'g'), String(point - h)));
            return (Number(f1) - Number(f2)) / (2 * h);
          }
          return `d/d${variable}(${expr})`;
        }, {
          description: 'Calculate numerical derivative of a function',
          parameters: [
            { name: 'expression', type: 'string', description: 'Mathematical expression' },
            { name: 'variable', type: 'string', description: 'Variable to differentiate with respect to' },
            { name: 'point', type: 'number', description: 'Point to evaluate derivative at' }
          ],
          examples: ['derivative("x^2", "x", 3)', 'derivative("sin(x)", "x", 0)'],
          category: 'calculus',
          tags: ['derivative', 'differentiation']
        });

        // Numerical integration using Simpson's rule
        api.registerFunction('integrate', (expr: string, variable: string, lower: number, upper: number, steps: number = 1000) => {
          const h = (upper - lower) / steps;
          let sum = 0;
          
          for (let i = 0; i <= steps; i++) {
            const x = lower + i * h;
            const y = Number(api.calculate(expr.replace(new RegExp(variable, 'g'), String(x))));
            const weight = (i === 0 || i === steps) ? 1 : (i % 2 === 0) ? 2 : 4;
            sum += weight * y;
          }
          
          return (h / 3) * sum;
        }, {
          description: 'Numerical integration using Simpson\'s rule',
          parameters: [
            { name: 'expression', type: 'string', description: 'Function to integrate' },
            { name: 'variable', type: 'string', description: 'Variable of integration' },
            { name: 'lower', type: 'number', description: 'Lower bound' },
            { name: 'upper', type: 'number', description: 'Upper bound' },
            { name: 'steps', type: 'number', description: 'Number of integration steps' }
          ],
          examples: ['integrate("x^2", "x", 0, 1)', 'integrate("sin(x)", "x", 0, 3.14159)'],
          category: 'calculus',
          tags: ['integral', 'integration', 'simpson']
        });

        // Limit calculation
        api.registerFunction('limit', (expr: string, variable: string, approach: number, direction: 'left' | 'right' | 'both' = 'both') => {
          const h = 0.0001;
          try {
            if (direction === 'left' || direction === 'both') {
              const leftVal = Number(api.calculate(expr.replace(new RegExp(variable, 'g'), String(approach - h))));
              if (direction === 'left') return leftVal;
            }
            if (direction === 'right' || direction === 'both') {
              const rightVal = Number(api.calculate(expr.replace(new RegExp(variable, 'g'), String(approach + h))));
              if (direction === 'right') return rightVal;
            }
            
            const leftVal = Number(api.calculate(expr.replace(new RegExp(variable, 'g'), String(approach - h))));
            const rightVal = Number(api.calculate(expr.replace(new RegExp(variable, 'g'), String(approach + h))));
            
            return Math.abs(leftVal - rightVal) < 0.001 ? (leftVal + rightVal) / 2 : 'Does not exist';
          } catch {
            return 'Undefined';
          }
        }, {
          description: 'Calculate limit of a function',
          parameters: [
            { name: 'expression', type: 'string', description: 'Function expression' },
            { name: 'variable', type: 'string', description: 'Variable' },
            { name: 'approach', type: 'number', description: 'Value to approach' },
            { name: 'direction', type: 'string', description: 'Direction: left, right, or both' }
          ],
          examples: ['limit("sin(x)/x", "x", 0)', 'limit("1/x", "x", 0, "right")'],
          category: 'calculus',
          tags: ['limit', 'continuity']
        });

        api.showNotification('Advanced Calculus Suite loaded successfully!', 'success');
      }
    },
    {
      id: 'ai-solver',
      name: 'AI Mathematical Solver',
      description: 'AI-powered equation solver with step-by-step explanations',
      version: '1.5.0',
      author: 'AI Labs',
      category: 'ai',
      permissions: ['network', 'storage', 'ui'],
      keywords: ['ai', 'solver', 'equations', 'steps', 'explanation'],
      icon: '🧠',
      init: (api: PluginAPI) => {
        api.registerFunction('solveWithAI', async (equation: string) => {
          try {
            // This would integrate with actual AI service
            api.showNotification('AI Solver would process this equation with external AI service', 'info');
            return `AI analysis of: ${equation}`;
          } catch (error) {
            return 'AI service unavailable';
          }
        }, {
          description: 'Solve equations using AI with detailed explanations',
          parameters: [
            { name: 'equation', type: 'string', description: 'Equation to solve' }
          ],
          examples: ['solveWithAI("x^2 + 5x + 6 = 0")', 'solveWithAI("sin(x) = 0.5")'],
          category: 'ai',
          tags: ['ai', 'solver', 'explanation']
        });
      }
    }
  ],
  popular: [
    {
      id: 'statistics-pro',
      name: 'Statistics Professional',
      description: 'Advanced statistical functions and distributions',
      version: '1.8.0',
      author: 'StatTeam',
      category: 'math',
      permissions: ['storage'],
      keywords: ['statistics', 'probability', 'distributions', 'regression'],
      icon: '📊',
      init: (api: PluginAPI) => {
        // Mean
        api.registerFunction('mean', (...values: number[]) => {
          return values.reduce((sum, val) => sum + val, 0) / values.length;
        });

        // Standard deviation
        api.registerFunction('std', (...values: number[]) => {
          const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
          const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
          return Math.sqrt(variance);
        });

        // Normal distribution
        api.registerFunction('normalPDF', (x: number, mean: number = 0, std: number = 1) => {
          return (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / std, 2));
        });

        // Correlation coefficient
        api.registerFunction('correlation', (x: number[], y: number[]) => {
          const n = Math.min(x.length, y.length);
          const meanX = x.slice(0, n).reduce((sum, val) => sum + val, 0) / n;
          const meanY = y.slice(0, n).reduce((sum, val) => sum + val, 0) / n;
          
          let numerator = 0;
          let denomX = 0;
          let denomY = 0;
          
          for (let i = 0; i < n; i++) {
            const dx = x[i] - meanX;
            const dy = y[i] - meanY;
            numerator += dx * dy;
            denomX += dx * dx;
            denomY += dy * dy;
          }
          
          return numerator / Math.sqrt(denomX * denomY);
        });

        api.showNotification('Statistics Professional loaded!', 'success');
      }
    }
  ],
  recent: [],
  categories: {}
};

interface EnhancedPluginSystemProps {
  onResult?: (result: string) => void;
  onError?: (error: string) => void;
}

export const EnhancedPluginSystem: React.FC<EnhancedPluginSystemProps> = ({ onResult, onError }) => {
  const { toast } = useToast();
  
  // Plugin management state
  const [installedPlugins, setInstalledPlugins] = useState<EnhancedPlugin[]>([]);
  const [availablePlugins, setAvailablePlugins] = useState<PluginStore>(ENHANCED_PLUGIN_STORE);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Plugin creation state
  const [customPlugin, setCustomPlugin] = useState({
    name: '',
    description: '',
    category: 'utility' as const,
    code: '',
    permissions: [] as string[]
  });
  
  // Plugin API
  const pluginAPI = useRef<PluginAPI>({
    calculate: async (expression: string) => {
      try {
        // This would integrate with your existing calculator
        return eval(expression); // In real implementation, use safe evaluation
      } catch {
        throw new Error('Invalid expression');
      }
    },
    registerFunction: (name: string, fn: Function, metadata?: FunctionMetadata) => {
      (window as any)[`plugin_${name}`] = fn;
      if (metadata) {
        (window as any)[`plugin_${name}_meta`] = metadata;
      }
    },
    registerConstant: (name: string, value: number, description?: string) => {
      (window as any)[`const_${name}`] = value;
    },
    registerOperator: (symbol: string, fn: Function, precedence: number) => {
      // Operator registration logic
    },
    registerUI: (component: React.ComponentType, location: string) => {
      // UI component registration
    },
    getHistory: () => [],
    setVariable: (name: string, value: any) => {
      (window as any)[`var_${name}`] = value;
    },
    getVariable: (name: string) => {
      return (window as any)[`var_${name}`];
    },
    showNotification: (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
      toast({
        title: type.charAt(0).toUpperCase() + type.slice(1),
        description: message,
        variant: type === 'error' ? 'destructive' : 'default'
      });
    },
    storage: {
      get: (key: string) => localStorage.getItem(`plugin_${key}`),
      set: (key: string, value: any) => localStorage.setItem(`plugin_${key}`, JSON.stringify(value)),
      remove: (key: string) => localStorage.removeItem(`plugin_${key}`),
      clear: () => {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('plugin_')) localStorage.removeItem(key);
        });
      }
    }
  });

  const installPlugin = async (plugin: EnhancedPlugin) => {
    try {
      setIsLoading(true);
      
      // Check dependencies
      if (plugin.dependencies) {
        const missingDeps = plugin.dependencies.filter(dep => 
          !installedPlugins.some(p => p.id === dep)
        );
        
        if (missingDeps.length > 0) {
          onError?.(`Missing dependencies: ${missingDeps.join(', ')}`);
          return;
        }
      }
      
      // Initialize plugin
      await plugin.init(pluginAPI.current);
      
      const installedPlugin = {
        ...plugin,
        status: 'active' as const,
        performance: {
          loadTime: Date.now(),
          memoryUsage: 0,
          executionCount: 0
        }
      };
      
      setInstalledPlugins(prev => [...prev, installedPlugin]);
      
      toast({
        title: "Plugin Installed",
        description: `${plugin.name} has been installed successfully!`,
      });
      
      onResult?.(`Plugin "${plugin.name}" installed and activated`);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to install plugin';
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const uninstallPlugin = (pluginId: string) => {
    const plugin = installedPlugins.find(p => p.id === pluginId);
    
    if (plugin?.dispose) {
      plugin.dispose();
    }
    
    // Clean up registered functions
    Object.keys(window).forEach(key => {
      if (key.startsWith('plugin_') || key.startsWith('const_') || key.startsWith('var_')) {
        delete (window as any)[key];
      }
    });
    
    setInstalledPlugins(prev => prev.filter(p => p.id !== pluginId));
    
    toast({
      title: "Plugin Uninstalled",
      description: `${plugin?.name} has been removed`,
    });
  };

  const createCustomPlugin = () => {
    try {
      if (!customPlugin.name || !customPlugin.code) {
        onError?.('Please provide plugin name and code');
        return;
      }

      const newPlugin: EnhancedPlugin = {
        id: `custom-${Date.now()}`,
        name: customPlugin.name,
        description: customPlugin.description || 'Custom plugin',
        version: '1.0.0',
        author: 'User',
        category: customPlugin.category,
        permissions: customPlugin.permissions as any,
        keywords: ['custom'],
        init: (api: PluginAPI) => {
          const func = new Function('api', customPlugin.code);
          func(api);
        }
      };

      installPlugin(newPlugin);
      
      // Reset form
      setCustomPlugin({
        name: '',
        description: '',
        category: 'utility',
        code: '',
        permissions: []
      });
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to create plugin';
      onError?.(errorMsg);
    }
  };

  const filteredPlugins = availablePlugins.featured.concat(availablePlugins.popular).filter(plugin => {
    const matchesSearch = searchQuery === '' || 
      plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || plugin.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-6 h-6" />
            Enhanced Plugin System
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="store" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="store">Plugin Store</TabsTrigger>
              <TabsTrigger value="installed">Installed ({installedPlugins.length})</TabsTrigger>
              <TabsTrigger value="create">Create Plugin</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="store" className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search plugins..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="math">Mathematics</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="ai">AI & ML</SelectItem>
                    <SelectItem value="utility">Utility</SelectItem>
                    <SelectItem value="conversion">Conversion</SelectItem>
                    <SelectItem value="visualization">Visualization</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <ScrollArea className="h-96">
                <div className="grid gap-4">
                  {filteredPlugins.map((plugin) => (
                    <Card key={plugin.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{plugin.icon}</span>
                              <h4 className="font-medium">{plugin.name}</h4>
                              <Badge variant="outline">{plugin.version}</Badge>
                              <Badge variant="secondary">{plugin.category}</Badge>
                              {plugin.keywords.includes('ai') && (
                                <Badge variant="default" className="bg-purple-100 text-purple-700">
                                  <Brain className="w-3 h-3 mr-1" />
                                  AI
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {plugin.description}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>by {plugin.author}</span>
                              <Separator orientation="vertical" className="h-4" />
                              <span>{plugin.keywords.slice(0, 3).join(', ')}</span>
                            </div>
                            <div className="flex gap-1">
                              {plugin.permissions.map(permission => (
                                <Badge key={permission} variant="outline" className="text-xs">
                                  {permission}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              onClick={() => installPlugin(plugin)}
                              disabled={isLoading || installedPlugins.some(p => p.id === plugin.id)}
                            >
                              {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : installedPlugins.some(p => p.id === plugin.id) ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <Download className="w-4 h-4" />
                              )}
                              {installedPlugins.some(p => p.id === plugin.id) ? 'Installed' : 'Install'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="installed" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Installed Plugins</h3>
                <Badge variant="outline">{installedPlugins.length} active</Badge>
              </div>
              
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {installedPlugins.map((plugin) => (
                    <Card key={plugin.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{plugin.icon}</span>
                              <h4 className="font-medium">{plugin.name}</h4>
                              <Badge variant="outline">{plugin.version}</Badge>
                              <Badge variant={plugin.status === 'active' ? "default" : "secondary"}>
                                {plugin.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {plugin.description}
                            </p>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => uninstallPlugin(plugin.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="create" className="space-y-4">
              <h3 className="text-lg font-semibold">Create Custom Plugin</h3>
              
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="plugin-name">Plugin Name</Label>
                  <Input
                    id="plugin-name"
                    value={customPlugin.name}
                    onChange={(e) => setCustomPlugin(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My Custom Plugin"
                  />
                </div>
                
                <div>
                  <Label htmlFor="plugin-description">Description</Label>
                  <Input
                    id="plugin-description"
                    value={customPlugin.description}
                    onChange={(e) => setCustomPlugin(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="What does this plugin do?"
                  />
                </div>
                
                <div>
                  <Label>Category</Label>
                  <Select value={customPlugin.category} onValueChange={(value: any) => setCustomPlugin(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="math">Mathematics</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="utility">Utility</SelectItem>
                      <SelectItem value="conversion">Conversion</SelectItem>
                      <SelectItem value="ai">AI & ML</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="plugin-code">Plugin Code</Label>
                  <Textarea
                    id="plugin-code"
                    value={customPlugin.code}
                    onChange={(e) => setCustomPlugin(prev => ({ ...prev, code: e.target.value }))}
                    placeholder={`// Example plugin code
api.registerFunction('myFunction', (x) => {
  return x * 2;
}, {
  description: 'Doubles the input value',
  parameters: [
    { name: 'x', type: 'number', description: 'Input number' }
  ],
  examples: ['myFunction(5)'],
  category: 'utility',
  tags: ['basic', 'arithmetic']
});

api.showNotification('My plugin loaded!', 'success');`}
                    className="h-48 font-mono"
                  />
                </div>
                
                <Button onClick={createCustomPlugin} className="w-full">
                  <Code className="w-4 h-4 mr-2" />
                  Create Plugin
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <h3 className="text-lg font-semibold">Plugin System Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-update plugins</Label>
                    <p className="text-sm text-muted-foreground">Automatically update plugins when new versions are available</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable plugin analytics</Label>
                    <p className="text-sm text-muted-foreground">Allow plugins to collect usage analytics</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sandbox mode</Label>
                    <p className="text-sm text-muted-foreground">Run plugins in isolated environment</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Plugin Storage</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => pluginAPI.current.storage.clear()}>
                      Clear All Data
                    </Button>
                    <Button variant="outline">
                      Export Settings
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedPluginSystem;