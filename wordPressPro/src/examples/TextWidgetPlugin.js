import BasePlugin from '../core/BasePlugin.js';

class TextWidget {
  constructor(props = {}) {
    this.props = {
      text: 'Default Text',
      color: '#000000',
      fontSize: '16px',
      ...props
    };
  }

  render() {
    return `
      <div class="text-widget" style="color: ${this.props.color}; font-size: ${this.props.fontSize};">
        ${this.props.text}
      </div>
    `;
  }
}

class TextWidgetPlugin extends BasePlugin {
  constructor(pluginManager) {
    super(pluginManager);
    this.name = 'TextWidgetPlugin';
    this.version = '1.0.0';
  }

  registerWidgets() {
    this.pluginManager.widgetRegistry.register('text', {
      title: 'Text',
      icon: 'text-icon',
      category: 'basic',
      component: TextWidget,
      controls: {
        text: {
          type: 'text',
          label: 'Text Content',
          default: 'Default Text'
        },
        color: {
          type: 'color',
          label: 'Text Color',
          default: '#000000'
        },
        fontSize: {
          type: 'slider',
          label: 'Font Size',
          default: '16px',
          min: '10px',
          max: '72px'
        }
      }
    });
  }

  registerHooks() {
    this.addAction('text:update', (data) => {
      console.log('Text widget updated:', data);
      this.emit('widget:changed', { type: 'text', data });
    });

    this.addFilter('text:content', (content, widget) => {
      return content.toUpperCase();
    });
  }
}

export default TextWidgetPlugin;