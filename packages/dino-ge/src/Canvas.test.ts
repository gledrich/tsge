import Canvas from './Canvas';

describe('Canvas', () => {
  let resizeCallback: ((entries: unknown[], observer: unknown) => void) | undefined;

  beforeAll(() => {
    global.ResizeObserver = class ResizeObserver {
      constructor(callback: (entries: unknown[], observer: unknown) => void) {
        resizeCallback = callback;
      }
      observe = jest.fn();
      unobserve = jest.fn();
      disconnect = jest.fn();
    } as unknown as { new (callback: unknown): ResizeObserver; prototype: ResizeObserver; };
  });

  it('creates a canvas element with correct ID and appends to body by default', () => {
    const canvasObj = new Canvas();
    expect(canvasObj.canvas).toBeInstanceOf(HTMLCanvasElement);
    expect(canvasObj.canvas.id).toBe('canvas');
    expect(document.body.contains(canvasObj.canvas)).toBe(true);
    canvasObj.destroy();
  });

  it('appends to parent element when provided', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const canvasObj = new Canvas(container);
    expect(container.contains(canvasObj.canvas)).toBe(true);
    canvasObj.destroy();
  });

  it('resizes to window dimensions when parent has no dimensions', () => {
    const container = document.createElement('div');
    // clientWidth/Height are 0 by default
    const canvasObj = new Canvas(container);
    window.innerWidth = 800;
    window.innerHeight = 600;
    canvasObj.resize();
    expect(canvasObj.canvas.width).toBe(800);
    expect(canvasObj.canvas.height).toBe(600);
    canvasObj.destroy();
  });

  it('resizes to window dimensions by default', () => {
    const canvasObj = new Canvas();
    window.innerWidth = 800;
    window.innerHeight = 600;
    canvasObj.resize();
    expect(canvasObj.canvas.width).toBe(800);
    expect(canvasObj.canvas.height).toBe(600);
    canvasObj.destroy();
  });

  it('resizes to container dimensions when provided', () => {
    const container = document.createElement('div');
    Object.defineProperty(container, 'clientWidth', { value: 500 });
    Object.defineProperty(container, 'clientHeight', { value: 400 });
    
    const canvasObj = new Canvas(container);
    // Initial resize called in constructor
    expect(canvasObj.canvas.width).toBe(500);
    expect(canvasObj.canvas.height).toBe(400);

    // Manual resize with different parent
    const other = document.createElement('div');
    Object.defineProperty(other, 'clientWidth', { value: 600 });
    Object.defineProperty(other, 'clientHeight', { value: 500 });
    canvasObj.resize(other);
    expect(canvasObj.canvas.width).toBe(600);
    expect(canvasObj.canvas.height).toBe(500);
    
    canvasObj.destroy();
  });

  it('triggers onResize callback and handles missing callback', () => {
    const canvasObj = new Canvas();
    canvasObj.onResize = jest.fn();
    canvasObj.resize();
    expect(canvasObj.onResize).toHaveBeenCalled();
    
    // Branch: onResize is undefined
    canvasObj.onResize = undefined;
    expect(() => canvasObj.resize()).not.toThrow();
    
    canvasObj.destroy();
  });

  it('uses ResizeObserver when container is provided and handles fallback', () => {
    // Branch: parentElement is null in constructor
    const orphanCanvas = new Canvas(undefined);
    expect((orphanCanvas as unknown as { _resizeObserver: unknown })._resizeObserver).toBeUndefined();
    orphanCanvas.destroy();

    const container = document.createElement('div');
    const canvasObj = new Canvas(container);
    
    expect(resizeCallback).toBeDefined();
    
    const resizeSpy = jest.spyOn(canvasObj, 'resize');
    if (resizeCallback) {
      // Branch: parentElement is available via closure
      resizeCallback([], {} as ResizeObserver);
      expect(resizeSpy).toHaveBeenCalledWith(container);
    }

    // Branch: this.canvas.parentElement fallback via private method
    const parent = document.createElement('div');
    parent.appendChild(canvasObj.canvas);
    Object.defineProperty(parent, 'clientWidth', { value: 700 });
    Object.defineProperty(parent, 'clientHeight', { value: 600 });
    
    (canvasObj as unknown as { _onResizeObserved: (arg: HTMLElement | undefined) => void })._onResizeObserved(container);
    expect(canvasObj.canvas.width).toBe(700);

    // Branch: parentElement fallback if both arg and parentElement are missing (unlikely but covered)
    parent.removeChild(canvasObj.canvas);
    (canvasObj as unknown as { _onResizeObserved: (arg: HTMLElement | undefined) => void })._onResizeObserved(undefined);
    expect(canvasObj.canvas.width).toBe(window.innerWidth);

    const observer = (canvasObj as unknown as { _resizeObserver: ResizeObserver })._resizeObserver;
    const disconnectSpy = jest.spyOn(observer, 'disconnect');
    
    canvasObj.destroy();
    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('handles destroy without ResizeObserver', () => {
    const canvasObj = new Canvas();
    expect(() => canvasObj.destroy()).not.toThrow();
  });
});
