import type GameObject from './GameObject.js';

/**
 * Base class for all systems in the Entity Component System.
 * Systems contain the logic that processes entities with specific components.
 */
export default abstract class System {
  /**
   * Called every frame during the main update loop.
   * @param entities The set of entities to process.
   * @param deltaTime Time passed since the last frame in seconds.
   */
  public update?(entities: Set<GameObject>, deltaTime: number): void;

  /**
   * Called at a fixed interval for physics and consistent logic.
   * @param entities The set of entities to process.
   * @param fixedDelta The fixed time step in seconds.
   */
  public fixedUpdate?(entities: Set<GameObject>, fixedDelta: number): void;
}
