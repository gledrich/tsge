import Rectangle from './Rectangle';
import Vector2 from './Vector2';
import ShapeComponent from './ShapeComponent';

describe('Rectangle', () => {
  it('initialises with default values', () => {
    const rect = new Rectangle({
      position: new Vector2(10, 10),
      width: 100,
      height: 50
    });
    
    expect(rect.position.x).toBe(10);
    expect(rect.width).toBe(100);
    expect(rect.height).toBe(50);
    expect(rect.colour).toBe('black');
    expect(rect.zIndex).toBe(0);
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
    
    expect(rect.tag).toBe('enemy');
    expect(rect.colour).toBe('red');
    expect(rect.zIndex).toBe(5);
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
    
    rect.position = new Vector2(50, 50);
    expect(rect.position.x).toBe(50);
    expect(rect.position.y).toBe(50);
  });
});
