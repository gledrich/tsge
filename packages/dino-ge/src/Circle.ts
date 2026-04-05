import Vector2 from './Vector2.js';
import GameObject from './GameObject.js';
import ShapeComponent from './ShapeComponent.js';

/**
 * Configuration for creating a Circle object.
 */
export interface CircleProps {
  /** Unique tag for identification. */
  tag: string;
  /** Initial position of the circle. */
  position: Vector2;
  /** Radius of the circle. */
  radius: number;
  /** Fill colour. */
  colour: string;
  /** Render order (lower is background). */
  zIndex: number;
}

const defaultProps = {
  tag: 'circle',
  colour: 'black',
  zIndex: 0,
};

/**
 * A basic circle shape that can be drawn to the screen.
 */
export default class Circle extends GameObject {
  /** Radius of the circle. */
  radius: number;
  /** Fill colour. */
  colour: string;

  /** Width of the circle (radius * 2). */
  get width() { return this.radius * 2; }
  /** Height of the circle (radius * 2). */
  get height() { return this.radius * 2; }

  /** Center point of the circle. */
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
    this.position = defaultedProps.position;
    this.radius = defaultedProps.radius;
    this.colour = defaultedProps.colour;
    this.zIndex = defaultedProps.zIndex;

    this.addComponent(new ShapeComponent('circle', this.colour, this.radius));

    this.registerSelf();
  }
}
