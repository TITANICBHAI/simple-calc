// Example UI plugin for Calcul8
const plugin = {
  id: 'example-ui',
  name: 'Example UI Plugin',
  type: 'ui',
  version: '1.0.0',
  description: 'Adds a custom UI panel to the calculator.',
  init(ctx) {
    if (ctx.mountUI) {
      ctx.mountUI(
        React.createElement('div', {
          style: { padding: '1rem', background: '#e0f7fa', borderRadius: '8px', color: '#00796b' }
        },
        React.createElement('h3', null, 'Hello from Example UI Plugin!'),
        React.createElement('p', null, 'This panel was injected by a plugin.'))
      );
      ctx.showToast({ title: 'UI Plugin Loaded', description: 'Custom UI panel added.' });
    }
  },
  dispose() {
    // Clean up if needed
  }
};
