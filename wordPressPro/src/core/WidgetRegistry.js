class WidgetRegistry {
  constructor(pluginManager) {
    this.widgets = new Map();
    this.categories = new Map();
    this.pluginManager = pluginManager;
  }

  register(widgetName, widgetConfig) {
    if (this.widgets.has(widgetName)) {
      throw new Error(`Widget ${widgetName} already registered`);
    }

    const widget = {
      name: widgetName,
      title: widgetConfig.title || widgetName,
      icon: widgetConfig.icon || 'default',
      category: widgetConfig.category || 'basic',
      component: widgetConfig.component,
      controls: widgetConfig.controls || {},
      ...widgetConfig
    };

    this.widgets.set(widgetName, widget);
    this.addToCategory(widget.category, widgetName);
    
    this.pluginManager.emit('widget:registered', { name: widgetName, widget });
    return widget;
  }

  get(widgetName) {
    return this.widgets.get(widgetName);
  }

  getByCategory(category) {
    const categoryWidgets = this.categories.get(category) || [];
    return categoryWidgets.map(name => this.widgets.get(name));
  }

  addToCategory(category, widgetName) {
    if (!this.categories.has(category)) {
      this.categories.set(category, []);
    }
    this.categories.get(category).push(widgetName);
  }

  getAllCategories() {
    return Array.from(this.categories.keys());
  }

  getAllWidgets() {
    return Array.from(this.widgets.values());
  }
}

export default WidgetRegistry;