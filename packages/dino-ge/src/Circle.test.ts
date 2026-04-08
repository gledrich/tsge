import Circle from './Circle';
import Vector2 from './Vector2';
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
});
