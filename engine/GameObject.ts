import Engine from './Engine.js';
import Vector2 from './Vector2.js';

/**
 * Base class for all entities in the game world.
 * Provides properties for physics, rendering, and lifecycle management.
 */
export default abstract class GameObject {
  /** A unique identifier for the object type. */
  tag: string;
  /** Rendering order (lower is background, higher is foreground). */
  zIndex: string;
  /** Current velocity in pixels per second. */
  velocity: Vector2 = new Vector2(0, 0);
  /** Current acceleration in pixels per second squared. */
  acceleration: Vector2 = new Vector2(0, 0);
  /** Mass of the object (used for physics resolution). */
  mass: number = 1;
  /** Whether the object is immovable (e.g., walls). */
  isStatic: boolean = false;

  /** Whether the object should be rendered. */
  visible: boolean = true;

  constructor(tag: string, zIndex: string) {
    this.tag = tag;
    this.zIndex = zIndex;
  }

  /** The world-space position of the object. */
  abstract get position(): Vector2;
  /** The width of the object in pixels. */
  abstract get width(): number;
  /** The height of the object in pixels. */
  abstract get height(): number;

  /**
   * Main rendering method for the object.
   * @param ctx The canvas 2D rendering context.
   */
  abstract draw(ctx: CanvasRenderingContext2D): void;

  /**
   * Registers the object with the active scene or global engine loop.
   */
  registerSelf() {
    Engine.registerObject(this);
  }

  /**
   * Removes the object from the active scene.
   */
  destroySelf() {
    Engine.destroyObject(this);
  }
}
