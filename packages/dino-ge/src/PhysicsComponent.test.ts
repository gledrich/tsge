import PhysicsComponent from './PhysicsComponent';
import Vector2 from './Vector2';

describe('PhysicsComponent', () => {
  it('initialises with default values', () => {
    const physics = new PhysicsComponent();
    expect(physics.velocity.x).toBe(0);
    expect(physics.velocity.y).toBe(0);
    expect(physics.acceleration.x).toBe(0);
    expect(physics.acceleration.y).toBe(0);
    expect(physics.isStatic).toBe(false);
  });

  it('allows updating physics properties', () => {
    const physics = new PhysicsComponent();
    physics.velocity = new Vector2(5, 5);
    physics.acceleration = new Vector2(1, 1);
    physics.isStatic = true;
    
    expect(physics.velocity.x).toBe(5);
    expect(physics.acceleration.x).toBe(1);
    expect(physics.isStatic).toBe(true);
  });
});
