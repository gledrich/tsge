import Engine from './Engine.js';
import Vector2 from './Vector2.js';
import Component from './Component.js';
import PhysicsComponent from './PhysicsComponent.js';
import TransformComponent from './TransformComponent.js';
import TagComponent from './TagComponent.js';
import VisibilityComponent from './VisibilityComponent.js';
import RenderComponent from './RenderComponent.js';

/**
 * Base class for all entities in the game world.
 * Provides properties for physics, rendering, and lifecycle management.
 * Acts as the 'Entity' in our evolving Entity Component System.
 */
export default abstract class GameObject {
  /** Collection of components attached to this entity. */
  private _components: Map<string, Component> = new Map();

  /** Internal components for backward compatibility and core logic. */
  private _physics: PhysicsComponent;
  private _transform: TransformComponent;
  private _tag: TagComponent;
  private _visibility: VisibilityComponent;

  constructor(tag: string, zIndex: number) {
    // Initialize with core components for now to maintain backward compatibility.
    // In a pure ECS, components would be added as needed.
    this._tag = new TagComponent(tag, zIndex);
    this.addComponent(this._tag);

    this._visibility = new VisibilityComponent();
    this.addComponent(this._visibility);

    this._physics = new PhysicsComponent();
    this.addComponent(this._physics);

    this._transform = new TransformComponent();
    this.addComponent(this._transform);
  }

  /**
   * A unique identifier for the object type.
   * @deprecated Use getComponent(TagComponent).tag
   */
  get tag(): string { return this._tag.tag; }
  set tag(val: string) { this._tag.tag = val; }

  /**
   * Rendering order (lower is background, higher is foreground).
   * @deprecated Use getComponent(TagComponent).zIndex
   */
  get zIndex(): number { return this._tag.zIndex; }
  set zIndex(val: number) { this._tag.zIndex = val; }

  /**
   * Whether the object should be rendered.
   * @deprecated Use getComponent(VisibilityComponent).visible
   */
  get visible(): boolean { return this._visibility.visible; }
  set visible(val: boolean) { this._visibility.visible = val; }

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

    // Also index by RenderComponent if it is one, to allow abstract querying.
    // Use flag instead of instanceof to work across potential module duplications.
    if ((component as any).isRenderComponent) {
      this._components.set('RenderComponent', component);
    }

    component.gameObject = this;
  }

  /**
   * Removes a component from this entity by its class.
   * @param componentClass The class of the component to remove.
   */
  removeComponent<T extends Component>(componentClass: { new (...args: unknown[]): T }) {
    this._components.delete(componentClass.name);
  }

  /**
   * Checks if this entity has a component of the specified class.
   * @param componentClass The class of the component to check for.
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  hasComponent<T extends Component>(componentClass: Function & { prototype: T }): boolean {
    return this._components.has(componentClass.name);
  }

  /** Gets a component from this entity by its class.
   * @param componentClass The class of the component to retrieve.
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  getComponent<T extends Component>(componentClass: Function & { prototype: T }): T | undefined {
    return this._components.get(componentClass.name) as T;
  }

  /** The width of the object in pixels. */
  abstract get width(): number;
  /** The height of the object in pixels. */
  abstract get height(): number;

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
