import RenderComponent from './RenderComponent';

class MockRenderComponent extends RenderComponent {
  draw() {}
}

describe('RenderComponent', () => {
  it('is an instance of RenderComponent', () => {
    const component = new MockRenderComponent();
    expect(component).toBeInstanceOf(RenderComponent);
  });
});
