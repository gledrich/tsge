import Canvas from './Canvas';

describe('Canvas', () => {
  let resizeCallback: ((entries: unknown[], observer: ResizeObserver) => void) | undefined;

  beforeAll(() => {
    global.ResizeObserver = class ResizeObserver {
      constructor(callback: (entries: unknown[], observer: ResizeObserver) => void) {
        resizeCallback = callback as unknown as () => void;
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

  it('triggers onResize callback', () => {
    const canvasObj = new Canvas();
    canvasObj.onResize = jest.fn();
    canvasObj.resize();
    expect(canvasObj.onResize).toHaveBeenCalled();
    canvasObj.destroy();
  });

  it('uses ResizeObserver when container is provided', () => {
    const container = document.createElement('div');
    const canvasObj = new Canvas(container);
    
    expect(resizeCallback).toBeDefined();
    
    const resizeSpy = jest.spyOn(canvasObj, 'resize');
    if (resizeCallback) {
      resizeCallback([], {} as ResizeObserver);
    }
    expect(resizeSpy).toHaveBeenCalledWith(container);
    
    const disconnectSpy = jest.spyOn((canvasObj as unknown as { _resizeObserver: ResizeObserver })._resizeObserver, 'disconnect');
    
    canvasObj.destroy();
    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('handles destroy without ResizeObserver', () => {
    const canvasObj = new Canvas();
    expect(() => canvasObj.destroy()).not.toThrow();
  });
});
