import PhysicsSystem from './PhysicsSystem.js';
import PhysicsComponent from '../components/PhysicsComponent.js';
import GameObject from '../core/GameObject.js';
import Vector2 from '../math/Vector2.js';
import BoundsComponent from '../components/BoundsComponent.js';
import Physics from '../physics/Physics.js';

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
    
    expect(obj.transform.position.x).toBe(5);
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
