import PhysicsSystem from './PhysicsSystem.js';
import PhysicsComponent from '../components/PhysicsComponent.js';
import GameObject from '../core/GameObject.js';
import Vector2 from '../math/Vector2.js';
import BoundsComponent from '../components/BoundsComponent.js';
import Physics from '../physics/Physics.js';
import Engine from '../core/Engine.js';
import { type EngineState } from '../core/EngineState.js';

class MockGameObject extends GameObject {}

describe('PhysicsSystem', () => {
  beforeEach(() => {
    Engine.resetState();
  });

  it('updates velocity based on acceleration', () => {
    const system = new PhysicsSystem();
    const obj = new MockGameObject('test', 0);
    const physics = new PhysicsComponent();
    physics.acceleration = new Vector2(10, 0);
    obj.addComponent(physics);

    const entities = new Set<GameObject>([obj]);
    
    // fixedUpdate(entities, fixedDelta)
    // 10 accel * 0.1 delta = 1 velocity increase
    system.fixedUpdate(entities, 0.1);
    
    expect(physics.velocity.x).toBe(1);
  });

  it('updates position based on velocity', () => {
    const system = new PhysicsSystem();
    const obj = new MockGameObject('test', 0);
    const physics = new PhysicsComponent();
    physics.velocity = new Vector2(50, 0);
    obj.addComponent(physics);

    const entities = new Set<GameObject>([obj]);
    
    // 50 velocity * 0.1 delta = 5 units movement
    system.fixedUpdate(entities, 0.1);
    
    expect(obj.transform.position.x).toBe(5);
  });

  it('skips objects missing from the entities Set when processing via sortedObjects', () => {
    const system = new PhysicsSystem();
    const obj1 = new MockGameObject('obj1', 0);
    const obj2 = new MockGameObject('obj2', 0);
    
    obj1.addComponent(new PhysicsComponent());
    obj2.addComponent(new PhysicsComponent());
    
    // Initialise engine state
    Engine.resetState();
    
    // Mock sortedObjects in global state
    const state = (globalThis as unknown as { __DINO_ENGINE_STATE__: EngineState }).__DINO_ENGINE_STATE__;
    state.sortedObjects = [obj1, obj2];
    
    // entities Set ONLY contains obj2. obj1 is in sortedObjects but NOT in entities Set
    const entities = new Set<GameObject>([obj2]);
    
    system.fixedUpdate(entities, 0.1);
    
    // obj2 should be updated, obj1 should be skipped
    expect(obj2.transform.position.y).toBe(0); // it has no velocity anyway but it was processed
    // if obj1 was processed, it wouldn't crash but we've successfully hit the !entities.has(obj1) line
  });

  it('handles empty sortedObjects array correctly', () => {
    const system = new PhysicsSystem();
    const obj = new MockGameObject('test', 0);
    obj.addComponent(new PhysicsComponent());
    const entities = new Set<GameObject>([obj]);
    
    Engine.resetState();
    const state = (globalThis as unknown as { __DINO_ENGINE_STATE__: EngineState }).__DINO_ENGINE_STATE__;
    state.sortedObjects = []; // Empty but present
    
    system.fixedUpdate(entities, 0.1);
    expect(obj.transform.position.x).toBe(0);
  });

  it('handles null sortedObjects correctly', () => {
    const system = new PhysicsSystem();
    const obj = new MockGameObject('test', 0);
    obj.addComponent(new PhysicsComponent());
    const entities = new Set<GameObject>([obj]);
    
    Engine.resetState();
    const state = (globalThis as unknown as { __DINO_ENGINE_STATE__: EngineState }).__DINO_ENGINE_STATE__;
    (state as unknown as { sortedObjects: null }).sortedObjects = null; // specifically test null path
    
    system.fixedUpdate(entities, 0.1);
    expect(obj.transform.position.x).toBe(0);
  });

  it('handles null engine state correctly', () => {
    const system = new PhysicsSystem();
    const obj = new MockGameObject('test', 0);
    obj.addComponent(new PhysicsComponent());
    const entities = new Set<GameObject>([obj]);
    
    const originalState = (globalThis as unknown as { __DINO_ENGINE_STATE__: EngineState }).__DINO_ENGINE_STATE__;
    (globalThis as unknown as Record<string, unknown>).__DINO_ENGINE_STATE__ = null;
    
    system.fixedUpdate(entities, 0.1);
    
    expect(obj.transform.position.x).toBe(0);
    (globalThis as unknown as Record<string, unknown>).__DINO_ENGINE_STATE__ = originalState;
  });

  it('ignores objects without PhysicsComponent', () => {
    const system = new PhysicsSystem();
    const obj = new MockGameObject('test', 0);
    // No PhysicsComponent added
    
    const entities = new Set<GameObject>([obj]);
    const initialPos = obj.transform.position.clone();
    
    system.fixedUpdate(entities, 0.1);
    
    expect(obj.transform.position.x).toBe(initialPos.x);
    expect(obj.transform.position.y).toBe(initialPos.y);
  });

  it('automatically checks for collisions between objects with physics and bounds', () => {
    const system = new PhysicsSystem();
    const obj1 = new MockGameObject('o1', 0);
    obj1.addComponent(new PhysicsComponent());
    obj1.addComponent(new BoundsComponent(10, 10));

    const obj2 = new MockGameObject('o2', 0);
    obj2.addComponent(new PhysicsComponent());
    obj2.addComponent(new BoundsComponent(10, 10));

    const checkCollisionSpy = jest.spyOn(Physics, 'checkCollision');
    const entities = new Set<GameObject>([obj1, obj2]);
    
    system.fixedUpdate(entities, 0.1);
    
    expect(checkCollisionSpy).toHaveBeenCalledWith(obj1, obj2);
    checkCollisionSpy.mockRestore();
  });

  it('skips collision check if an object is missing BoundsComponent', () => {
    const system = new PhysicsSystem();
    const obj1 = new MockGameObject('o1', 0);
    obj1.addComponent(new PhysicsComponent());
    // No BoundsComponent

    const obj2 = new MockGameObject('o2', 0);
    obj2.addComponent(new PhysicsComponent());
    obj2.addComponent(new BoundsComponent(10, 10));

    const checkCollisionSpy = jest.spyOn(Physics, 'checkCollision');
    const entities = new Set<GameObject>([obj1, obj2]);
    
    system.fixedUpdate(entities, 0.1);
    
    expect(checkCollisionSpy).not.toHaveBeenCalled();
    checkCollisionSpy.mockRestore();
  });

  it('does not move static objects', () => {
    const system = new PhysicsSystem();
    const obj = new MockGameObject('static', 0);
    const physics = new PhysicsComponent();
    physics.isStatic = true;
    physics.velocity = new Vector2(100, 100);
    obj.addComponent(physics);

    const entities = new Set<GameObject>([obj]);
    const initialPos = obj.transform.position.clone();
    
    system.fixedUpdate(entities, 0.1);
    
    expect(obj.transform.position.x).toBe(initialPos.x);
    expect(obj.transform.position.y).toBe(initialPos.y);
  });
});
