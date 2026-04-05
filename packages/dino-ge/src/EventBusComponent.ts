import Component from './Component.js';

/**
 * Component that allows an entity to emit and listen for local events.
 */
export default class EventBusComponent extends Component {
  private events: EventTarget = new EventTarget();

  /**
   * Listens for a local event on this entity.
   * @param type The event type.
   * @param callback The function to run when the event occurs.
   */
  on(type: string, callback: (event: CustomEvent) => void) {
    this.events.addEventListener(type, callback as (e: Event) => void);
  }

  /**
   * Stops listening for a local event.
   * @param type The event type.
   * @param callback The function to remove.
   */
  off(type: string, callback: (event: CustomEvent) => void) {
    this.events.removeEventListener(type, callback as (e: Event) => void);
  }

  /**
   * Emits a local event on this entity.
   * @param type The event type.
   * @param detail Optional data to pass with the event.
   */
  emit(type: string, detail?: unknown) {
    this.events.dispatchEvent(new CustomEvent(type, { detail }));
  }
}
