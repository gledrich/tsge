import Line from './Line';
import Vector2 from './Vector2';
import LineComponent from './LineComponent';

describe('Line', () => {
  it('initialises with provided values', () => {
    const p1 = new Vector2(10, 10);
    const p2 = new Vector2(20, 20);
    const line = new Line({
      p1,
      p2,
      width: 5,
      tag: 'boundary',
      zIndex: 2
    });
    
    expect(line.metadata.tag).toBe('boundary');
    expect(line.metadata.zIndex).toBe(2);
    expect(line.strokeWidth).toBe(5);
    expect(line.transform.position.x).toBe(10);
    expect(line.transform.position.y).toBe(10);
    expect(line.startPosition.x).toBe(10);
    expect(line.startPosition.y).toBe(10);
  });

  it('calculates bounding box width and height correctly', () => {
    const line = new Line({
      p1: new Vector2(0, 0),
      p2: new Vector2(100, 50)
    });
    
    expect(line.bounds?.width).toBe(100);
    expect(line.bounds?.height).toBe(50);
  });

  it('adds LineComponent on creation', () => {
    const line = new Line({
      p1: new Vector2(0, 0),
      p2: new Vector2(10, 10)
    });
    
    expect(line.hasComponent(LineComponent)).toBe(true);
  });
});
