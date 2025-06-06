// Example function plugin for Calcul8
const plugin = {
  id: 'example-fn',
  name: 'Example Function Plugin',
  type: 'function',
  version: '1.0.0',
  description: 'Adds a custom square function to the calculator.',
  init(ctx) {
    ctx.registerFunction('square', (x) => Number(x) * Number(x));
    ctx.showToast({ title: 'Plugin Loaded', description: 'Square function is now available.' });
  },
  dispose() {
    // Clean up if needed
  }
};
