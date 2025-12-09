class PluginManager {
  constructor() {
    this.plugins = new Map();
    this.hooks = new Map();
    this.sockets = new Map();
  }

  register(pluginName, pluginClass) {
    if (this.plugins.has(pluginName)) {
      throw new Error(`Plugin ${pluginName} already registered`);
    }
    
    const plugin = new pluginClass(this);
    this.plugins.set(pluginName, plugin);
    
    if (plugin.init) {
      plugin.init();
    }
    
    this.emit('plugin:registered', { name: pluginName, plugin });
    return plugin;
  }

  get(pluginName) {
    return this.plugins.get(pluginName);
  }

  addHook(hookName, callback, priority = 10) {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, []);
    }
    this.hooks.get(hookName).push({ callback, priority });
    this.hooks.get(hookName).sort((a, b) => a.priority - b.priority);
  }

  doAction(hookName, ...args) {
    const hooks = this.hooks.get(hookName) || [];
    hooks.forEach(({ callback }) => callback(...args));
  }

  applyFilters(hookName, value, ...args) {
    const hooks = this.hooks.get(hookName) || [];
    return hooks.reduce((acc, { callback }) => callback(acc, ...args), value);
  }

  createSocket(socketName) {
    const socket = new EventSocket(socketName);
    this.sockets.set(socketName, socket);
    return socket;
  }

  getSocket(socketName) {
    return this.sockets.get(socketName);
  }

  emit(event, data) {
    this.sockets.forEach(socket => socket.emit(event, data));
  }
}

class EventSocket {
  constructor(name) {
    this.name = name;
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) listeners.splice(index, 1);
    }
  }

  emit(event, data) {
    const listeners = this.listeners.get(event) || [];
    listeners.forEach(callback => callback(data));
  }
}

export default PluginManager;