import RenderComponent from './RenderComponent.js';
import Vector2 from './Vector2.js';

/**
 * Component that holds data for rendering a line.
 */
export default class LineComponent extends RenderComponent {
  /** Stroke width of the line. */
  strokeWidth: number;
  /** Start point of the line. */
  p1: Vector2;
  /** End point of the line. */
  p2: Vector2;

  constructor(strokeWidth: number, p1: Vector2, p2: Vector2) {
    super();
    this.strokeWidth = strokeWidth;
    this.p1 = p1;
    this.p2 = p2;
  }

  /**
   * Draws the line to the canvas.
   * @param ctx The canvas 2D rendering context.
   */
  draw(ctx: CanvasRenderingContext2D) {
    if (!this.gameObject) return;

    const { position, rotation, scale } = this.gameObject;

    ctx.save();
    ctx.translate(position.x, position.y);
    if (rotation !== 0) ctx.rotate(rotation);
    ctx.scale(scale.x, scale.y);

    ctx.beginPath();
    ctx.lineWidth = this.strokeWidth;
    ctx.moveTo(this.p1.x, this.p1.y);
    ctx.lineTo(this.p2.x, this.p2.y);
    ctx.stroke();
    ctx.closePath();
    
    ctx.restore();
  }
}
