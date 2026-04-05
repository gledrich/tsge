import GameObject from './GameObject.js';
import Vector2 from './Vector2.js';
import LineComponent from './LineComponent.js';

/**
 * Configuration for creating a Line object.
 */
export interface LineProperties {
  /** Unique tag for identification. */
  tag: string;
  /** Stroke width of the line. */
  width: number;
  /** Start point of the line. */
  p1: Vector2;
  /** End point of the line. */
  p2: Vector2;
  /** Render order (lower is background). */
  zIndex: number;
}

const defaultProps = {
  tag: 'line',
  width: 1,
  zIndex: 0,
  p1: new Vector2(),
  p2: new Vector2(),
};

/**
 * A basic line object that can be drawn between two points.
 */
export default class Line extends GameObject {
  /** Stroke width of the line. */
  strokeWidth: number;
  /** Start x coordinate. */
  x1: number;
  /** Start y coordinate. */
  y1: number;
  /** End x coordinate. */
  x2: number;
  /** End y coordinate. */
  y2: number;

  /** Gets the starting position of the line. */
  get position() { return new Vector2(this.x1, this.y1); }
  /** Gets the bounding box width of the line. */
  get width() { return Math.abs(this.x2 - this.x1); }
  /** Gets the bounding box height of the line. */
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

    this.addComponent(new LineComponent(this.strokeWidth, defaultedProps.p1, defaultedProps.p2));

    this.registerSelf();
  }
}
