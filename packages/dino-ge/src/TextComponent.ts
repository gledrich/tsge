import RenderComponent from './RenderComponent.js';
import type { HorizontalAlign, VerticalAlign } from './Text.js';

/**
 * Component that holds data for rendering text.
 */
export default class TextComponent extends RenderComponent {
  /** Text fill colour. */
  colour: string;
  /** Background box colour. */
  backgroundColour: string = '';
  /** Compiled font string (e.g., '25px Helvetica'). */
  font: string;
  /** The text content. */
  text: string;
  /** Horizontal alignment. */
  horizontalAlign: HorizontalAlign;
  /** Vertical alignment. */
  verticalAlign: VerticalAlign;
  /** Width of the background box or interaction area. */
  width: number;
  /** Height of the background box or interaction area. */
  height: number;

  constructor(
    text: string,
    font: string,
    colour: string,
    horizontalAlign: HorizontalAlign,
    verticalAlign: VerticalAlign,
    width: number,
    height: number,
    backgroundColour: string = ''
  ) {
    super();
    this.text = text;
    this.font = font;
    this.colour = colour;
    this.horizontalAlign = horizontalAlign;
    this.verticalAlign = verticalAlign;
    this.width = width;
    this.height = height;
    this.backgroundColour = backgroundColour;
  }

  /**
   * Draws the text to the canvas.
   * @param ctx The canvas 2D rendering context.
   */
  draw(ctx: CanvasRenderingContext2D) {
    if (!this.gameObject) return;

    const { position } = this.gameObject;

    if (this.backgroundColour) {
      ctx.fillStyle = this.backgroundColour;
      ctx.fillRect(
        position.x,
        position.y,
        this.width,
        this.height
      );
    }

    ctx.font = this.font;
    ctx.fillStyle = this.colour;
    ctx.textAlign = this.horizontalAlign;
    ctx.textBaseline = this.verticalAlign;
    ctx.fillText(
      this.text,
      position.x + this.width / 2,
      position.y + this.height / 2
    );
  }
}
