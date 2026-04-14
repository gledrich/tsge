import VisibilityComponent from './VisibilityComponent.js';

describe('VisibilityComponent', () => {
  it('initialises with default value', () => {
    const component = new VisibilityComponent();
    expect(component.visible).toBe(true);
  });

  it('allows updating visible state', () => {
    const component = new VisibilityComponent();
    component.visible = false;
    expect(component.visible).toBe(false);
  });
});
