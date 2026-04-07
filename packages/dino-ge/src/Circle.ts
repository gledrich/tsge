import Vector2 from './Vector2.js';
import GameObject from './GameObject.js';
import ShapeComponent from './ShapeComponent.js';
import BoundsComponent from './BoundsComponent.js';

/**
 * Configuration for creating a Circle object.
 */
export interface CircleProps {
  /** Unique tag for identification. */
  tag?: string;
  /** Initial position of the circle. */
  position: Vector2;
  /** Radius of the circle. */
  radius: number;
  /** Fill colour. */
  colour?: string;
  /** Render order (lower is background). */
  zIndex?: number;
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

  /** Center point of the circle. */
  get center(): Vector2 {
    return new Vector2(
      this.transform.position.x + this.radius,
      this.transform.position.y + this.radius
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

    this.metadata.tag = defaultedProps.tag;
    this.transform.position = defaultedProps.position;
    this.radius = defaultedProps.radius;
    this.bounds = new BoundsComponent(this.radius * 2, this.radius * 2);
    this.addComponent(this.bounds);
    this.colour = defaultedProps.colour;
    this.metadata.zIndex = defaultedProps.zIndex;

    this.addComponent(new ShapeComponent('circle', this.colour, this.radius));

    this.registerSelf();
  }
}
