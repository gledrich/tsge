import RenderComponent from './RenderComponent.js';
import BoundsComponent from './BoundsComponent.js';

/**
 * Types of shapes supported by the ShapeComponent.
 */
export type ShapeType = 'rect' | 'circle';

/**
 * Component that holds data for rendering a basic shape.
 */
export default class ShapeComponent extends RenderComponent {
  /** The type of shape to draw. */
  type: ShapeType;
  /** Fill colour. */
  colour: string;

  /** Width (for rect) or radius (for circle). */
  get width(): number {
    if (this.gameObject?.bounds) {
      if (this.type === 'circle') {
        return this.gameObject.bounds.width / 2;
      }
      return this.gameObject.bounds.width;
    }
    return this._initialWidth;
  }

  set width(val: number) {
    this._initialWidth = val;
    if (this.gameObject?.bounds) {
      if (this.type === 'circle') {
        this.gameObject.bounds.width = val * 2;
        this.gameObject.bounds.height = val * 2;
      } else {
        this.gameObject.bounds.width = val;
      }
    }
  }

  /** Height (for rect) or unused (for circle). */
  get height(): number {
    if (this.gameObject?.bounds) {
      return this.gameObject.bounds.height;
    }
    return this._initialHeight;
  }

  set height(val: number) {
    this._initialHeight = val;
    if (this.gameObject?.bounds) {
      this.gameObject.bounds.height = val;
    }
  }

  private _initialWidth: number;
  private _initialHeight: number;

  constructor(type: ShapeType, colour: string, width: number = 0, height: number = 0) {
    super();
    this.type = type;
    this.colour = colour;
    this._initialWidth = width;
    this._initialHeight = height;
  }

  /**
   * Ensures the parent GameObject has a BoundsComponent synced with this shape.
   * Note: Bounds represent the BASE local size (unscaled).
   */
  private _updateGameObjectBounds() {
    if (!this.gameObject) return;

    if (!this.gameObject.bounds) {
      let targetWidth = this._initialWidth;
      let targetHeight = this._initialHeight;

      if (this.type === 'circle') {
        targetWidth = this._initialWidth * 2;
        targetHeight = this._initialWidth * 2;
      }

      this.gameObject.bounds = new BoundsComponent(targetWidth, targetHeight);
    } else {
      // Sync initial values if bounds already exist
      this.width = this._initialWidth;
      this.height = this._initialHeight;
    }
  }

  /**
   * Lifecycle hook called when the component is added to a GameObject.
   */
  onAttach() {
    this._updateGameObjectBounds();
  }

  /**
   * Draws the shape to the canvas.
   * @param ctx The canvas 2D rendering context.
   */
  draw(ctx: CanvasRenderingContext2D) {
    if (!this.gameObject || !this.gameObject.bounds) return;

    const { worldPosition, worldRotation, worldScale } = this.gameObject.transform;
    const { width, height } = this.gameObject.bounds;
    
    ctx.save();
    ctx.translate(worldPosition.x, worldPosition.y);
    if (worldRotation !== 0) ctx.rotate(worldRotation);
    ctx.scale(worldScale.x, worldScale.y);
    
    ctx.fillStyle = this.colour;

    if (this.type === 'rect') {
      ctx.fillRect(0, 0, width, height);
    } else if (this.type === 'circle') {
      const radius = width / 2;
      ctx.beginPath();
      // In local space center is at (radius, radius)
      ctx.arc(radius, radius, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    }
    
    ctx.restore();
  }
}
