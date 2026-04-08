import Canvas from './Canvas';

describe('Canvas', () => {
  it('creates a canvas element with correct ID', () => {
    const canvasObj = new Canvas();
    expect(canvasObj.canvas).toBeInstanceOf(HTMLCanvasElement);
    expect(canvasObj.canvas.id).toBe('canvas');
  });

  it('resizes to window dimensions', () => {
    const canvasObj = new Canvas();
    
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 768 });
    
    canvasObj.resize();
    
    expect(canvasObj.canvas.width).toBe(1024);
    expect(canvasObj.canvas.height).toBe(768);
  });
});
