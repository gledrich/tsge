import PhysicsSystem from './PhysicsSystem';
import PhysicsComponent from './PhysicsComponent';
import GameObject from './GameObject';
import Vector2 from './Vector2';

class MockGameObject extends GameObject {}

describe('PhysicsSystem', () => {
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
    
    expect(obj.localPosition.x).toBe(5);
  });
});
