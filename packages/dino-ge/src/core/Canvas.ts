/**
 * Simple wrapper for creating and managing a canvas element.
 * Supports full-screen or container-relative sizing.
 */
export default class Canvas {
  /** The underlying HTMLCanvasElement. */
  public canvas: HTMLCanvasElement;
  /** Optional callback fired when the canvas resizes. */
  public onResize?: () => void;

  private _resizeObserver?: ResizeObserver;

  /**
   * initialises a new instance of Canvas.
   * @param parentElement Optional HTML element to inject the canvas into.
   */
  constructor(parentElement?: HTMLElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'canvas';
    
    if (parentElement) {
      parentElement.appendChild(this.canvas);
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      
      // Use ResizeObserver to handle panel resizing in playground
      this._resizeObserver = new ResizeObserver(this._onResizeObserved.bind(this, parentElement));
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
  public resize(parent?: HTMLElement) {
    const target = parent || this.canvas.parentElement;
    if (target && target.clientWidth > 0) {
      this.canvas.width = target.clientWidth;
      this.canvas.height = target.clientHeight;
    } else {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
    
    if (this.onResize) {
      this.onResize();
    }
  }

  private _onResizeObserved(parentElement: HTMLElement) {
    this.resize(this.canvas.parentElement || parentElement);
  }

  /**
   * Completely removes the canvas element and cleans up its observers.
   */
  public destroy() {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }
    this.canvas.remove();
  }
}
