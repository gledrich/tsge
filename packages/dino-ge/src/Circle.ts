import Vector2 from './Vector2.js';
import GameObject from './GameObject.js';
import ShapeComponent from './ShapeComponent.js';

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
  /** Radius of the circle in local space. */
  public radius: number;
  /** Fill colour (CSS colour string). */
  public colour: string;

  /**
   * The center point of the circle in world space.
   */
  public get center(): Vector2 {
    const r = this.radius * this.transform.worldScale.x;
    return this.transform.worldPosition.add(new Vector2(r, r));
  }

  /**
   * The radius of the circle in world space (accounting for scale).
   */
  public get worldRadius(): number {
    return this.radius * this.transform.worldScale.x;
  }

  /**
   * Initializes a new instance of a Circle.
   * @param props Configuration properties for the circle.
   */
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
    this.colour = defaultedProps.colour;
    this.metadata.zIndex = defaultedProps.zIndex;

    // ShapeComponent will automatically create the BoundsComponent (radius * 2) via onAttach
    this.addComponent(new ShapeComponent('circle', this.colour, this.radius, this.radius));

    this.registerSelf();
  }
}
