import PluginManager from './PluginManager.js';
import WidgetRegistry from './WidgetRegistry.js';
import ControlsManager from './ControlsManager.js';
import ElementBuilder from './ElementBuilder.js';

class ElementorSystem {
  constructor() {
    this.pluginManager = new PluginManager();
    this.widgetRegistry = new WidgetRegistry(this.pluginManager);
    this.controlsManager = new ControlsManager();
    this.elementBuilder = new ElementBuilder(this);
    
    this.pluginManager.widgetRegistry = this.widgetRegistry;
    this.pluginManager.controlsManager = this.controlsManager;
    
    this.setupCoreHooks();
  }

  setupCoreHooks() {
    this.pluginManager.addHook('system:init', () => {
      console.log('Elementor System Initialized');
    });

    this.pluginManager.addHook('widget:render', (widget, props) => {
      return this.renderWidget(widget, props);
    });
  }

  registerPlugin(pluginName, pluginClass) {
    return this.pluginManager.register(pluginName, pluginClass);
  }

  registerWidget(widgetName, widgetConfig) {
    return this.widgetRegistry.register(widgetName, widgetConfig);
  }

  renderWidget(widget, props = {}) {
    if (!widget || !widget.component) {
      return null;
    }

    const Component = widget.component;
    return new Component(props);
  }

  init() {
    this.pluginManager.doAction('system:init');
    return this;
  }

  getPlugin(name) {
    return this.pluginManager.get(name);
  }

  getWidget(name) {
    return this.widgetRegistry.get(name);
  }

  getAllWidgets() {
    return this.widgetRegistry.getAllWidgets();
  }

  getWidgetsByCategory(category) {
    return this.widgetRegistry.getByCategory(category);
  }

  createElement(widgetType, settings) {
    return this.elementBuilder.createElement(widgetType, settings);
  }

  renderElements() {
    return this.elementBuilder.render();
  }

  registerControl(type, config) {
    return this.controlsManager.register(type, config);
  }
}

export default ElementorSystem;