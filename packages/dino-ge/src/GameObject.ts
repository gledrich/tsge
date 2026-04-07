import Engine from './Engine.js';
import Component from './Component.js';
import TransformComponent from './TransformComponent.js';
import TagComponent from './TagComponent.js';
import BoundsComponent from './BoundsComponent.js';
import EventBusComponent from './EventBusComponent.js';

/**
 * Base class for all entities in the game world.
 * Provides properties for physics, rendering, and lifecycle management.
 * Acts as the 'Entity' in our evolving Entity Component System.
 */
export default abstract class GameObject {
  /** Collection of components attached to this entity. */
  private _components: Map<string, Component> = new Map();

  /** Component that holds spatial transformation data. */
  public readonly transform: TransformComponent;
  /** Component that holds metadata like tags and z-index. */
  public readonly metadata: TagComponent;
  /** Component that holds dimensions (width and height). */
  public bounds?: BoundsComponent;

  constructor(tag: string, zIndex: number) {
    this.metadata = new TagComponent(tag, zIndex);
    this.addComponent(this.metadata);

    this.transform = new TransformComponent();
    this.addComponent(this.transform);
  }

  /**
   * Listens for a local event on this entity.
   * @param type The event type.
   * @param callback The function to run when the event occurs.
   */
  on(type: string, callback: (event: CustomEvent) => void) {
    let bus = this.getComponent(EventBusComponent);
    if (!bus) {
      bus = new EventBusComponent();
      this.addComponent(bus);
    }
    bus.on(type, callback);
  }

  /**
   * Stops listening for a local event.
   * @param type The event type.
   * @param callback The function to remove.
   */
  off(type: string, callback: (event: CustomEvent) => void) {
    this.getComponent(EventBusComponent)?.off(type, callback);
  }

  /**
   * Emits a local event on this entity.
   * @param type The event type.
   * @param detail Optional data to pass with the event.
   */
  emit(type: string, detail?: unknown) {
    this.getComponent(EventBusComponent)?.emit(type, detail);
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
