import GameObject from './GameObject.js';
import Vector2 from './Vector2.js';

interface LineProperties {
  tag: string;
  width: number;
  p1: Vector2;
  p2: Vector2;
  zIndex: string;
}

const defaultProps = {
  tag: 'line',
  width: 1,
  zIndex: '0',
  p1: new Vector2(),
  p2: new Vector2(),
};

export default class Line extends GameObject {
  tag: string;
  strokeWidth: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  zIndex: string;

  get position() { return new Vector2(this.x1, this.y1); }
  get width() { return Math.abs(this.x2 - this.x1); }
  get height() { return Math.abs(this.y2 - this.y1); }

  constructor(props: LineProperties) {
    super(props.tag || defaultProps.tag, props.zIndex || defaultProps.zIndex);

    const defaultedProps = {
      ...defaultProps,
      ...props,
    };

    this.strokeWidth = defaultedProps.width;
    this.x1 = defaultedProps.p1.x;
    this.y1 = defaultedProps.p1.y;
    this.x2 = defaultedProps.p2.x;
    this.y2 = defaultedProps.p2.y;

    this.registerSelf();
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.lineWidth = this.strokeWidth;
    ctx.moveTo(this.x1, this.y1);
    ctx.lineTo(this.x2, this.y2);
    ctx.stroke();
  }
}
