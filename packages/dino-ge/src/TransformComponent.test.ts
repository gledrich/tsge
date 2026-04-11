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
    
    // Access world props hits dirty paths
    expect(leaf.worldRotation).toBeCloseTo(Math.PI);
    expect(leaf.worldScale.x).toBe(2);
    expect(mid.worldPosition.x).toBeCloseTo(0);
    expect(mid.worldPosition.y).toBeCloseTo(100);
    expect(leaf.worldPosition.x).toBeCloseTo(-20);
    expect(leaf.worldPosition.y).toBeCloseTo(100);
  });

  it('caches world properties and only recalculates when dirty', () => {
    const parent = new TransformComponent();
    const child = new TransformComponent();
    parent.addChild(child);
    
    // Initial access to populate cache
    expect(child.worldPosition).toBeDefined();
    
    // Access again - hits false branch of if(_isDirty)
    expect(child.worldPosition).toBeDefined();
    
    const updateSpy = jest.spyOn(child as unknown as { updateWorldTransform: () => void }, 'updateWorldTransform');
    
    // Access again - should NOT call update
    expect(child.worldPosition).toBeDefined();
    expect(updateSpy).not.toHaveBeenCalled();
    
    // Modify parent - should set child as dirty
    parent.position = new Vector2(100, 100);
    
    // Access again - SHOULD call update now (hits true branch)
    expect(child.worldPosition).toBeDefined();
    expect(updateSpy).toHaveBeenCalledTimes(1);
    
    // Access again - should NOT call update (cached again, hits false branch)
    expect(child.worldPosition).toBeDefined();
    expect(updateSpy).toHaveBeenCalledTimes(1);
  });

  it('propagates dirty flag to deep children', () => {
    const root = new TransformComponent();
    const mid = new TransformComponent();
    const leaf = new TransformComponent();
    
    root.addChild(mid);
    mid.addChild(leaf);
    
    // Populate caches
    expect(root.worldPosition).toBeDefined();
    expect(mid.worldPosition).toBeDefined();
    expect(leaf.worldPosition).toBeDefined();
    
    const rootSpy = jest.spyOn(root as unknown as { updateWorldTransform: () => void }, 'updateWorldTransform');
    const midSpy = jest.spyOn(mid as unknown as { updateWorldTransform: () => void }, 'updateWorldTransform');
    const leafSpy = jest.spyOn(leaf as unknown as { updateWorldTransform: () => void }, 'updateWorldTransform');
    
    // Change root
    root.rotation = 1;
    
    // Access leaf - should trigger updates up the chain
    expect(leaf.worldPosition).toBeDefined();
    expect(leafSpy).toHaveBeenCalled();
    expect(midSpy).toHaveBeenCalled();
    expect(rootSpy).toHaveBeenCalled();
  });

  it('handles addChild and removeChild dirty state correctly', () => {
    const parent = new TransformComponent();
    const child = new TransformComponent();
    
    // Initial access
    expect(child.worldPosition).toBeDefined();
    const spy = jest.spyOn(child as unknown as { updateWorldTransform: () => void }, 'updateWorldTransform');
    
    // Add to parent - should become dirty
    parent.addChild(child);
    expect(child.worldPosition).toBeDefined();
    expect(spy).toHaveBeenCalledTimes(1);
    
    // Remove from parent - should become dirty
    parent.removeChild(child);
    expect(child.worldPosition).toBeDefined();
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('invalidates cache on direct property mutation (x/y)', () => {
    const transform = new TransformComponent();
    
    // Populate cache
    expect(transform.worldPosition).toBeDefined();
    const updateSpy = jest.spyOn(transform as unknown as { updateWorldTransform: () => void }, 'updateWorldTransform');
    
    // Mutate x directly
    transform.position.x = 50;
    
    // Access worldPosition - should trigger update
    expect(transform.worldPosition.x).toBe(50);
    expect(updateSpy).toHaveBeenCalledTimes(1);
    
    // Mutate y directly
    transform.position.y = 100;
    expect(transform.worldPosition.y).toBe(100);
    expect(updateSpy).toHaveBeenCalledTimes(2);
  });

  it('triggers setDirty when rotation or scale is changed', () => {
    const transform = new TransformComponent();
    const updateSpy = jest.spyOn(transform as unknown as { updateWorldTransform: () => void }, 'updateWorldTransform');
    
    // Rotation
    transform.rotation = Math.PI;
    expect(transform.worldRotation).toBe(Math.PI);
    expect(updateSpy).toHaveBeenCalledTimes(1);
    
    // Scale
    transform.scale = new Vector2(2, 2);
    expect(transform.worldScale.x).toBe(2);
    expect(updateSpy).toHaveBeenCalledTimes(2);
    
    // Direct scale mutation
    transform.scale.x = 3;
    expect(transform.worldScale.x).toBe(3);
    expect(updateSpy).toHaveBeenCalledTimes(3);
  });

  it('handles replacing position vector instance', () => {
    const transform = new TransformComponent();
    const newPos = new Vector2(10, 10);
    transform.position = newPos;
    
    const updateSpy = jest.spyOn(transform as unknown as { updateWorldTransform: () => void }, 'updateWorldTransform');
    
    newPos.x = 20;
    expect(transform.worldPosition.x).toBe(20);
    expect(updateSpy).toHaveBeenCalledTimes(1);
  });

  it('calculates world position with varying parent rotation (branch coverage)', () => {
    const parent = new TransformComponent();
    const child = new TransformComponent();
    child.position = new Vector2(10, 0);
    parent.addChild(child);
    
    // Case 1: parentWorldRot === 0 (initial state)
    expect(child.worldPosition.x).toBe(10);
    expect(child.worldPosition.y).toBe(0);

    // Case 2: parentWorldRot !== 0
    parent.rotation = Math.PI / 2; // 90 deg
    expect(child.worldPosition.x).toBeCloseTo(0);
    expect(child.worldPosition.y).toBeCloseTo(10);

    // Case 3: back to parentWorldRot === 0
    parent.rotation = 0;
    expect(child.worldPosition.x).toBe(10);
    expect(child.worldPosition.y).toBe(0);
  });

  it('provides allocation-free getters getWorldPosition and getWorldScale', () => {
    const parent = new TransformComponent();
    parent.position = new Vector2(100, 100);
    parent.scale = new Vector2(2, 2);
    
    const child = new TransformComponent();
    child.position = new Vector2(10, 10);
    child.scale = new Vector2(0.5, 0.5);
    parent.addChild(child);
    
    // Populate cache hits true branch
    const outPos = new Vector2();
    child.getWorldPosition(outPos);
    expect(outPos.x).toBe(120);
    
    // Call again hits false branch
    child.getWorldPosition(outPos);
    expect(outPos.x).toBe(120);
    
    const outScale = new Vector2();
    // Hits true branch
    child.getWorldScale(outScale);
    expect(outScale.x).toBe(1);

    // Hits false branch
    child.getWorldScale(outScale);
    expect(outScale.x).toBe(1);

    // Trigger dirty paths for coverage
    child.setDirty();
    const outPos2 = new Vector2();
    child.getWorldPosition(outPos2);
    expect(outPos2.x).toBe(120);

    child.setDirty();
    const outScale2 = new Vector2();
    child.getWorldScale(outScale2);
    expect(outScale2.x).toBe(1);

    // Trigger worldRotation dirty path
    child.setDirty();
    expect(child.worldRotation).toBe(0);
    // Call again for false branch
    expect(child.worldRotation).toBe(0);

    // worldScale getter coverage
    child.setDirty();
    expect(child.worldScale.x).toBe(1);
    // Call again for false branch
    expect(child.worldScale.x).toBe(1);
  });

  it('manually triggers onChange anonymous function for coverage', () => {
    const transform = new TransformComponent();
    const updateSpy = jest.spyOn(transform as unknown as { updateWorldTransform: () => void }, 'updateWorldTransform');
    
    // Populate cache
    expect(transform.worldPosition).toBeDefined();
    
    // Directly call the anonymous function assigned to onChange
    const pos = transform.position;
    if (pos.onChange) {
      pos.onChange();
    }
    
    expect(transform.worldPosition).toBeDefined();
    expect(updateSpy).toHaveBeenCalled();
  });
});
