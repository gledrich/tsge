import RenderComponent from './RenderComponent';

class MockRenderComponent extends RenderComponent {
  draw() {}
}

describe('RenderComponent', () => {
  it('identifies as a render component', () => {
    const component = new MockRenderComponent();
    expect(component.isRenderComponent).toBe(true);
  });
});
