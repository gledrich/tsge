import Vector2 from './Vector2.js';
import GameObject from './GameObject.js';

export interface RectProps {
  tag: string;
  position: Vector2;
  width: number;
  height: number;
  colour: string;
  zIndex: string;
}

const defaultProps = {
  tag: 'rect', colour: 'black', zIndex: '0',
}

export default class Rectangle extends GameObject {
  _position: Vector2;
  _width: number;
  _height: number;
  colour: string;

  get position() { return this._position; }
  set position(val) { this._position = val; }
  get width() { return this._width; }
  set width(val) { this._width = val; }
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
