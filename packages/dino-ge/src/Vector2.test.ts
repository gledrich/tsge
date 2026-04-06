import Vector2 from './Vector2';

describe('Vector2', () => {
  it('initialises with default values', () => {
    const vec = new Vector2();
    expect(vec.x).toBe(0);
    expect(vec.y).toBe(0);
  });

  it('initialises with provided values', () => {
    const vec = new Vector2(10, 20);
    expect(vec.x).toBe(10);
    expect(vec.y).toBe(20);
  });

  it('calculates distance between two vectors', () => {
    const v1 = new Vector2(0, 0);
    const v2 = new Vector2(3, 4);
    expect(Vector2.distance(v1, v2)).toBe(5);
  });
});
