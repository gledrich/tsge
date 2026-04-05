import Vector2 from './Vector2.js';
import GameObject from './GameObject.js';
import ShapeComponent from './ShapeComponent.js';

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
  zIndex: number;
}

const defaultProps = {
  tag: 'rect', colour: 'black', zIndex: 0,
}

/**
 * A basic rectangle shape that can be drawn to the screen.
 */
export default class Rectangle extends GameObject {
  private _width: number;
  private _height: number;
  /** Fill colour. */
  colour: string;

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
    this.localPosition = defaultedProps.position;
    this._width = defaultedProps.width;
    this._height = defaultedProps.height;
    this.colour = defaultedProps.colour;
    this.zIndex = defaultedProps.zIndex;

    this.addComponent(new ShapeComponent('rect', this.colour, this._width, this._height));

    this.registerSelf();
  }
}
