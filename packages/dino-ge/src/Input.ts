import Vector2 from './Vector2.js';
import Engine from './Engine.js';

/**
 * Handles mouse and keyboard input events.
 */
export default class Input {
  private static mousePosition: Vector2 = new Vector2(0, 0);
  private static clickListeners: Set<(pos: Vector2) => void> = new Set();
  private static keys: Set<string> = new Set();
  private static isInitialized = false;

  /**
   * Initializes input event listeners.
   */
  static init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    document.addEventListener('mousemove', (event: MouseEvent) => {
      this.mousePosition.x = event.clientX;
      this.mousePosition.y = event.clientY;
    });

    document.addEventListener('click', (event: MouseEvent) => {
      if ((event.target as HTMLElement).tagName !== 'CANVAS') return;

      const pos = new Vector2(this.mouseX, this.mouseY);

      // If debug mode is on, try to select an object
      if (Engine.debug) {
        const objects = Engine.currentScene ? Engine.currentScene.objects : Engine.objects;
        let found = false;

        // Check objects from top to bottom (zIndex)
        const sorted = Array.from(objects).sort((a, b) => (b.metadata.zIndex > a.metadata.zIndex ? 1 : -1));

        for (const obj of sorted) {
          const width = obj.bounds?.width ?? 0;
          const height = obj.bounds?.height ?? 0;
          if (
            pos.x > obj.transform.position.x &&
            pos.x < obj.transform.position.x + width &&
            pos.y > obj.transform.position.y &&
            pos.y < obj.transform.position.y + height
          ) {
            Engine.selectedObject = obj;
            found = true;
            break;
          }
        }

        if (!found) Engine.selectedObject = null;
      }

      if (!Engine.paused) {
        this.clickListeners.forEach((listener) => listener(pos));
      }
    });

    document.addEventListener('mousedown', (event: MouseEvent) => {
      if ((event.target as HTMLElement).tagName !== 'CANVAS') return;
      this.keys.add(`mouse${event.button}`);
    });

    document.addEventListener('mouseup', (event: MouseEvent) => {
      this.keys.delete(`mouse${event.button}`);
    });

    document.addEventListener('keydown', (event: KeyboardEvent) => {
      this.keys.add(event.key.toLowerCase());

      // Toggle Pause with P
      if (event.key === 'p' || event.key === 'P') {
        Engine.paused = !Engine.paused;
        
        if (Engine.paused) {
          document.getElementById('canvas')!.style.cursor = 'default';
        }
      }
    });

    document.addEventListener('keyup', (event: KeyboardEvent) => {
      this.keys.delete(event.key.toLowerCase());
    });

    window.addEventListener('blur', () => {
      this.keys.clear();
    });
  }

  /**
   * Checks if a specific key is currently held down.
   * @param key The key to check (e.g., 'w', 'ArrowUp', ' ').
   */
  static isKeyDown(key: string): boolean {
    return this.keys.has(key.toLowerCase());
  }

  /** Current mouse x position in world space. */
  static get mouseX() {
    return (this.mousePosition.x / Engine.camera.zoom) + Engine.camera.position.x;
  }

  /** Current mouse y position in world space. */
  static get mouseY() {
    return (this.mousePosition.y / Engine.camera.zoom) + Engine.camera.position.y;
  }

  /** Adds a global click listener. */
  static addClickListener(listener: (pos: Vector2) => void) {
    this.clickListeners.add(listener);
  }

  /** Removes a global click listener. */
  static removeClickListener(listener: (pos: Vector2) => void) {
    this.clickListeners.delete(listener);
  }
}
