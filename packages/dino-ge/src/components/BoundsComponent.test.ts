import BoundsComponent from './BoundsComponent.js';

describe('BoundsComponent', () => {
  it('initialises with default values', () => {
    const bounds = new BoundsComponent();
    expect(bounds.width).toBe(0);
    expect(bounds.height).toBe(0);
  });

  it('initialises with provided values', () => {
    const bounds = new BoundsComponent(100, 200);
    expect(bounds.width).toBe(100);
    expect(bounds.height).toBe(200);
  });
});
