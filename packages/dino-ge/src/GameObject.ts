import Registry from './Registry.js';
import Component from './Component.js';
import TransformComponent from './TransformComponent.js';
import TagComponent from './TagComponent.js';
import BoundsComponent from './BoundsComponent.js';
import EventBusComponent from './EventBusComponent.js';

/**
 * Interface representing an abstract class constructor.
 */
export interface AbstractConstructor<T> {
  prototype: T;
  name: string;
}

/**
 * Base class for all entities in the game world.
 */
export default abstract class GameObject {
  public readonly id: string = Math.random().toString(36).substring(2, 9);
  private _components: Map<string, Component> = new Map();

  public get transform(): TransformComponent {
    let transform = this.getComponent(TransformComponent);
    if (!transform) {
      transform = new TransformComponent();
      this.addComponent(transform);
    }
    return transform;
  }

  public get metadata(): TagComponent {
    let tag = this.getComponent(TagComponent);
    if (!tag) {
      tag = new TagComponent();
      this.addComponent(tag);
    }
    return tag;
  }

  public get bounds(): BoundsComponent | undefined {
    return this.getComponent(BoundsComponent);
  }

  public set bounds(val: BoundsComponent | undefined) {
    if (val) {
      this.addComponent(val);
    } else {
      this.removeComponent(BoundsComponent);
    }
  }

  constructor(tag: string = 'obj', zIndex: number = 0) {
    this.addComponent(new TagComponent(tag, zIndex));
    this.addComponent(new TransformComponent());
  }

  on(type: string, callback: (event: CustomEvent) => void) {
    let bus = this.getComponent(EventBusComponent);
    if (!bus) {
      bus = new EventBusComponent();
      this.addComponent(bus);
    }
    bus.on(type, callback);
  }

  off(type: string, callback: (event: CustomEvent) => void) {
    this.getComponent(EventBusComponent)?.off(type, callback);
  }

  emit(type: string, detail?: unknown) {
    this.getComponent(EventBusComponent)?.emit(type, detail);
  }

  addComponent(component: Component) {
    component.gameObject = this;
    let proto = Object.getPrototypeOf(component);
    while (proto && proto.constructor.name !== 'Object') {
      const key = proto.constructor.name;
      this._components.set(key, component);
      if (key === 'Component') break;
      proto = Object.getPrototypeOf(proto);
    }
    component.onAttach?.();
  }

  removeComponent<T extends Component>(componentClass: AbstractConstructor<T>) {
    const component = this.getComponent(componentClass);
    if (!component) return;
    for (const [key, value] of this._components.entries()) {
      if (value === component) {
        this._components.delete(key);
      }
    }
  }

  hasComponent<T extends Component>(componentClass: AbstractConstructor<T>): boolean {
    return this._components.has(componentClass.name);
  }

  getComponent<T extends Component>(componentClass: AbstractConstructor<T>): T | undefined {
    return this._components.get(componentClass.name) as T;
  }

  registerSelf() {
    Registry.registerObject(this);
  }

  /** Static helper for tests to bypass Registry circularity if mocked. */
  static _registry = Registry;

  destroySelf() {
    GameObject._registry.destroyObject(this);
  }
}
