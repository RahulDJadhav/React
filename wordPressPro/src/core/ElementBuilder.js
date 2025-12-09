class ElementBuilder {
  constructor(elementorSystem) {
    this.elementor = elementorSystem;
    this.elements = [];
    this.currentElement = null;
  }

  createElement(widgetType, settings = {}) {
    const widget = this.elementor.getWidget(widgetType);
    if (!widget) {
      throw new Error(`Widget ${widgetType} not found`);
    }

    const element = {
      id: this.generateId(),
      type: widgetType,
      settings: this.sanitizeSettings(widget, settings),
      widget: widget
    };

    this.elements.push(element);
    this.currentElement = element;
    
    this.elementor.pluginManager.doAction('element:created', element);
    return this;
  }

  updateSettings(settings) {
    if (!this.currentElement) return this;
    
    const widget = this.currentElement.widget;
    this.currentElement.settings = {
      ...this.currentElement.settings,
      ...this.sanitizeSettings(widget, settings)
    };
    
    this.elementor.pluginManager.doAction('element:updated', this.currentElement);
    return this;
  }

  render() {
    return this.elements.map(element => {
      const instance = new element.widget.component(element.settings);
      return {
        id: element.id,
        html: instance.render(),
        element: element
      };
    });
  }

  sanitizeSettings(widget, settings) {
    const sanitized = {};
    const controls = widget.controls || {};
    
    Object.keys(settings).forEach(key => {
      const control = controls[key];
      if (control) {
        sanitized[key] = this.elementor.controlsManager?.sanitize(control, settings[key]) || settings[key];
      } else {
        sanitized[key] = settings[key];
      }
    });
    
    return sanitized;
  }

  generateId() {
    return 'element_' + Math.random().toString(36).substr(2, 9);
  }

  getElementById(id) {
    return this.elements.find(el => el.id === id);
  }

  removeElement(id) {
    const index = this.elements.findIndex(el => el.id === id);
    if (index > -1) {
      const element = this.elements[index];
      this.elements.splice(index, 1);
      this.elementor.pluginManager.doAction('element:removed', element);
    }
    return this;
  }
}

export default ElementBuilder;