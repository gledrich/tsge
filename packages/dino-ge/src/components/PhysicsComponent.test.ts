import PhysicsComponent from './PhysicsComponent.js';
import Vector2 from '../math/Vector2.js';

describe('PhysicsComponent', () => {
  it('initialises with default values', () => {
    const physics = new PhysicsComponent();
    expect(physics.velocity.x).toBe(0);
    expect(physics.velocity.y).toBe(0);
    expect(physics.acceleration.x).toBe(0);
    expect(physics.acceleration.y).toBe(0);
    expect(physics.isStatic).toBe(false);
    expect(physics.mass).toBe(1);
    expect(physics.restitution).toBe(0.5);
    expect(physics.friction).toBe(0.2);
  });

  it('allows updating physics properties', () => {
    const physics = new PhysicsComponent();
    physics.velocity = new Vector2(5, 5);
    physics.acceleration = new Vector2(1, 1);
    physics.isStatic = true;
    physics.mass = 10;
    physics.restitution = 0.8;
    physics.friction = 0.5;
    
    expect(physics.velocity.x).toBe(5);
    expect(physics.acceleration.x).toBe(1);
    expect(physics.isStatic).toBe(true);
    expect(physics.mass).toBe(10);
    expect(physics.restitution).toBe(0.8);
    expect(physics.friction).toBe(0.5);
  });
});
