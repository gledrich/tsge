import Component from './Component.js';
import Vector2 from './Vector2.js';

/**
 * Component that holds the position, rotation, and scale of an entity.
 * Supports hierarchical transformations (parent-child relationships).
 */
export default class TransformComponent extends Component {
  /** Local position relative to the parent. */
  position: Vector2 = new Vector2(0, 0);
  /** Local rotation in radians relative to the parent. */
  rotation: number = 0;
  /** Local scale relative to the parent. */
  scale: Vector2 = new Vector2(1, 1);

  /** Reference to the parent transform. */
  parent?: TransformComponent;
  /** List of children transforms. */
  children: Set<TransformComponent> = new Set();

  /**
   * Calculates the world-space position.
   */
  get worldPosition(): Vector2 {
    if (!this.parent) {
      return new Vector2(this.position.x, this.position.y);
    }

    const parentWorldPos = this.parent.worldPosition;
    const parentWorldRot = this.parent.worldRotation;
    const parentWorldScale = this.parent.worldScale;

    // Apply parent's scale and rotation to local position
    let localX = this.position.x * parentWorldScale.x;
    let localY = this.position.y * parentWorldScale.y;

    if (parentWorldRot !== 0) {
      const cos = Math.cos(parentWorldRot);
      const sin = Math.sin(parentWorldRot);
      const rotatedX = localX * cos - localY * sin;
      const rotatedY = localX * sin + localY * cos;
      localX = rotatedX;
      localY = rotatedY;
    }

    return new Vector2(
      parentWorldPos.x + localX,
      parentWorldPos.y + localY
    );
  }

  /**
   * Calculates the world-space rotation.
   */
  get worldRotation(): number {
    if (!this.parent) {
      return this.rotation;
    }
    return this.parent.worldRotation + this.rotation;
  }

  /**
   * Calculates the world-space scale.
   */
  get worldScale(): Vector2 {
    if (!this.parent) {
      return new Vector2(this.scale.x, this.scale.y);
    }
    const parentScale = this.parent.worldScale;
    return new Vector2(
      parentScale.x * this.scale.x,
      parentScale.y * this.scale.y
    );
  }
}
