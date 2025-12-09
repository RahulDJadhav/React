import ElementorSystem from '../core/ElementorSystem.js';
import TextWidgetPlugin from './TextWidgetPlugin.js';
import ButtonWidgetPlugin from './ButtonWidgetPlugin.js';

// Initialize system
const elementor = new ElementorSystem();

// Register plugins
elementor.registerPlugin('TextWidget', TextWidgetPlugin);
elementor.registerPlugin('ButtonWidget', ButtonWidgetPlugin);
elementor.init();

// Advanced Usage: Element Builder
console.log('\n=== Element Builder Demo ===');

// Create elements with builder pattern
elementor.createElement('text', {
  text: 'Welcome to our site!',
  color: '#2c3e50',
  fontSize: '32px'
}).createElement('button', {
  text: 'Get Started',
  backgroundColor: '#3498db',
  textColor: '#ffffff'
}).createElement('text', {
  text: 'Contact us for more info',
  color: '#7f8c8d',
  fontSize: '14px'
});

// Render all elements
const renderedElements = elementor.renderElements();
console.log('Rendered Elements:');
renderedElements.forEach((element, index) => {
  console.log(`${index + 1}. ${element.element.type}:`, element.html.replace(/\s+/g, ' ').trim());
});

// Advanced: Custom control type
elementor.registerControl('textarea', {
  render: (control, value) => `<textarea placeholder="${control.label}">${value || control.default || ''}</textarea>`,
  sanitize: (value) => String(value || '').trim()
});

// Advanced: Plugin communication
const textPlugin = elementor.getPlugin('TextWidget');
const buttonPlugin = elementor.getPlugin('ButtonWidget');

// Cross-plugin communication
textPlugin.on('widget:changed', (data) => {
  buttonPlugin.emit('text:updated', { source: 'text-widget', data });
});

buttonPlugin.on('text:updated', (data) => {
  console.log('\nButton plugin received text update:', data);
});

// Trigger communication
textPlugin.emit('widget:changed', { text: 'New content' });

// Advanced: Dynamic widget creation
class ImageWidget {
  constructor(props = {}) {
    this.props = {
      src: '',
      alt: 'Image',
      width: '100%',
      height: 'auto',
      ...props
    };
  }

  render() {
    return `<img src="${this.props.src}" alt="${this.props.alt}" style="width: ${this.props.width}; height: ${this.props.height};">`;
  }
}

// Register widget directly
elementor.registerWidget('image', {
  title: 'Image',
  category: 'media',
  component: ImageWidget,
  controls: {
    src: { type: 'text', label: 'Image URL' },
    alt: { type: 'text', label: 'Alt Text' },
    width: { type: 'text', label: 'Width', default: '100%' },
    height: { type: 'text', label: 'Height', default: 'auto' }
  }
});

console.log('\n=== All Categories ===');
console.log(elementor.widgetRegistry.getAllCategories());

console.log('\n=== Media Widgets ===');
console.log(elementor.getWidgetsByCategory('media'));

export { elementor };