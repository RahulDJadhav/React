class ControlsManager {
  constructor() {
    this.controlTypes = new Map();
    this.registerDefaultControls();
  }

  registerDefaultControls() {
    this.register('text', {
      render: (control, value) => `<input type="text" value="${value || control.default || ''}" placeholder="${control.label}">`,
      sanitize: (value) => String(value || '')
    });

    this.register('color', {
      render: (control, value) => `<input type="color" value="${value || control.default || '#000000'}">`,
      sanitize: (value) => value || '#000000'
    });

    this.register('slider', {
      render: (control, value) => `
        <input type="range" 
          min="${control.min || 0}" 
          max="${control.max || 100}" 
          value="${value || control.default || 50}">
        <span>${value || control.default}</span>
      `,
      sanitize: (value) => Number(value) || 0
    });

    this.register('select', {
      render: (control, value) => {
        const options = Object.entries(control.options || {})
          .map(([key, label]) => `<option value="${key}" ${key === value ? 'selected' : ''}>${label}</option>`)
          .join('');
        return `<select>${options}</select>`;
      },
      sanitize: (value) => String(value || '')
    });
  }

  register(type, config) {
    this.controlTypes.set(type, config);
  }

  render(control, value) {
    const controlType = this.controlTypes.get(control.type);
    return controlType ? controlType.render(control, value) : '';
  }

  sanitize(control, value) {
    const controlType = this.controlTypes.get(control.type);
    return controlType ? controlType.sanitize(value) : value;
  }
}

export default ControlsManager;