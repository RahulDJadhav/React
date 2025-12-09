# Elementor-like Plugin & Socket System

A modular plugin architecture with event-driven communication, similar to Elementor's system.

## Core Features

- **Plugin Manager**: Register and manage plugins with lifecycle hooks
- **Socket System**: Event-driven communication between plugins
- **Widget Registry**: Manage UI components with categories and controls
- **Hook System**: WordPress-style actions and filters
- **Modular Architecture**: Easy to extend and customize

## Quick Start

```javascript
import ElementorSystem from './src/core/ElementorSystem.js';
import TextWidgetPlugin from './src/examples/TextWidgetPlugin.js';

const elementor = new ElementorSystem();
elementor.registerPlugin('TextWidget', TextWidgetPlugin);
elementor.init();
```

## Creating a Plugin

```javascript
import BasePlugin from './src/core/BasePlugin.js';

class MyPlugin extends BasePlugin {
  registerWidgets() {
    this.pluginManager.widgetRegistry.register('my-widget', {
      title: 'My Widget',
      category: 'custom',
      component: MyWidgetComponent,
      controls: {
        text: { type: 'text', label: 'Text', default: 'Hello' }
      }
    });
  }

  registerHooks() {
    this.addAction('my:action', (data) => {
      console.log('Action triggered:', data);
    });
  }
}
```

## Socket Communication

```javascript
// Plugin A emits event
pluginA.emit('data:updated', { value: 'new data' });

// Plugin B listens for event
pluginB.on('data:updated', (data) => {
  console.log('Received:', data.value);
});
```

## Hook System

```javascript
// Add action hook
elementor.pluginManager.addHook('widget:render', (widget) => {
  console.log('Widget rendering:', widget.name);
});

// Trigger action
elementor.pluginManager.doAction('widget:render', widget);

// Add filter hook
elementor.pluginManager.addHook('content:filter', (content) => {
  return content.toUpperCase();
});

// Apply filter
const filtered = elementor.pluginManager.applyFilters('content:filter', 'hello');
```

## Architecture

- `src/core/` - Core system files
- `src/plugins/` - Custom plugins
- `src/widgets/` - Widget components
- `src/examples/` - Usage examples