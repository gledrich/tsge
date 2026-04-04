import GameObject from './GameObject.js';

/**
 * Represents a separate world or level in the game.
 * Scenes manage their own set of game objects and lifecycle.
 */
export default abstract class Scene {
  /** The set of game objects currently in the scene. */
  public objects: Set<GameObject> = new Set();

  /** Called when the scene is loaded. */
  onLoad(): void {}
  /** Called every frame to update the scene. */
  update(): void {}

  /** Adds an object to the scene. */
  add(object: GameObject) {
    this.objects.add(object);
  }

  /** Removes an object from the scene. */
  remove(object: GameObject) {
    this.objects.delete(object);
  }

  /** Clears all objects from the scene. */
  clear() {
    this.objects.clear();
  }
}
