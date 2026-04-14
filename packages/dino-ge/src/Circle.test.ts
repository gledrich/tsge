import Circle from './Circle';
import Vector2 from './Vector2';
import VisibilityComponent from './VisibilityComponent';
import PhysicsComponent from './PhysicsComponent';
import ShapeComponent from './ShapeComponent';

describe('Circle', () => {
  it('initialises with default values', () => {
    const circle = new Circle({
      position: new Vector2(10, 10),
      radius: 25
    });
    
    expect(circle.transform.position.x).toBe(10);
    expect(circle.radius).toBe(25);
    expect(circle.bounds?.width).toBe(50);
    expect(circle.bounds?.height).toBe(50);
    expect(circle.colour).toBe('black');
    expect(circle.metadata.zIndex).toBe(0);
  });

  it('calculates center point correctly', () => {
    const circle = new Circle({
      position: new Vector2(10, 10),
      radius: 20
    });
    
    // center should be (10+20, 10+20) = (30, 30)
    expect(circle.center.x).toBe(30);
    expect(circle.center.y).toBe(30);
  });

  it('adds ShapeComponent on creation', () => {
    const circle = new Circle({
      position: new Vector2(0, 0),
      radius: 10
    });
    
    expect(circle.hasComponent(ShapeComponent)).toBe(true);
  });

  it('throws error if position is not a Vector2', () => {
    expect(() => {
      new Circle({
        position: { x: 0, y: 0 } as unknown as Vector2,
        radius: 10
      });
    }).toThrow('"position" must be a Vector2!');
  });

  it('throws error if radius is missing', () => {
    expect(() => {
      new Circle({
        position: new Vector2(),
        radius: 0
      });
    }).toThrow('You must provide a radius for Circle');
  });

  it('initialises with custom tag and zIndex', () => {
    const circle = new Circle({
      position: new Vector2(),
      radius: 10,
      tag: 'enemy',
      zIndex: 10
    });
    expect(circle.metadata.tag).toBe('enemy');
    expect(circle.metadata.zIndex).toBe(10);
    });

  it('initialises with physics and visibility options', () => {
    const obj = new Circle({ position: new Vector2(), radius: 10, visible: false, physics: { velocity: new Vector2(1,2), acceleration: new Vector2(3,4), mass: 5, isStatic: true, restitution: 0.5, friction: 0.2 } });
    expect(obj.getComponent(VisibilityComponent)?.visible).toBe(false);
    const pc = obj.getComponent(PhysicsComponent);
    expect(pc?.velocity.x).toBe(1);
    expect(pc?.acceleration.x).toBe(3);
    expect(pc?.mass).toBe(5);
    expect(pc?.isStatic).toBe(true);
    expect(pc?.restitution).toBe(0.5);
    expect(pc?.friction).toBe(0.2);
  });
});
