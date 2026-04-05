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

    const { position } = this.gameObject;
    ctx.fillStyle = this.colour;

    if (this.type === 'rect') {
      ctx.fillRect(position.x, position.y, this.width, this.height);
    } else if (this.type === 'circle') {
      ctx.beginPath();
      const centerX = position.x + this.width; // width is radius
      const centerY = position.y + this.width;
      ctx.arc(centerX, centerY, this.width, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    }
  }
}
