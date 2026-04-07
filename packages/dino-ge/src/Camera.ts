import Vector2 from './Vector2.js';
import type GameObject from './GameObject.js';

/**
 * Manages the viewport and transformation of the game world.
 */
export default class Camera {
  /** Current camera position in world space. */
  public position: Vector2 = new Vector2(0, 0);
  /** Zoom level of the camera. */
  public zoom: number = 1;

  constructor() {}

  /**
   * Center the camera on a target object.
   * @param target The object to follow.
   * @param viewportWidth Width of the viewport.
   * @param viewportHeight Height of the viewport.
   */
  follow(target: GameObject, viewportWidth: number, viewportHeight: number) {
    const width = target.bounds?.width ?? 0;
    const height = target.bounds?.height ?? 0;
    this.position.x = (target.transform.position.x + width / 2) - (viewportWidth / 2) / this.zoom;
    this.position.y = (target.transform.position.y + height / 2) - (viewportHeight / 2) / this.zoom;
  }

  /**
   * Returns the current viewport bounds in world space.
   * @param width Width of the viewport.
   * @param height Height of the viewport.
   */
  getViewportBounds(width: number, height: number) {
    return {
      x: this.position.x,
      y: this.position.y,
      width: width / this.zoom,
      height: height / this.zoom
    };
  }

  /**
   * Reset camera position to origin and zoom to 1.
   */
  reset() {
    this.position.x = 0;
    this.position.y = 0;
    this.zoom = 1;
  }
}
