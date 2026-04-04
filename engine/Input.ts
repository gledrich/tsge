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

    document.addEventListener('click', () => {
      const pos = new Vector2(this.mouseX, this.mouseY);

      // If debug mode is on, try to select an object
      if (Engine.debug) {
        const objects = Engine.currentScene ? Engine.currentScene.objects : Engine.objects;
        let found = false;

        // Check objects from top to bottom (zIndex)
        const sorted = Array.from(objects).sort((a, b) => (parseInt(b.zIndex, 10) > parseInt(a.zIndex, 10) ? 1 : -1));

        for (const obj of sorted) {
          if (
            pos.x > obj.position.x &&
            pos.x < obj.position.x + obj.width &&
            pos.y > obj.position.y &&
            pos.y < obj.position.y + obj.height
          ) {
            Engine.selectedObject = obj;
            found = true;
            break;
          }
        }

        if (!found) Engine.selectedObject = null;
      }

      this.clickListeners.forEach((listener) => listener(pos));
    });

    document.addEventListener('mousedown', (event: MouseEvent) => {
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
