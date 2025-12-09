import ElementorSystem from '../core/ElementorSystem.js';
import TextWidgetPlugin from './TextWidgetPlugin.js';
import ButtonWidgetPlugin from './ButtonWidgetPlugin.js';

// Initialize the system
const elementor = new ElementorSystem();

// Register plugins
elementor.registerPlugin('TextWidget', TextWidgetPlugin);
elementor.registerPlugin('ButtonWidget', ButtonWidgetPlugin);

// Initialize the system
elementor.init();

// Example: Create and render widgets
const textWidget = elementor.renderWidget(
  elementor.getWidget('text'),
  { text: 'Hello World!', color: '#ff0000', fontSize: '24px' }
);

const buttonWidget = elementor.renderWidget(
  elementor.getWidget('button'),
  { 
    text: 'Save Changes', 
    backgroundColor: '#28a745',
    onClick: () => console.log('Save clicked!')
  }
);

// Example: Plugin communication via sockets
const textPlugin = elementor.getPlugin('TextWidget');
const buttonPlugin = elementor.getPlugin('ButtonWidget');

// Listen for events
textPlugin.on('widget:changed', (data) => {
  console.log('Text widget changed:', data);
});

buttonPlugin.on('widget:interaction', (data) => {
  console.log('Button interaction:', data);
});

// Example: Using hooks
elementor.pluginManager.addHook('custom:action', (data) => {
  console.log('Custom action triggered:', data);
});

elementor.pluginManager.doAction('custom:action', { message: 'Hello from hook!' });

// Example: Using filters
const filteredContent = elementor.pluginManager.applyFilters(
  'text:content', 
  'hello world', 
  { widget: 'text' }
);

console.log('Filtered content:', filteredContent); // "HELLO WORLD"

// Display all registered widgets
console.log('All widgets:', elementor.getAllWidgets());
console.log('Basic widgets:', elementor.getWidgetsByCategory('basic'));

export { elementor, textWidget, buttonWidget };