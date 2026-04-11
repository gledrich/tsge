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

  it('manages children with addChild and removeChild', () => {
    const parent = new TransformComponent();
    const child = new TransformComponent();
    const otherParent = new TransformComponent();
    
    // Add child
    parent.addChild(child);
    expect(child.parent).toBe(parent);
    expect(parent.children.has(child)).toBe(true);
    
    // Add same child again (branch coverage for "if (child.parent === this) return")
    parent.addChild(child);
    expect(parent.children.size).toBe(1);
    
    // Move child to another parent (branch coverage for "if (child.parent)")
    otherParent.addChild(child);
    expect(child.parent).toBe(otherParent);
    expect(parent.children.has(child)).toBe(false);
    expect(otherParent.children.has(child)).toBe(true);
    
    // Remove child
    otherParent.removeChild(child);
    expect(child.parent).toBeUndefined();
    expect(otherParent.children.has(child)).toBe(false);
    
    // Remove child that isn't ours (branch coverage for "if (child.parent === this)")
    parent.removeChild(child);
    expect(child.parent).toBeUndefined();
  });

  it('calculates world properties with nested hierarchies', () => {
    const root = new TransformComponent();
    root.position = new Vector2(100, 100);
    root.rotation = Math.PI; // 180 degrees
    root.scale = new Vector2(2, 2);
    
    const mid = new TransformComponent();
    mid.position = new Vector2(50, 0); // 100 units left in world space due to rotation and scale
    mid.parent = root;
    
    const leaf = new TransformComponent();
    leaf.position = new Vector2(10, 0);
    leaf.parent = mid;
    
    // root (100, 100)
    // mid local (50, 0) * root scale (2) = (100, 0)
    // mid local (100, 0) rotated by 180 = (-100, 0)
    // mid world = root (100, 100) + mid local (-100, 0) = (0, 100)
    expect(mid.worldPosition.x).toBeCloseTo(0);
    expect(mid.worldPosition.y).toBeCloseTo(100);
    
    // leaf local (10, 0) * mid world scale (2) = (20, 0)
    // leaf local (20, 0) rotated by 180 = (-20, 0)
    // leaf world = mid world (0, 100) + leaf local (-20, 0) = (-20, 100)
    expect(leaf.worldPosition.x).toBeCloseTo(-20);
    expect(leaf.worldPosition.y).toBeCloseTo(100);
    
    expect(leaf.worldRotation).toBeCloseTo(Math.PI);
    expect(leaf.worldScale.x).toBe(2);
  });

  it('caches world properties and only recalculates when dirty', () => {
    const parent = new TransformComponent();
    const child = new TransformComponent();
    parent.addChild(child);
    
    // Initial access to cache values
    const pos1 = child.worldPosition;
    const pos2 = child.worldPosition;
    
    // Since worldPosition returns a clone, we can't check identity, 
    // but we can check if the underlying update method was called.
    const updateSpy = jest.spyOn(child as any, 'updateWorldTransform');
    
    // Access again - should NOT call update
    child.worldPosition;
    expect(updateSpy).not.toHaveBeenCalled();
    
    // Modify parent - should set child as dirty
    parent.position = new Vector2(100, 100);
    
    // Access again - SHOULD call update now
    child.worldPosition;
    expect(updateSpy).toHaveBeenCalledTimes(1);
    
    // Access again - should NOT call update (cached again)
    child.worldPosition;
    expect(updateSpy).toHaveBeenCalledTimes(1);
  });

  it('propagates dirty flag to deep children', () => {
    const root = new TransformComponent();
    const mid = new TransformComponent();
    const leaf = new TransformComponent();
    
    root.addChild(mid);
    mid.addChild(leaf);
    
    // Populate caches
    root.worldPosition;
    mid.worldPosition;
    leaf.worldPosition;
    
    const rootSpy = jest.spyOn(root as any, 'updateWorldTransform');
    const midSpy = jest.spyOn(mid as any, 'updateWorldTransform');
    const leafSpy = jest.spyOn(leaf as any, 'updateWorldTransform');
    
    // Change root
    root.rotation = 1;
    
    // Access leaf - should trigger updates up the chain
    leaf.worldPosition;
    expect(leafSpy).toHaveBeenCalled();
    expect(midSpy).toHaveBeenCalled();
    expect(rootSpy).toHaveBeenCalled();
  });

  it('handles addChild and removeChild dirty state correctly', () => {
    const parent = new TransformComponent();
    const child = new TransformComponent();
    
    // Initial access
    child.worldPosition;
    const spy = jest.spyOn(child as any, 'updateWorldTransform');
    
    // Add to parent - should become dirty
    parent.addChild(child);
    child.worldPosition;
    expect(spy).toHaveBeenCalledTimes(1);
    
    // Remove from parent - should become dirty
    parent.removeChild(child);
    child.worldPosition;
    expect(spy).toHaveBeenCalledTimes(2);
  });
});
