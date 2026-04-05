import Component from './Component.js';
import Vector2 from './Vector2.js';

/**
 * Component that holds the world-space position and potentially rotation/scale.
 */
export default class TransformComponent extends Component {
  /** The world-space position. */
  position: Vector2 = new Vector2(0, 0);
  /** The rotation in radians. */
  rotation: number = 0;
  /** The scale of the object. */
  scale: Vector2 = new Vector2(1, 1);
}
