import React, { useState, useRef } from 'react';
import { Plugin } from '@/types/plugin'; // Import the Plugin interface
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle, PlugZap, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import type { CalculatorPlugin, PluginContext, PluginWorkerMessage } from '@/types/plugin-api';

declare const read_file: (path: string) => string; // Declare the read_file tool
const workerUrl = '/src/calculator-plugins/plugin-worker.js';

const runPluginInWorker = async (code: string, ctx: PluginContext) => {
  return new Promise<{ success: boolean; error?: string }>((resolve) => {
    const worker = new Worker(workerUrl, { type: 'module' });
    worker.onmessage = (e) => {
      const msg: PluginWorkerMessage = e.data;
      if (msg.type === 'result') {
        resolve({ success: true });
        worker.terminate();
      } else if (msg.type === 'error') {
        resolve({ success: false, error: msg.error });
        worker.terminate();
      }
    };
    worker.postMessage({ type: 'init', code, ctx });
  });
};

const getPluginCode = async (source: string): Promise<string> => {
  if (source.startsWith('http')) {
    const res = await fetch(source);
    return await res.text();
  } else {
    return read_file(source);
  }
};

const PluginManager: React.FC = () => {
  const [installedPlugins, setInstalledPlugins] = useState<Plugin[]>([
    // Placeholder data for demonstration
    { id: 'plugin-1', name: 'Example Function Plugin', status: 'enabled', source: '/plugins/example-function.js' },
    { id: 'plugin-2', name: 'UI Theme Plugin', status: 'disabled', source: 'https://example.com/plugins/theme.js' },
  ]);
  const [newPluginSource, setNewPluginSource] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uiPluginPanels, setUiPluginPanels] = useState<React.ReactNode[]>([]);
  const { toast } = useToast();
  const iframeRefs = useRef<Record<string, HTMLIFrameElement | null>>({});

  // Local registry for plugin functions
  const pluginFunctionRegistry: Record<string, (...args: any[]) => any> = {};

  // Placeholder function to conceptually handle loading and executing a plugin
  const loadAndExecutePlugin = async (plugin: Plugin) => {
    if (plugin.type === 'function') {
      // ...existing function plugin logic (Web Worker)...
    } else if (plugin.type === 'ui') {
      // Load UI plugin in a sandboxed iframe
      const iframeId = `plugin-iframe-${plugin.id}`;
      const iframe = document.createElement('iframe');
      iframe.sandbox.add('allow-scripts');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      iframeRefs.current[plugin.id] = iframe;
      // Fetch plugin code
      const code = await fetch(plugin.source).then(r => r.text());
      // Expose a mountUI callback
      const mountUI = (component: React.ReactNode) => {
        setUiPluginPanels((prev) => [...prev, component]);
      };
      // Create plugin context
      const ctx: PluginContext = {
        getCurrentValue: () => '',
        setCurrentValue: () => {},
        getExpression: () => '',
        setExpression: () => {},
        showToast: (opts) => toast(opts),
        registerFunction: (name, fn) => { pluginFunctionRegistry[name] = fn; },
        registerButton: () => {},
        mountUI,
      };
      // eslint-disable-next-line no-new-func
      const pluginFactory = new Function('ctx', code + '\nreturn plugin;');
      const loadedPlugin = pluginFactory(ctx);
      if (loadedPlugin && typeof loadedPlugin.init === 'function') {
        loadedPlugin.init(ctx);
      }
    }
  };

  const validateSource = (src: string) => {
    if (!src.trim()) return 'Plugin source cannot be empty.';
    if (!src.startsWith('http') && !src.endsWith('.js')) return 'Local plugin must be a .js file.';
    return '';
  };

  const handleAddPlugin = () => {
    setError(null);
    setSuccess(null);
    const validationMsg = validateSource(newPluginSource);
    if (validationMsg) {
      setError(validationMsg);
      toast({ title: 'Invalid Plugin Source', description: validationMsg, variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      // Simulate plugin loading
      try {
        // Basic logic to read file content if the source looks like a file path
        if (newPluginSource && !newPluginSource.startsWith('http')) {
          try {
            const fileContent = read_file(newPluginSource);
            console.log('Read plugin file content:', fileContent);
          } catch (error) {
            console.error('Error reading plugin file:', error);
          }
        }

        // Conceptually add the new plugin to the list (without actual loading/execution yet)
        const newPlugin: Plugin = {
          id: `plugin-${Date.now()}`, // Simple unique ID
          name: newPluginSource.split('/').pop() || 'Unnamed Plugin', // Basic name from source
          status: 'disabled', // Initially disabled
          source: newPluginSource,
        };
        setInstalledPlugins([...installedPlugins, newPlugin]);
        setNewPluginSource(''); // Clear the input after attempting to add
        setSuccess('Plugin added successfully.');
        toast({ title: 'Plugin Added', description: newPlugin.name });
      } catch (e) {
        setError('Failed to add plugin.');
        toast({ title: 'Error', description: 'Failed to add plugin.', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    }, 400);
  };

  const handleEnablePlugin = async (pluginId: string) => {
    setIsLoading(true);
    setError(null);
    const plugin = installedPlugins.find(p => p.id === pluginId);
    if (!plugin) return;
    try {
      const code = await getPluginCode(plugin.source);
      // Minimal PluginContext for demo
      const ctx: PluginContext = {
        getCurrentValue: () => '',
        setCurrentValue: () => {},
        getExpression: () => '',
        setExpression: () => {},
        showToast: (opts) => toast(opts),
        registerFunction: (name, fn) => { pluginFunctionRegistry[name] = fn; },
        registerButton: () => {},
      };
      const result = await runPluginInWorker(code, ctx);
      if (result.success) {
        setInstalledPlugins(installedPlugins.map(p => p.id === pluginId ? { ...p, status: 'enabled' } : p));
        toast({ title: 'Plugin Enabled', description: plugin.name });
      } else {
        setError(result.error || 'Failed to enable plugin.');
        setInstalledPlugins(installedPlugins.map(p => p.id === pluginId ? { ...p, status: 'error' } : p));
      }
    } catch (e) {
      setError((e as Error).message);
      setInstalledPlugins(installedPlugins.map(p => p.id === pluginId ? { ...p, status: 'error' } : p));
    } finally {
      setIsLoading(false);
    }
  };

  // Placeholder for disabling a plugin
  const handleDisablePlugin = (pluginId: string) => {
    console.log('Attempting to disable plugin:', pluginId);
    setInstalledPlugins(installedPlugins.map(plugin =>
      plugin.id === pluginId ? { ...plugin, status: 'disabled' } : plugin
    ));
  };

  // Placeholder for removing a plugin
  const handleRemovePlugin = (pluginId: string) => {
    console.log('Attempting to remove plugin:', pluginId);
    setInstalledPlugins(installedPlugins.filter(plugin => plugin.id !== pluginId));
  };

  const handleTogglePlugin = (pluginId: string) => {
    setInstalledPlugins(installedPlugins.map(plugin => {
      if (plugin.id === pluginId) {
        const newStatus = plugin.status === 'enabled' ? 'disabled' : 'enabled';
        console.log(`Attempting to toggle plugin ${pluginId} to status: ${newStatus}`);
        return { ...plugin, status: newStatus };
      }
      return plugin;
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg" aria-label="Plugin Manager">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <PlugZap className="mr-2 h-6 w-6 text-accent" />
          Plugin Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Installed Plugins</h3>
          {installedPlugins.length === 0 ? (
            <p>No plugins installed yet.</p>
          ) : (
            <ul className="space-y-2">
              {installedPlugins.map((plugin) => (
                <li key={plugin.id} className="flex flex-col md:flex-row md:items-center md:justify-between border rounded p-2 bg-muted/30">
                  <div>
                    <strong>{plugin.name}</strong> <span className="text-xs text-muted-foreground">({plugin.status})</span>
                    <p className="text-xs text-muted-foreground break-all">Source: {plugin.source}</p>
                  </div>
                  <div className="flex gap-2 mt-2 md:mt-0">
                    <Button size="sm" variant={plugin.status === 'enabled' ? 'destructive' : 'default'} onClick={() => handleTogglePlugin(plugin.id)} aria-label={plugin.status === 'enabled' ? 'Disable plugin' : 'Enable plugin'}>
                      {plugin.status === 'enabled' ? 'Disable' : 'Enable'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleRemovePlugin(plugin.id)} aria-label="Remove plugin">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {plugin.status === 'error' && (
                    <span className="plugin-error text-destructive text-xs ml-2 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />Error loading plugin</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Add New Plugin</h3>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <Label htmlFor="pluginSource" className="md:w-48">Plugin Source (File Path or URL):</Label>
            <Input type="text" id="pluginSource" value={newPluginSource} onChange={(e) => setNewPluginSource(e.target.value)} className="flex-1" aria-label="Plugin source input" aria-invalid={!!error} />
            <Button onClick={handleAddPlugin} disabled={isLoading} aria-busy={isLoading} aria-label="Add plugin">
              {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</>) : 'Add Plugin'}
            </Button>
          </div>
          <div aria-live="polite" aria-atomic="true">
            {error && (
              <Alert variant="destructive" className="mt-2" role="alert">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && !error && (
              <Alert variant="default" className="mt-2" role="status">
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
        {/* Render UI plugin panels */}
        {uiPluginPanels.length > 0 && (
          <div className="space-y-4 mt-6">
            <h3 className="text-lg font-semibold">Plugin UI Panels</h3>
            {uiPluginPanels.map((panel, idx) => (
              <div key={idx} className="border rounded p-2 bg-muted/20">{panel}</div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <span className="text-xs text-muted-foreground">Plugins are loaded in a sandboxed environment. Only trusted plugins should be added.</span>
      </CardFooter>
    </Card>
  );
};

export default PluginManager;