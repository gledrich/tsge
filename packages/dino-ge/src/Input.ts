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

  private static isDragging = false;
  private static dragOffset: Vector2 = new Vector2(0, 0);

  /**
   * Initializes input event listeners.
   */
  static init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    document.addEventListener('mousemove', (event: MouseEvent) => {
      this.mousePosition.x = event.clientX;
      this.mousePosition.y = event.clientY;

      if (this.isDragging && Engine.selectedObject && Engine.debug) {
        const { parent } = Engine.selectedObject.transform;
        if (parent) {
          const parentWorldPos = parent.worldPosition;
          Engine.selectedObject.transform.position.x = (this.mouseX - this.dragOffset.x) - parentWorldPos.x;
          Engine.selectedObject.transform.position.y = (this.mouseY - this.dragOffset.y) - parentWorldPos.y;
        } else {
          Engine.selectedObject.transform.position.x = this.mouseX - this.dragOffset.x;
          Engine.selectedObject.transform.position.y = this.mouseY - this.dragOffset.y;
        }
      }
    });

    document.addEventListener('mousedown', (event: MouseEvent) => {
      if ((event.target as HTMLElement).tagName !== 'CANVAS') return;
      this.keys.add(`mouse${event.button}`);

      const worldPos = new Vector2(this.mouseX, this.mouseY);

      // If debug mode is on, try to select/drag an object
      if (Engine.debug && event.button === 0) {
        const objects = Engine.currentScene ? Engine.currentScene.objects : Engine.objects;
        let found = false;

        // Check objects from top to bottom (zIndex)
        const sorted = Array.from(objects).sort((a, b) => (b.metadata.zIndex > a.metadata.zIndex ? 1 : -1));

        for (const obj of sorted) {
          const width = obj.bounds?.width ?? 0;
          const height = obj.bounds?.height ?? 0;
          const { worldPosition } = obj.transform;
          if (
            worldPos.x > worldPosition.x &&
            worldPos.x < worldPosition.x + width &&
            worldPos.y > worldPosition.y &&
            worldPos.y < worldPosition.y + height
          ) {
            Engine.selectedObject = obj;
            this.isDragging = true;
            this.dragOffset.x = worldPos.x - worldPosition.x;
            this.dragOffset.y = worldPos.y - worldPosition.y;
            found = true;
            break;
          }
        }

        if (!found) {
          Engine.selectedObject = null;
        }
      }

      if (!Engine.paused) {
        this.clickListeners.forEach((listener) => listener(worldPos));
      }
    });

    document.addEventListener('mouseup', (event: MouseEvent) => {
      this.keys.delete(`mouse${event.button}`);
      if (event.button === 0) {
        this.isDragging = false;
      }
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
