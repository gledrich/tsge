import Component from './Component.js';
import Vector2 from './Vector2.js';

/**
 * Component that holds physics-related data for a GameObject.
 */
export default class PhysicsComponent extends Component {
  /** Current velocity in pixels per second. */
  velocity: Vector2 = new Vector2(0, 0);
  /** Current acceleration in pixels per second squared. */
  acceleration: Vector2 = new Vector2(0, 0);
  /** Mass of the object (used for physics resolution). */
  mass: number = 1;
  /** Whether the object is immovable (e.g., walls). */
  isStatic: boolean = false;
}
