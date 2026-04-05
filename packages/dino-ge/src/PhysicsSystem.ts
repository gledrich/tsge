import System from './System.js';
import type GameObject from './GameObject.js';
import PhysicsComponent from './PhysicsComponent.js';

/**
 * A system that processes entities with PhysicsComponents.
 * Handles movement, velocity, and acceleration.
 */
export default class PhysicsSystem extends System {
  /**
   * Updates the position of entities based on their velocity and acceleration.
   * @param entities All game objects.
   * @param fixedDelta The fixed time step.
   */
  public override fixedUpdate(entities: Set<GameObject>, fixedDelta: number): void {
    entities.forEach((object) => {
      const physics = object.getComponent(PhysicsComponent);
      if (physics) {
        // Apply acceleration to velocity
        physics.velocity.x += physics.acceleration.x * fixedDelta;
        physics.velocity.y += physics.acceleration.y * fixedDelta;

        // Apply velocity to local position
        object.localPosition.x += physics.velocity.x * fixedDelta;
        object.localPosition.y += physics.velocity.y * fixedDelta;
      }
    });
  }
}
