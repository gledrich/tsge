import Component from './Component.js';
import Vector2 from './Vector2.js';

/**
 * Component that holds the position, rotation, and scale of an entity.
 * Supports hierarchical transformations (parent-child relationships).
 */
export default class TransformComponent extends Component {
  private _position: Vector2 = new Vector2(0, 0);
  private _rotation: number = 0;
  private _scale: Vector2 = new Vector2(1, 1);

  /** Local position relative to the parent. */
  get position(): Vector2 { return this._position; }
  set position(val: Vector2) {
    this._position = val;
    this._position.onChange = this.onLocalTransformChange.bind(this);
    this.setDirty();
  }

  /** Local rotation in radians relative to the parent. */
  get rotation(): number { return this._rotation; }
  set rotation(val: number) {
    this._rotation = val;
    this.setDirty();
  }

  /** Local scale relative to the parent. */
  get scale(): Vector2 { return this._scale; }
  set scale(val: Vector2) {
    this._scale = val;
    this._scale.onChange = this.onLocalTransformChange.bind(this);
    this.setDirty();
  }

  /** Reference to the parent transform. */
  parent?: TransformComponent;
  /** List of children transforms. */
  children: Set<TransformComponent> = new Set();

  // Cache for world-space properties
  private _isDirty = true;
  private _worldPosition: Vector2 = new Vector2(0, 0);
  private _worldRotation: number = 0;
  private _worldScale: Vector2 = new Vector2(1, 1);

  constructor() {
    super();
    this._position.onChange = this.onLocalTransformChange.bind(this);
    this._scale.onChange = this.onLocalTransformChange.bind(this);
    this.setDirty();
  }

  /**
   * Internal callback for when local vectors are modified.
   * @private
   */
  private onLocalTransformChange() {
    this.setDirty();
  }

  /**
   * Sets this transform and all its children as dirty, forcing a recalculation 
   * of world-space properties on the next access.
   */
  public setDirty() {
    if (this._isDirty) return;
    this._isDirty = true;
    this.children.forEach(child => child.setDirty());
  }

  /**
   * Adds a child transform to this one.
   * @param child The child transform to add.
   */
  addChild(child: TransformComponent) {
    if (child.parent === this) return;
    
    if (child.parent) {
      child.parent.children.delete(child);
    }
    
    child.parent = this;
    this.children.add(child);
    child.setDirty();
  }

  /**
   * Removes a child transform from this one.
   * @param child The child transform to remove.
   */
  removeChild(child: TransformComponent) {
    if (child.parent === this) {
      child.parent = undefined;
      this.children.delete(child);
      child.setDirty();
    }
  }

  /**
   * Calculates the world-space position.
   */
  get worldPosition(): Vector2 {
    if (this._isDirty) {
      this.updateWorldTransform();
    }
    return this._worldPosition.clone();
  }

  /**
   * Calculates the world-space rotation.
   */
  get worldRotation(): number {
    if (this._isDirty) {
      this.updateWorldTransform();
    }
    return this._worldRotation;
  }

  /**
   * Calculates the world-space scale.
   */
  get worldScale(): Vector2 {
    if (this._isDirty) {
      this.updateWorldTransform();
    }
    return this._worldScale.clone();
  }

  /**
   * Recalculates all world-space properties from the root parent down.
   * @private
   */
  private updateWorldTransform() {
    if (!this.parent) {
      this._worldPosition.x = this.position.x;
      this._worldPosition.y = this.position.y;
      this._worldRotation = this.rotation;
      this._worldScale.x = this.scale.x;
      this._worldScale.y = this.scale.y;
    } else {
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

      this._worldPosition.x = parentWorldPos.x + localX;
      this._worldPosition.y = parentWorldPos.y + localY;
      this._worldRotation = parentWorldRot + this.rotation;
      this._worldScale.x = parentWorldScale.x * this.scale.x;
      this._worldScale.y = parentWorldScale.y * this.scale.y;
    }
    this._isDirty = false;
  }
}
