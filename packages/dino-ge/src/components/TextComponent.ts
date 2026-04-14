import RenderComponent from './RenderComponent.js';
import BoundsComponent from './BoundsComponent.js';
import type { HorizontalAlign, VerticalAlign } from '../objects/Text.js';

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
  get width(): number {
    return this.gameObject?.bounds?.width ?? this._initialWidth;
  }
  set width(val: number) {
    this._initialWidth = val;
    if (this.gameObject?.bounds) {
      this.gameObject.bounds.width = val;
    }
  }

  /** Height of the background box or interaction area. */
  get height(): number {
    return this.gameObject?.bounds?.height ?? this._initialHeight;
  }
  set height(val: number) {
    this._initialHeight = val;
    if (this.gameObject?.bounds) {
      this.gameObject.bounds.height = val;
    }
  }

  private _initialWidth: number;
  private _initialHeight: number;

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
    this._initialWidth = width;
    this._initialHeight = height;
    this.backgroundColour = backgroundColour;
  }

  /**
   * Ensures the parent GameObject has a BoundsComponent synced with this component.
   * Note: Bounds represent the BASE local size (unscaled).
   */
  private _updateGameObjectBounds() {
    if (!this.gameObject) return;

    if (!this.gameObject.bounds) {
      this.gameObject.bounds = new BoundsComponent(this._initialWidth, this._initialHeight);
      this.gameObject.addComponent(this.gameObject.bounds);
    } else {
      this.gameObject.bounds.width = this._initialWidth;
      this.gameObject.bounds.height = this._initialHeight;
    }
  }

  /**
   * Lifecycle hook called when the component is added to a GameObject.
   */
  onAttach() {
    this._updateGameObjectBounds();
  }

  /**
   * Draws the text to the canvas.
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

    if (this.backgroundColour) {
      ctx.fillStyle = this.backgroundColour;
      ctx.fillRect(
        0,
        0,
        width,
        height
      );
    }

    ctx.font = this.font;
    ctx.fillStyle = this.colour;
    ctx.textAlign = this.horizontalAlign;
    ctx.textBaseline = this.verticalAlign;

    // Calculate draw position based on alignment
    let x = 0;
    let y = 0;

    if (this.horizontalAlign === 'center') x = width / 2;
    else if (this.horizontalAlign === 'right' || this.horizontalAlign === 'end') x = width;

    if (this.verticalAlign === 'middle') y = height / 2;
    else if (this.verticalAlign === 'bottom') y = height;

    ctx.fillText(this.text, x, y);
    
    ctx.restore();
  }
}
