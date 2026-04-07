/**
 * Class representing a 2D vector or point.
 */
export default class Vector2 {
  /** X coordinate. */
  x: number;
  /** Y coordinate. */
  y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  /**
   * Calculates the Euclidean distance between two vectors.
   * @param v1 First vector.
   * @param v2 Second vector.
   * @returns The distance between v1 and v2.
   */
  static distance(v1: Vector2, v2: Vector2): number {
    const dx = v1.x - v2.x;
    const dy = v1.y - v2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculates the dot product of two vectors.
   * @param v1 First vector.
   * @param v2 Second vector.
   */
  static dot(v1: Vector2, v2: Vector2): number {
    return v1.x * v2.x + v1.y * v2.y;
  }

  /** Returns the length of the vector. */
  get magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /** Returns a new normalized (unit length) version of this vector. */
  get normalized(): Vector2 {
    const mag = this.magnitude;
    if (mag === 0) return new Vector2(0, 0);
    return new Vector2(this.x / mag, this.y / mag);
  }

  /** Adds another vector to this one. */
  add(other: Vector2): Vector2 {
    this.x += other.x;
    this.y += other.y;
    return this;
  }

  /** Subtracts another vector from this one. */
  subtract(other: Vector2): Vector2 {
    this.x -= other.x;
    this.y -= other.y;
    return this;
  }

  /** Multiplies this vector by a scalar. */
  multiply(scalar: number): Vector2 {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  /** Returns a copy of this vector. */
  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }
}
