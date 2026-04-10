import RenderComponent from './RenderComponent.js';
import BoundsComponent from './BoundsComponent.js';
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

  private _width: number;
  private _height: number;

  /** Width of the background box or interaction area. */
  get width(): number { return this._width; }
  set width(val: number) {
    this._width = val;
    this._updateGameObjectBounds();
  }

  /** Height of the background box or interaction area. */
  get height(): number { return this._height; }
  set height(val: number) {
    this._height = val;
    this._updateGameObjectBounds();
  }

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
    this._width = width;
    this._height = height;
    this.backgroundColour = backgroundColour;
  }

  /**
   * Ensures the parent GameObject has a BoundsComponent synced with this component.
   */
  private _updateGameObjectBounds() {
    if (!this.gameObject) return;

    if (!this.gameObject.bounds) {
      this.gameObject.bounds = new BoundsComponent(this._width, this._height);
      this.gameObject.addComponent(this.gameObject.bounds);
    } else {
      this.gameObject.bounds.width = this._width;
      this.gameObject.bounds.height = this._height;
    }
  }

  /**
   * Lifecycle hook called by GameObject when component is added.
   */
  onAttach() {
    this._updateGameObjectBounds();
  }

  /**
   * Draws the text to the canvas.
   * @param ctx The canvas 2D rendering context.
   */
  draw(ctx: CanvasRenderingContext2D) {
    if (!this.gameObject) return;

    const { worldPosition, worldRotation, worldScale } = this.gameObject.transform;

    ctx.save();
    ctx.translate(worldPosition.x, worldPosition.y);
    if (worldRotation !== 0) ctx.rotate(worldRotation);
    ctx.scale(worldScale.x, worldScale.y);

    if (this.backgroundColour) {
      ctx.fillStyle = this.backgroundColour;
      ctx.fillRect(
        0,
        0,
        this._width,
        this._height
      );
    }

    ctx.font = this.font;
    ctx.fillStyle = this.colour;
    ctx.textAlign = this.horizontalAlign;
    ctx.textBaseline = this.verticalAlign;
    ctx.fillText(
      this.text,
      this._width / 2,
      this._height / 2
    );
    
    ctx.restore();
  }
}
