import Vector2 from './Vector2.js';

export default class Camera {
  public position: Vector2 = new Vector2(0, 0);
  public zoom: number = 1;

  constructor() {}

  /**
   * Center the camera on a target object.
   */
  follow(target: { position: Vector2, width: number, height: number }, viewportWidth: number, viewportHeight: number) {
    this.position.x = (target.position.x + target.width / 2) - (viewportWidth / 2) / this.zoom;
    this.position.y = (target.position.y + target.height / 2) - (viewportHeight / 2) / this.zoom;
  }

  /**
   * Reset camera position to origin.
   */
  reset() {
    this.position.x = 0;
    this.position.y = 0;
    this.zoom = 1;
  }
}
