class BasePlugin {
  constructor(pluginManager) {
    this.pluginManager = pluginManager;
    this.name = this.constructor.name;
    this.version = '1.0.0';
    this.socket = null;
  }

  init() {
    this.socket = this.pluginManager.createSocket(this.name);
    this.registerHooks();
    this.registerWidgets();
  }

  registerHooks() {
    // Override in child classes
  }

  registerWidgets() {
    // Override in child classes
  }

  addAction(hookName, callback, priority = 10) {
    this.pluginManager.addHook(hookName, callback, priority);
  }

  addFilter(hookName, callback, priority = 10) {
    this.pluginManager.addHook(hookName, callback, priority);
  }

  doAction(hookName, ...args) {
    this.pluginManager.doAction(hookName, ...args);
  }

  applyFilters(hookName, value, ...args) {
    return this.pluginManager.applyFilters(hookName, value, ...args);
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  getWidget(widgetName) {
    return this.pluginManager.widgetRegistry?.get(widgetName);
  }
}

export default BasePlugin;