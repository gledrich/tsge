export default class Canvas {
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
