// Secure plugin loader (Web Worker)
self.onmessage = async function(e) {
  const { type, code, ctx, fn, args } = e.data;
  if (type === 'init') {
    try {
      // eslint-disable-next-line no-new-func
      const pluginFactory = new Function('ctx', code + '\nreturn plugin;');
      self.plugin = pluginFactory(ctx);
      if (self.plugin && typeof self.plugin.init === 'function') {
        self.plugin.init(ctx);
        self.postMessage({ type: 'result', result: 'initialized' });
      }
    } catch (err) {
      self.postMessage({ type: 'error', error: err.message });
    }
  } else if (type === 'call' && self.plugin) {
    try {
      const result = await self.plugin[fn](...(args || []));
      self.postMessage({ type: 'result', result });
    } catch (err) {
      self.postMessage({ type: 'error', error: err.message });
    }
  }
};
