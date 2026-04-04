import Vector2 from './Vector2.js';
import GameObject from './GameObject.js';

/**
 * Configuration for creating a Rectangle object.
 */
export interface RectProps {
  /** Unique tag for identification. */
  tag: string;
  /** Initial position of the top-left corner. */
  position: Vector2;
  /** Width of the rectangle. */
  width: number;
  /** Height of the rectangle. */
  height: number;
  /** Fill colour. */
  colour: string;
  /** Render order. */
  zIndex: string;
}

const defaultProps = {
  tag: 'rect', colour: 'black', zIndex: '0',
}

/**
 * A basic rectangle shape that can be drawn to the screen.
 */
export default class Rectangle extends GameObject {
  private _position: Vector2;
  private _width: number;
  private _height: number;
  /** Fill colour. */
  colour: string;

  /** Gets or sets the top-left position. */
  get position() { return this._position; }
  set position(val) { this._position = val; }
  /** Gets or sets the width. */
  get width() { return this._width; }
  set width(val) { this._width = val; }
  /** Gets or sets the height. */
  get height() { return this._height; }
  set height(val) { this._height = val; }

  constructor(props: RectProps) {
    super(props.tag || defaultProps.tag, props.zIndex || defaultProps.zIndex);
    
    const defaultedProps = {
      ...defaultProps,
      ...props
    }

    if (!(defaultedProps.position instanceof Vector2)) {
      throw new Error('"position" must be a Vector2!');
    }

    if (!defaultedProps.width || !defaultedProps.height) {
      throw new Error('You must provide a width and height for Rectangle');
    }

    this.tag = defaultedProps.tag;
    this._position = defaultedProps.position;
    this._width = defaultedProps.width;
    this._height = defaultedProps.height;
    this.colour = defaultedProps.colour;
    this.zIndex = defaultedProps.zIndex;

    this.registerSelf();
  }

  /** Draws the rectangle onto the provided rendering context. */
  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.colour;
    ctx.fillRect(
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }
}
