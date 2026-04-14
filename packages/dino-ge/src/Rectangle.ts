import Vector2 from './Vector2.js';
import GameObject from './GameObject.js';
import ShapeComponent from './ShapeComponent.js';
import VisibilityComponent from './VisibilityComponent.js';
import PhysicsComponent from './PhysicsComponent.js';

/**
 * Configuration for creating a Rectangle object.
 */
export interface RectProps {
  /** Unique tag for identification. */
  tag?: string;
  /** Hidden identifier linking runtime object to its source code location. */
  __sourceId?: string;
  /** Initial position of the top-left corner. */
  position: Vector2;
  /** Width of the rectangle. */
  width: number;
  /** Height of the rectangle. */
  height: number;
  /** Fill colour. */
  colour?: string;
  /** Render order. */
  zIndex?: number;
  /** Whether the rectangle is initially visible. */
  visible?: boolean;
  /** Initial physics configuration. */
  physics?: {
    velocity?: Vector2;
    acceleration?: Vector2;
    mass?: number;
    isStatic?: boolean;
    restitution?: number;
    friction?: number;
  };
}

const defaultProps = {
  tag: 'rect', colour: 'black', zIndex: 0,
}

/**
 * A basic rectangle shape that can be drawn to the screen.
 */
export default class Rectangle extends GameObject {
  /** Fill colour (CSS colour string). */
  public colour: string;

  /**
   * Initializes a new instance of a Rectangle.
   * @param props Configuration properties for the rectangle.
   */
  constructor(props: RectProps) {
    super(props.tag || defaultProps.tag, props.zIndex || defaultProps.zIndex, props.__sourceId);
    
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

    this.metadata.tag = defaultedProps.tag;
    this.transform.position = defaultedProps.position;
    this.colour = defaultedProps.colour;
    this.metadata.zIndex = defaultedProps.zIndex;

    // ShapeComponent will automatically create/update BoundsComponent via onAttach
    this.addComponent(new ShapeComponent('rect', this.colour, defaultedProps.width, defaultedProps.height));

    if (props.visible !== undefined) {
      this.addComponent(new VisibilityComponent(props.visible));
    }

    if (props.physics) {
      const pc = new PhysicsComponent();
      if (props.physics.velocity) pc.velocity.copy(props.physics.velocity);
      if (props.physics.acceleration) pc.acceleration.copy(props.physics.acceleration);
      if (props.physics.mass !== undefined) pc.mass = props.physics.mass;
      if (props.physics.isStatic !== undefined) pc.isStatic = props.physics.isStatic;
      if (props.physics.restitution !== undefined) pc.restitution = props.physics.restitution;
      if (props.physics.friction !== undefined) pc.friction = props.physics.friction;
      this.addComponent(pc);
    }

    this.registerSelf();
  }
}
