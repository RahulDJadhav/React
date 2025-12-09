import BasePlugin from '../core/BasePlugin.js';

class ButtonWidget {
  constructor(props = {}) {
    this.props = {
      text: 'Click Me',
      backgroundColor: '#007cba',
      textColor: '#ffffff',
      borderRadius: '4px',
      onClick: () => {},
      ...props
    };
  }

  render() {
    return `
      <button 
        class="button-widget" 
        style="
          background-color: ${this.props.backgroundColor}; 
          color: ${this.props.textColor}; 
          border-radius: ${this.props.borderRadius};
          border: none;
          padding: 10px 20px;
          cursor: pointer;
        "
        onclick="${this.props.onClick}"
      >
        ${this.props.text}
      </button>
    `;
  }
}

class ButtonWidgetPlugin extends BasePlugin {
  constructor(pluginManager) {
    super(pluginManager);
    this.name = 'ButtonWidgetPlugin';
    this.version = '1.0.0';
  }

  registerWidgets() {
    this.pluginManager.widgetRegistry.register('button', {
      title: 'Button',
      icon: 'button-icon',
      category: 'basic',
      component: ButtonWidget,
      controls: {
        text: {
          type: 'text',
          label: 'Button Text',
          default: 'Click Me'
        },
        backgroundColor: {
          type: 'color',
          label: 'Background Color',
          default: '#007cba'
        },
        textColor: {
          type: 'color',
          label: 'Text Color',
          default: '#ffffff'
        },
        borderRadius: {
          type: 'slider',
          label: 'Border Radius',
          default: '4px',
          min: '0px',
          max: '50px'
        }
      }
    });
  }

  registerHooks() {
    this.addAction('button:click', (data) => {
      console.log('Button clicked:', data);
      this.emit('widget:interaction', { type: 'button', action: 'click', data });
    });

    this.addFilter('button:style', (style, widget) => {
      return { ...style, transition: 'all 0.3s ease' };
    });
  }
}

export default ButtonWidgetPlugin;