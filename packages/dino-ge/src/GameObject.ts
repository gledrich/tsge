import Engine from './Engine.js';
import Vector2 from './Vector2.js';
import Component from './Component.js';
import PhysicsComponent from './PhysicsComponent.js';
import TransformComponent from './TransformComponent.js';

/**
 * Base class for all entities in the game world.
 * Provides properties for physics, rendering, and lifecycle management.
 * Acts as the 'Entity' in our evolving Entity Component System.
 */
export default abstract class GameObject {
  /** A unique identifier for the object type. */
  tag: string;
  /** Rendering order (lower is background, higher is foreground). */
  zIndex: number;

  /** Collection of components attached to this entity. */
  private _components: Map<string, Component> = new Map();

  /** Whether the object should be rendered. */
  visible: boolean = true;

  /** Internal components for backward compatibility and core logic. */
  private _physics: PhysicsComponent;
  private _transform: TransformComponent;

  constructor(tag: string, zIndex: number) {
    this.tag = tag;
    this.zIndex = zIndex;

    // Initialize with core components for now to maintain backward compatibility.
    // In a pure ECS, components would be added as needed.
    this._physics = new PhysicsComponent();
    this.addComponent(this._physics);

    this._transform = new TransformComponent();
    this.addComponent(this._transform);
  }

  /**
   * The world-space position of the object.
   * Proxies to the TransformComponent.
   */
  get position(): Vector2 { return this._transform.position; }
  set position(val: Vector2) { this._transform.position = val; }

  /**
   * Current velocity in pixels per second.
   * @deprecated Use getComponent(PhysicsComponent).velocity
   */
  get velocity(): Vector2 { return this._physics.velocity; }
  set velocity(val: Vector2) { this._physics.velocity = val; }

  /**
   * Current acceleration in pixels per second squared.
   * @deprecated Use getComponent(PhysicsComponent).acceleration
   */
  get acceleration(): Vector2 { return this._physics.acceleration; }
  set acceleration(val: Vector2) { this._physics.acceleration = val; }

  /**
   * Mass of the object (used for physics resolution).
   * @deprecated Use getComponent(PhysicsComponent).mass
   */
  get mass(): number { return this._physics.mass; }
  set mass(val: number) { this._physics.mass = val; }

  /**
   * Whether the object is immovable (e.g., walls).
   * @deprecated Use getComponent(PhysicsComponent).isStatic
   */
  get isStatic(): boolean { return this._physics.isStatic; }
  set isStatic(val: boolean) { this._physics.isStatic = val; }

  /**
   * Adds a component to this entity.
   * @param component The component to add.
   */
  addComponent(component: Component) {
    const key = component.constructor.name;
    this._components.set(key, component);
    component.gameObject = this;
  }

  /** Gets a component from this entity by its class.
   * @param componentClass The class of the component to retrieve.
   */
  getComponent<T extends Component>(componentClass: { new (...args: any[]): T }): T | undefined {
    return this._components.get(componentClass.name) as T;
  }

  /** The width of the object in pixels. */
  abstract get width(): number;
  /** The height of the object in pixels. */
  abstract get height(): number;

  /**
   * Main rendering method for the object.
   * @param ctx The canvas 2D rendering context.
   */
  abstract draw(ctx: CanvasRenderingContext2D): void;

  /**
   * Registers the object with the active scene or global engine loop.
   */
  registerSelf() {
    Engine.registerObject(this);
  }

  /**
   * Removes the object from the active scene.
   */
  destroySelf() {
    Engine.destroyObject(this);
  }
}
