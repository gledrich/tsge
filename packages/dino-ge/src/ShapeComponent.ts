import RenderComponent from './RenderComponent.js';

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
  width: number;
  /** Height (for rect) or unused (for circle). */
  height: number;

  constructor(type: ShapeType, colour: string, width: number, height: number = 0) {
    super();
    this.type = type;
    this.colour = colour;
    this.width = width;
    this.height = height;
  }

  /**
   * Draws the shape to the canvas.
   * @param ctx The canvas 2D rendering context.
   */
  draw(ctx: CanvasRenderingContext2D) {
    if (!this.gameObject) return;

    const { position, rotation, scale } = this.gameObject.transform;
    
    ctx.save();
    ctx.translate(position.x, position.y);
    if (rotation !== 0) ctx.rotate(rotation);
    ctx.scale(scale.x, scale.y);
    
    ctx.fillStyle = this.colour;

    if (this.type === 'rect') {
      ctx.fillRect(0, 0, this.width, this.height);
    } else if (this.type === 'circle') {
      ctx.beginPath();
      // width is radius. In local space center is at (radius, radius)
      ctx.arc(this.width, this.width, this.width, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    }
    
    ctx.restore();
  }
}
