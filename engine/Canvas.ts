/**
 * Simple wrapper for creating and managing a full-screen canvas element.
 */
export default class Canvas {
  /** The underlying HTMLCanvasElement. */
  canvas: HTMLCanvasElement;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'canvas';
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.canvas.style.zIndex = '0';
    this.canvas.style.position = 'fixed';
  }
}
