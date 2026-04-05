/**
 * Simple 2D vector interface.
 */
export interface Vector2 {
  /** X coordinate. */
  x: number;
  /** Y coordinate. */
  y: number;
}

/**
 * Class representing a 2D vector or point.
 */
export default class implements Vector2 {
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
}
