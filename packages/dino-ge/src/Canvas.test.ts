import Canvas from './Canvas';

describe('Canvas', () => {
  it('initialises with correct properties', () => {
    const canvasWrapper = new Canvas();
    expect(canvasWrapper.canvas.tagName).toBe('CANVAS');
    expect(canvasWrapper.canvas.id).toBe('canvas');
    expect(canvasWrapper.canvas.style.position).toBe('fixed');
  });

  it('resizes to window dimensions', () => {
    const canvasWrapper = new Canvas();
    
    // Mock window dimensions
    const originalWidth = window.innerWidth;
    const originalHeight = window.innerHeight;
    
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 400 });
    
    canvasWrapper.resize();
    
    expect(canvasWrapper.canvas.width).toBe(500);
    expect(canvasWrapper.canvas.height).toBe(400);
    
    // Restore
    window.innerWidth = originalWidth;
    window.innerHeight = originalHeight;
  });
});
