import TransformComponent from './TransformComponent';
import Vector2 from './Vector2';

describe('TransformComponent', () => {
  it('initialises with default values', () => {
    const transform = new TransformComponent();
    expect(transform.position.x).toBe(0);
    expect(transform.position.y).toBe(0);
    expect(transform.rotation).toBe(0);
    expect(transform.scale.x).toBe(1);
    expect(transform.scale.y).toBe(1);
  });

  it('calculates world position without parent', () => {
    const transform = new TransformComponent();
    transform.position = new Vector2(10, 20);
    expect(transform.worldPosition.x).toBe(10);
    expect(transform.worldPosition.y).toBe(20);
  });

  it('calculates world position with parent', () => {
    const parent = new TransformComponent();
    parent.position = new Vector2(100, 100);
    
    const child = new TransformComponent();
    child.position = new Vector2(10, 20);
    child.parent = parent;
    
    expect(child.worldPosition.x).toBe(110);
    expect(child.worldPosition.y).toBe(120);
  });

  it('calculates world rotation with parent', () => {
    const parent = new TransformComponent();
    parent.rotation = Math.PI / 2;
    
    const child = new TransformComponent();
    child.rotation = Math.PI / 4;
    child.parent = parent;
    
    expect(child.worldRotation).toBe(Math.PI / 2 + Math.PI / 4);
  });

  it('calculates world scale with parent', () => {
    const parent = new TransformComponent();
    parent.scale = new Vector2(2, 2);
    
    const child = new TransformComponent();
    child.scale = new Vector2(0.5, 0.5);
    child.parent = parent;
    
    expect(child.worldScale.x).toBe(1);
    expect(child.worldScale.y).toBe(1);
  });

  it('calculates world position with parent rotation', () => {
    const parent = new TransformComponent();
    parent.position = new Vector2(100, 100);
    parent.rotation = Math.PI / 2; // 90 degrees
    
    const child = new TransformComponent();
    child.position = new Vector2(10, 0); // 10 units right in local space
    child.parent = parent;
    
    // After 90 degree rotation, local (10, 0) becomes (0, 10)
    expect(child.worldPosition.x).toBeCloseTo(100);
    expect(child.worldPosition.y).toBeCloseTo(110);
  });
});
