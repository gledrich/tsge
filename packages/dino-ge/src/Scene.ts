import GameObject from './GameObject.js';

/**
 * Represents a separate world or level in the game.
 * Scenes manage their own set of game objects and lifecycle.
 */
export default abstract class Scene {
  /** The set of game objects currently in the scene. */
  public objects: Set<GameObject> = new Set();

  /**
   * Called once when the scene becomes active.
   * Useful for initializing scene-specific objects.
   */
  public onLoad(): void {}

  /**
   * Called every frame to update game logic within the scene.
   */
  public update(): void {}

  /**
   * Adds a game object to the scene.
   * @param object The object to add.
   */
  public add(object: GameObject) {
    this.objects.add(object);
  }

  /**
   * Removes a game object from the scene.
   * @param object The object to remove.
   */
  public remove(object: GameObject) {
    this.objects.delete(object);
  }

  /**
   * Removes all objects from the scene.
   */
  public clear() {
    this.objects.clear();
  }
}
