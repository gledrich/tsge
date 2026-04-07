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

  it('calculates dot product of two vectors', () => {
    const v1 = new Vector2(1, 2);
    const v2 = new Vector2(3, 4);
    expect(Vector2.dot(v1, v2)).toBe(11); // 1*3 + 2*4 = 3 + 8 = 11
  });

  it('calculates magnitude', () => {
    const vec = new Vector2(3, 4);
    expect(vec.magnitude).toBe(5);
  });

  it('returns normalized vector', () => {
    const vec = new Vector2(3, 4);
    const norm = vec.normalized;
    expect(norm.x).toBeCloseTo(0.6);
    expect(norm.y).toBeCloseTo(0.8);
    expect(norm.magnitude).toBeCloseTo(1);
  });

  it('returns zero vector when normalizing zero vector', () => {
    const vec = new Vector2(0, 0);
    const norm = vec.normalized;
    expect(norm.x).toBe(0);
    expect(norm.y).toBe(0);
  });

  it('adds another vector', () => {
    const v1 = new Vector2(1, 2);
    const v2 = new Vector2(3, 4);
    v1.add(v2);
    expect(v1.x).toBe(4);
    expect(v1.y).toBe(6);
  });

  it('subtracts another vector', () => {
    const v1 = new Vector2(4, 6);
    const v2 = new Vector2(1, 2);
    v1.subtract(v2);
    expect(v1.x).toBe(3);
    expect(v1.y).toBe(4);
  });

  it('multiplies by a scalar', () => {
    const vec = new Vector2(2, 3);
    vec.multiply(2);
    expect(vec.x).toBe(4);
    expect(vec.y).toBe(6);
  });

  it('clones the vector', () => {
    const v1 = new Vector2(10, 20);
    const v2 = v1.clone();
    expect(v2.x).toBe(v1.x);
    expect(v2.y).toBe(v1.y);
    expect(v2).not.toBe(v1);
  });
});
