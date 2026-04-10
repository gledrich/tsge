import type GameObject from './GameObject.js';

/**
 * Base class for all components in the Entity Component System.
 * Components are pure data containers that can be attached to GameObjects.
 */
export default abstract class Component {
  /** Reference to the GameObject this component is attached to. */
  public gameObject?: GameObject;

  /** Optional lifecycle hook called when the component is added to a GameObject. */
  public onAttach?(): void;
}
