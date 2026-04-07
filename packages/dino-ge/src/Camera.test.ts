import Camera from './Camera';
import Vector2 from './Vector2';
import GameObject from './GameObject';

class MockGameObject extends GameObject {
  get width() { return 50; }
  get height() { return 50; }
}

describe('Camera', () => {
  it('initialises with default values', () => {
    const camera = new Camera();
    expect(camera.position.x).toBe(0);
    expect(camera.position.y).toBe(0);
    expect(camera.zoom).toBe(1);
  });

  it('follows a target correctly', () => {
    const camera = new Camera();
    const target = new MockGameObject('test', 0);
    target.transform.position = new Vector2(100, 100);
    
    // Viewport 800x600. Target center is (125, 125).
    // Camera pos should be 125 - 400 = -275, 125 - 300 = -175
    camera.follow(target, 800, 600);
    
    expect(camera.position.x).toBe(-275);
    expect(camera.position.y).toBe(-175);
  });

  it('calculates viewport bounds with zoom', () => {
    const camera = new Camera();
    camera.position = new Vector2(100, 100);
    camera.zoom = 2;
    
    const bounds = camera.getViewportBounds(800, 600);
    expect(bounds.x).toBe(100);
    expect(bounds.width).toBe(400); // 800 / 2
    expect(bounds.height).toBe(300); // 600 / 2
  });

  it('resets correctly', () => {
    const camera = new Camera();
    camera.position = new Vector2(500, 500);
    camera.zoom = 5;
    
    camera.reset();
    expect(camera.position.x).toBe(0);
    expect(camera.zoom).toBe(1);
  });
});
