import RenderingSystem from './RenderingSystem';
import GameObject from './GameObject';
import ShapeComponent from './ShapeComponent';
import Vector2 from './Vector2';
import BoundsComponent from './BoundsComponent';
import Engine from './Engine';

class MockGameObject extends GameObject {}

describe('Hierarchy Rendering', () => {
  let mockCtx: Record<string, jest.Mock | string | number | { width: number, height: number }>;

  beforeEach(() => {
    Engine.resetState();
    Engine.camera.zoom = 1;
    Engine.camera.position = new Vector2(0, 0);
    
    mockCtx = {
      save: jest.fn(),
      restore: jest.fn(),
      scale: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      fillRect: jest.fn(),
      beginPath: jest.fn(),
      stroke: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      closePath: jest.fn(),
      canvas: { width: 800, height: 600 },
      fillStyle: ''
    };
    jest.clearAllMocks();
  });

  it('renders child object at correct world position', () => {
    const system = new RenderingSystem(mockCtx as unknown as CanvasRenderingContext2D);

    const parent = new MockGameObject('parent', 0);
    parent.transform.position = new Vector2(100, 100);
    parent.bounds = new BoundsComponent(50, 50);

    const child = new MockGameObject('child', 1);
    child.transform.position = new Vector2(50, 50); // Relative to parent
    child.bounds = new BoundsComponent(20, 20);
    
    const shape = new ShapeComponent('rect', 'red', 20, 20);
    child.addComponent(shape);

    parent.transform.addChild(child.transform);

    system.update(new Set([parent, child]));

    // Check if child's shape was drawn. 
    // In new implementation, it should translate to world position (150, 150)
    expect(mockCtx.translate).toHaveBeenCalledWith(150, 150); // This is what we WANT
  });

  it('frustum culls child based on world position', () => {
    const system = new RenderingSystem(mockCtx as unknown as CanvasRenderingContext2D);

    const parent = new MockGameObject('parent', 0);
    parent.transform.position = new Vector2(0, 0);
    parent.bounds = new BoundsComponent(50, 50);

    const child = new MockGameObject('child', 1);
    child.transform.position = new Vector2(1000, 1000); // Offscreen relative to parent
    child.bounds = new BoundsComponent(20, 20);
    
    const shape = new ShapeComponent('rect', 'red', 20, 20);
    shape.draw = jest.fn(); // Mock draw to verify if it's called
    child.addComponent(shape);

    parent.transform.addChild(child.transform);

    // parent at (1000, 1000) and child at (-1000, -1000)
    // World pos is (0, 0) - should be VISIBLE.

    parent.transform.position = new Vector2(1000, 1000);
    child.transform.position = new Vector2(-1000, -1000);

    system.update(new Set([parent, child]));
    expect(shape.draw).toHaveBeenCalled(); // Fixed: should have been called!
  });
});
