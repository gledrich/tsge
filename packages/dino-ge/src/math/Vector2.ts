/**
 * Class representing a 2D vector or point.
 * Implements a fluent, mutating API to reduce object allocations.
 */
export default class Vector2 {
  private _x: number;
  private _y: number;

  /** Optional callback fired when x or y is modified. */
  public onChange?: () => void;

  /** X coordinate. */
  get x(): number { return this._x; }
  set x(val: number) {
    if (this._x !== val) {
      this._x = val;
      this.onChange?.();
    }
  }

  /** Y coordinate. */
  get y(): number { return this._y; }
  set y(val: number) {
    if (this._y !== val) {
      this._y = val;
      this.onChange?.();
    }
  }

  /**
   * Initializes a new instance of Vector2.
   * @param x Initial x coordinate.
   * @param y Initial y coordinate.
   */
  constructor(x: number = 0, y: number = 0) {
    this._x = x;
    this._y = y;
  }

  /**
   * Sets the components of this vector.
   * @param x New x coordinate.
   * @param y New y coordinate.
   * @returns This vector for chaining.
   */
  public set(x: number, y: number): this {
    if (this._x !== x || this._y !== y) {
      this._x = x;
      this._y = y;
      this.onChange?.();
    }
    return this;
  }

  /**
   * Copies the components of another vector into this one.
   * @param other The vector to copy from.
   * @returns This vector for chaining.
   */
  public copy(other: Vector2): this {
    return this.set(other.x, other.y);
  }

  /**
   * Calculates the Euclidean distance between two vectors.
   * @param v1 First vector.
   * @param v2 Second vector.
   * @returns The distance between v1 and v2.
   */
  public static distance(v1: Vector2, v2: Vector2): number {
    const dx = v1.x - v2.x;
    const dy = v1.y - v2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculates the dot product of two vectors.
   * @param v1 First vector.
   * @param v2 Second vector.
   * @returns The dot product of v1 and v2.
   */
  public static dot(v1: Vector2, v2: Vector2): number {
    return v1.x * v2.x + v1.y * v2.y;
  }

  /**
   * The length (magnitude) of the vector.
   */
  public get magnitude(): number {
    return Math.sqrt(this._x * this._x + this._y * this._y);
  }

  /**
   * A new normalized (unit length) version of this vector.
   * Does not mutate the original vector.
   */
  public get normalized(): Vector2 {
    const mag = this.magnitude;
    if (mag === 0) return new Vector2(0, 0);
    return new Vector2(this._x / mag, this._y / mag);
  }

  /**
   * Normalizes this vector in place.
   * @returns This vector for chaining.
   */
  public normalize(): this {
    const mag = this.magnitude;
    if (mag !== 0) {
      this.multiply(1 / mag);
    }
    return this;
  }

  /** 
   * Adds another vector to this one (mutates). 
   * @param other The vector to add.
   * @returns This vector for chaining.
   */
  public add(other: Vector2): this {
    this.x += other.x;
    this.y += other.y;
    return this;
  }

  /** 
   * Subtracts another vector from this one (mutates). 
   * @param other The vector to subtract.
   * @returns This vector for chaining.
   */
  public subtract(other: Vector2): this {
    this.x -= other.x;
    this.y -= other.y;
    return this;
  }

  /** 
   * Multiplies this vector by a scalar (mutates). 
   * @param scalar The value to multiply by.
   * @returns This vector for chaining.
   */
  public multiply(scalar: number): this {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  /**
   * Creates a new vector with the same x and y values as this one.
   * @returns A new Vector2 instance.
   */
  public clone(): Vector2 {
    return new Vector2(this._x, this._y);
  }
}
