import Engine from './Engine.js';
import Vector2 from './Vector2.js';
import Component from './Component.js';
import TransformComponent from './TransformComponent.js';
import TagComponent from './TagComponent.js';
import EventBusComponent from './EventBusComponent.js';

/**
 * Base class for all entities in the game world.
 * Provides properties for physics, rendering, and lifecycle management.
 * Acts as the 'Entity' in our evolving Entity Component System.
 */
export default abstract class GameObject {
  /** Collection of components attached to this entity. */
  private _components: Map<string, Component> = new Map();

  /** Internal components for backward compatibility and core logic. */
  private _transform: TransformComponent;
  private _tag: TagComponent;
  private _eventBus: EventBusComponent;

  constructor(tag: string, zIndex: number) {
    this._tag = new TagComponent(tag, zIndex);
    this.addComponent(this._tag);

    this._transform = new TransformComponent();
    this.addComponent(this._transform);

    this._eventBus = new EventBusComponent();
    this.addComponent(this._eventBus);
  }

  /**
   * Listens for a local event on this entity.
   * @param type The event type.
   * @param callback The function to run when the event occurs.
   */
  on(type: string, callback: (event: CustomEvent) => void) {
    this._eventBus.on(type, callback);
  }

  /**
   * Stops listening for a local event.
   * @param type The event type.
   * @param callback The function to remove.
   */
  off(type: string, callback: (event: CustomEvent) => void) {
    this._eventBus.off(type, callback);
  }

  /**
   * Emits a local event on this entity.
   * @param type The event type.
   * @param detail Optional data to pass with the event.
   */
  emit(type: string, detail?: unknown) {
    this._eventBus.emit(type, detail);
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
   * The world-space position of the object.
   * Getter returns world position, setter sets local position.
   */
  get position(): Vector2 { return this._transform.worldPosition; }
  set position(val: Vector2) { this._transform.position = val; }

  /**
   * The local position relative to the parent.
   */
  get localPosition(): Vector2 { return this._transform.position; }
  set localPosition(val: Vector2) { this._transform.position = val; }

  /**
   * The world-space rotation in radians.
   */
  get rotation(): number { return this._transform.worldRotation; }
  set rotation(val: number) { this._transform.rotation = val; }

  /**
   * The local rotation in radians relative to the parent.
   */
  get localRotation(): number { return this._transform.rotation; }
  set localRotation(val: number) { this._transform.rotation = val; }

  /**
   * The local scale relative to the parent.
   */
  get scale(): Vector2 { return this._transform.scale; }
  set scale(val: Vector2) { this._transform.scale = val; }

  /**
   * Adds a child GameObject to this entity.
   * @param child The child entity to add.
   */
  addChild(child: GameObject) {
    child._transform.parent = this._transform;
    this._transform.children.add(child._transform);
  }

  /**
   * Removes a child GameObject from this entity.
   * @param child The child entity to remove.
   */
  removeChild(child: GameObject) {
    if (child._transform.parent === this._transform) {
      child._transform.parent = undefined;
      this._transform.children.delete(child._transform);
    }
  }

  /**
   * Gets or sets the parent GameObject.
   */
  get parent(): GameObject | undefined {
    return this._transform.parent?.gameObject;
  }
  set parent(val: GameObject | undefined) {
    if (this._transform.parent) {
      this._transform.parent.children.delete(this._transform);
    }
    this._transform.parent = val?._transform;
    val?._transform.children.add(this._transform);
  }

  /**
   * Adds a component to this entity.
   * @param component The component to add.
   */
  addComponent(component: Component) {
    const key = component.constructor.name;
    this._components.set(key, component);

    // Also index by RenderComponent if it is one, to allow abstract querying.
    // Use flag instead of instanceof to work across potential module duplications.
    if ((component as unknown as { isRenderComponent: boolean; }).isRenderComponent) {
      this._components.set('RenderComponent', component);
    }

    component.gameObject = this;
  }

  /**
   * Removes a component from this entity by its class.
   * @param componentClass The class of the component to remove.
   */
  removeComponent<T extends Component>(componentClass: { new(...args: unknown[]): T; }) {
    this._components.delete(componentClass.name);
  }

  /**
   * Checks if this entity has a component of the specified class.
   * @param componentClass The class of the component to check for.
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  hasComponent<T extends Component>(componentClass: Function & { prototype: T; }): boolean {
    return this._components.has(componentClass.name);
  }

  /** Gets a component from this entity by its class.
   * @param componentClass The class of the component to retrieve.
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  getComponent<T extends Component>(componentClass: Function & { prototype: T; }): T | undefined {
    return this._components.get(componentClass.name) as T;
  }

  /** The width of the object in pixels. */
  get width(): number { return 0; }
  /** The height of the object in pixels. */
  get height(): number { return 0; }

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
