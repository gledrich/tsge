import Vector2 from './Vector2.js';
import Engine from './Engine.js';

export default class Input {
  private static mousePosition: Vector2 = new Vector2(0, 0);
  private static clickListeners: Set<(pos: Vector2) => void> = new Set();

  static init() {
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
  }

  static get mouseX() {
    return (this.mousePosition.x / Engine.camera.zoom) + Engine.camera.position.x;
  }

  static get mouseY() {
    return (this.mousePosition.y / Engine.camera.zoom) + Engine.camera.position.y;
  }

  static addClickListener(listener: (pos: Vector2) => void) {
    this.clickListeners.add(listener);
  }

  static removeClickListener(listener: (pos: Vector2) => void) {
    this.clickListeners.delete(listener);
  }
}
