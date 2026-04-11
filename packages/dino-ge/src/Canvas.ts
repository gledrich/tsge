/**
 * Simple wrapper for creating and managing a canvas element.
 * Supports full-screen or container-relative sizing.
 */
export default class Canvas {
  /** The underlying HTMLCanvasElement. */
  canvas: HTMLCanvasElement;
  /** Optional callback fired when the canvas resizes. */
  onResize?: () => void;

  private _resizeObserver?: ResizeObserver;

  constructor(parentElement?: HTMLElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'canvas';
    
    if (parentElement) {
      parentElement.appendChild(this.canvas);
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      
      // Use ResizeObserver to handle panel resizing in playground
      this._resizeObserver = new ResizeObserver(() => this.resize(parentElement));
      this._resizeObserver.observe(parentElement);
      this.resize(parentElement);
    } else {
      this.canvas.style.zIndex = '0';
      this.canvas.style.position = 'fixed';
      this.canvas.style.left = '0';
      this.canvas.style.top = '0';
      document.body.appendChild(this.canvas);
      this.resize();
    }
  }

  /**
   * Resizes the canvas to match its container or window dimensions.
   * @param parent Optional parent element to match size with.
   */
  resize(parent?: HTMLElement) {
    if (parent) {
      this.canvas.width = parent.clientWidth;
      this.canvas.height = parent.clientHeight;
    } else {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
    
    if (this.onResize) {
      this.onResize();
    }
  }

  /**
   * Cleans up resources.
   */
  destroy() {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }
    this.canvas.remove();
  }
}
