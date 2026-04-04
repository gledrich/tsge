import Vector2 from './Vector2.js';
import GameObject from './GameObject.js';

export interface CircleProps {
  tag: string;
  position: Vector2;
  radius: number;
  colour: string;
  zIndex: string;
}

const defaultProps = {
  tag: 'circle',
  colour: 'black',
  zIndex: '0',
};

export default class Circle extends GameObject {
  _position: Vector2;
  radius: number;
  colour: string;

  get position() { return this._position; }
  set position(val) { this._position = val; }

  get width() { return this.radius * 2; }
  get height() { return this.radius * 2; }

  get center(): Vector2 {
    return new Vector2(
      this.position.x + this.radius,
      this.position.y + this.radius
    );
  }

  constructor(props: CircleProps) {
    super(props.tag || defaultProps.tag, props.zIndex || defaultProps.zIndex);

    const defaultedProps = {
      ...defaultProps,
      ...props
    };

    if (!(defaultedProps.position instanceof Vector2)) {
      throw new Error('"position" must be a Vector2!');
    }

    if (!defaultedProps.radius) {
      throw new Error('You must provide a radius for Circle');
    }

    this.tag = defaultedProps.tag;
    this._position = defaultedProps.position;
    this.radius = defaultedProps.radius;
    this.colour = defaultedProps.colour;
    this.zIndex = defaultedProps.zIndex;

    this.registerSelf();
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.fillStyle = this.colour;
    const center = this.center;
    ctx.arc(center.x, center.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }
}
