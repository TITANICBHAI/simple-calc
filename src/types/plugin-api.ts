// Plugin API contract for secure plugins

export interface PluginContext {
  // Basic calculator state access
  getCurrentValue(): string;
  setCurrentValue(val: string): void;
  getExpression(): string;
  setExpression(expr: string): void;
  showToast(opts: { title: string; description?: string; variant?: 'default' | 'destructive' }): void;
  // Register custom functions or buttons
  registerFunction(name: string, fn: (...args: any[]) => any): void;
  registerButton(config: {
    label: string;
    onClick: () => void;
    description?: string;
    icon?: string;
  }): void;
  // For UI plugins: mount a React component
  mountUI?(component: React.ReactNode): void;
}

export interface CalculatorPlugin {
  id: string;
  name: string;
  description?: string;
  version?: string;
  type: 'function' | 'ui';
  init(ctx: PluginContext): void;
  dispose?(): void;
}

// For worker communication
export type PluginWorkerMessage =
  | { type: 'init'; ctx: any }
  | { type: 'call'; fn: string; args: any[] }
  | { type: 'result'; result: any }
  | { type: 'error'; error: string };
