import System from '../core/System.js';
import type GameObject from '../core/GameObject.js';
import PhysicsComponent from '../components/PhysicsComponent.js';
import BoundsComponent from '../components/BoundsComponent.js';
import Physics from '../physics/Physics.js';
import { getEngineState } from '../core/EngineState.js';

/**
 * A system that processes entities with PhysicsComponents.
 * Handles movement, velocity, acceleration, and automatic collision resolution.
 */
export default class PhysicsSystem extends System {
  /**
   * Updates the position of entities and resolves collisions.
   * @param entities All game objects.
   * @param fixedDelta The fixed time step.
   */
  public override fixedUpdate(entities: Set<GameObject>, fixedDelta: number): void {
    const state = getEngineState();
    const collidables: GameObject[] = [];
    const processingList = state?.sortedObjects?.length > 0 ? state.sortedObjects : Array.from(entities);

    processingList.forEach((object) => {
      // Skip if object is no longer in the set (might have been destroyed in this fixedUpdate loop)
      if (!entities.has(object)) return;

      const physics = object.getComponent(PhysicsComponent);
      if (physics) {
        // 1. Integration Phase (Movement)
        if (!physics.isStatic) {
          // Apply acceleration to velocity
          physics.velocity.x += physics.acceleration.x * fixedDelta;
          physics.velocity.y += physics.acceleration.y * fixedDelta;

          // Apply velocity to local position
          object.transform.position.x += physics.velocity.x * fixedDelta;
          object.transform.position.y += physics.velocity.y * fixedDelta;
        }

        // Collect collidables for the next phase
        if (object.getComponent(BoundsComponent)) {
          collidables.push(object);
        }
      }
    });

    // 2. Collision Phase (Detection & Resolution)
    // O(N^2) checks for simplicity in alpha.
    for (let i = 0; i < collidables.length; i++) {
      for (let j = i + 1; j < collidables.length; j++) {
        Physics.checkCollision(collidables[i], collidables[j]);
      }
    }
  }
}
