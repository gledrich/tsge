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

  private _width: number;
  private _height: number;

  /** Width (for rect) or radius (for circle). */
  get width(): number { return this._width; }
  set width(val: number) {
    this._width = val;
    this._updateGameObjectBounds();
  }

  /** Height (for rect) or unused (for circle). */
  get height(): number { return this._height; }
  set height(val: number) {
    this._height = val;
    this._updateGameObjectBounds();
  }

  constructor(type: ShapeType, colour: string, width: number = 0, height: number = 0) {
    super();
    this.type = type;
    this.colour = colour;
    this._width = width;
    this._height = height;
  }

  /**
   * Ensures the parent GameObject has a BoundsComponent synced with this shape.
   */
  private _updateGameObjectBounds() {
    if (!this.gameObject) return;

    let targetWidth = this._width;
    let targetHeight = this._height;

    if (this.type === 'circle') {
      targetWidth = this._width * 2;
      targetHeight = this._width * 2;
    }

    if (!this.gameObject.bounds) {
      this.gameObject.bounds = new BoundsComponent(targetWidth, targetHeight);
      this.gameObject.addComponent(this.gameObject.bounds);
    } else {
      this.gameObject.bounds.width = targetWidth;
      this.gameObject.bounds.height = targetHeight;
    }
  }

  /**
   * Lifecycle hook called by GameObject when component is added.
   */
  onAttach() {
    this._updateGameObjectBounds();
  }

  /**
   * Draws the shape to the canvas.
   * @param ctx The canvas 2D rendering context.
   */
  draw(ctx: CanvasRenderingContext2D) {
    if (!this.gameObject) return;

    const { worldPosition, worldRotation, worldScale } = this.gameObject.transform;
    
    ctx.save();
    ctx.translate(worldPosition.x, worldPosition.y);
    if (worldRotation !== 0) ctx.rotate(worldRotation);
    ctx.scale(worldScale.x, worldScale.y);
    
    ctx.fillStyle = this.colour;

    if (this.type === 'rect') {
      ctx.fillRect(0, 0, this._width, this._height);
    } else if (this.type === 'circle') {
      ctx.beginPath();
      // width is radius. In local space center is at (radius, radius)
      ctx.arc(this._width, this._width, this._width, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    }
    
    ctx.restore();
  }
}
