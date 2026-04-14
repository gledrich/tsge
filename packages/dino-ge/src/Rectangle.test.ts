import Rectangle from './Rectangle';
import Vector2 from './Vector2';
import VisibilityComponent from './VisibilityComponent';
import PhysicsComponent from './PhysicsComponent';
import ShapeComponent from './ShapeComponent';

describe('Rectangle', () => {
  it('initialises with default values', () => {
    const rect = new Rectangle({
      position: new Vector2(10, 10),
      width: 100,
      height: 50
    });
    
    expect(rect.transform.position.x).toBe(10);
    expect(rect.bounds?.width).toBe(100);
    expect(rect.bounds?.height).toBe(50);
    expect(rect.colour).toBe('black');
    expect(rect.metadata.zIndex).toBe(0);
  });

  it('initialises with provided values', () => {
    const rect = new Rectangle({
      position: new Vector2(20, 20),
      width: 200,
      height: 100,
      colour: 'red',
      zIndex: 5,
      tag: 'enemy'
    });
    
    expect(rect.metadata.tag).toBe('enemy');
    expect(rect.colour).toBe('red');
    expect(rect.metadata.zIndex).toBe(5);
  });

  it('adds ShapeComponent on creation', () => {
    const rect = new Rectangle({
      position: new Vector2(0, 0),
      width: 10,
      height: 10
    });
    
    expect(rect.hasComponent(ShapeComponent)).toBe(true);
  });

  it('updates world position through transform', () => {
    const rect = new Rectangle({
      position: new Vector2(10, 10),
      width: 10,
      height: 10
    });
    
    rect.transform.position = new Vector2(50, 50);
    expect(rect.transform.position.x).toBe(50);
    expect(rect.transform.position.y).toBe(50);
  });

  it('throws error if position is not a Vector2', () => {
    expect(() => {
      new Rectangle({
        position: { x: 0, y: 0 } as unknown as Vector2,
        width: 10,
        height: 10
      });
    }).toThrow('"position" must be a Vector2!');
  });

  it('throws error if width or height is missing', () => {
    expect(() => {
      new Rectangle({
        position: new Vector2(),
        width: 0,
        height: 10
      });
    }).toThrow('You must provide a width and height for Rectangle');

    expect(() => {
      new Rectangle({
        position: new Vector2(),
        width: 10,
        height: 0
      });
    }).toThrow('You must provide a width and height for Rectangle');
    });

  it('initialises with physics and visibility options', () => {
    const obj = new Rectangle({ position: new Vector2(), width: 10, height: 10, visible: false, physics: { velocity: new Vector2(1,2), acceleration: new Vector2(3,4), mass: 5, isStatic: true, restitution: 0.5, friction: 0.2 } });
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
