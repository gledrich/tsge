import Vector2 from './Vector2.js';

export default class Input {
  private static mousePosition: Vector2 = new Vector2(0, 0);
  private static clickListeners: Set<(pos: Vector2) => void> = new Set();

  static init() {
    document.addEventListener('mousemove', (event: MouseEvent) => {
      this.mousePosition.x = event.clientX;
      this.mousePosition.y = event.clientY;
    });

    document.addEventListener('click', (event: MouseEvent) => {
      const pos = new Vector2(event.clientX, event.clientY);
      this.clickListeners.forEach((listener) => listener(pos));
    });
  }

  static get mouseX() {
    return this.mousePosition.x;
  }

  static get mouseY() {
    return this.mousePosition.y;
  }

  static addClickListener(listener: (pos: Vector2) => void) {
    this.clickListeners.add(listener);
  }

  static removeClickListener(listener: (pos: Vector2) => void) {
    this.clickListeners.delete(listener);
  }
}
