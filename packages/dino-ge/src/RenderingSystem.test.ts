import RenderingSystem from './RenderingSystem';
import GameObject from './GameObject';
import RenderComponent from './RenderComponent';
import VisibilityComponent from './VisibilityComponent';
import Vector2 from './Vector2';
import Engine from './Engine';
import * as Dino from './index';

jest.mock('./Engine', () => ({
  __esModule: true,
  default: {
    camera: {
      getViewportBounds: jest.fn(() => ({ x: 0, y: 0, width: 800, height: 600 })),
      zoom: 1,
      position: { x: 0, y: 0 }
    },
    selectedObject: null,
    debugCollisions: [],
    showPhysicsVectors: true,
    showCollisionLines: true
  }
}));

import BoundsComponent from './BoundsComponent';
import PhysicsComponent from './PhysicsComponent';

class MockGameObject extends GameObject {
  constructor(tag: string, zIndex: number, width: number = 10, height: number = 10) {
    super(tag, zIndex);
    this.bounds = new BoundsComponent(width, height);
  }
}

class MockRenderComponent extends RenderComponent {
  draw = jest.fn();
}

describe('RenderingSystem', () => {
  let mockCtx: CanvasRenderingContext2D;

  beforeEach(() => {
    mockCtx = {
      save: jest.fn(),
      restore: jest.fn(),
      scale: jest.fn(),
      translate: jest.fn(),
      canvas: { width: 800, height: 600 }
    } as unknown as CanvasRenderingContext2D;
    jest.clearAllMocks();
  });

  it('sorts entities by zIndex and draws them', () => {
    const system = new RenderingSystem(mockCtx);
    
    const obj1 = new MockGameObject('top', 10);
    const render1 = new MockRenderComponent();
    obj1.addComponent(render1);
    
    const obj2 = new MockGameObject('bottom', 0);
    const render2 = new MockRenderComponent();
    obj2.addComponent(render2);

    const entities = new Set<GameObject>([obj1, obj2]);
    system.update(entities);

    expect(render2.draw).toHaveBeenCalled();
    expect(render1.draw).toHaveBeenCalled();
    
    // Check call order - render2 (zIndex 0) should be called before render1 (zIndex 10)
    const order1 = (render1.draw as jest.Mock).mock.invocationCallOrder[0];
    const order2 = (render2.draw as jest.Mock).mock.invocationCallOrder[0];
    expect(order2).toBeLessThan(order1);
  });

  it('respects VisibilityComponent', () => {
    const system = new RenderingSystem(mockCtx);
    const obj = new MockGameObject('test', 0);
    const render = new MockRenderComponent();
    const visibility = new VisibilityComponent();
    visibility.visible = false;
    
    obj.addComponent(render);
    obj.addComponent(visibility);

    system.update(new Set([obj]));
    expect(render.draw).not.toHaveBeenCalled();
  });

  it('performs frustum culling', () => {
    const system = new RenderingSystem(mockCtx);
    
    // Object way off screen
    const obj = new MockGameObject('offscreen', 0);
    obj.transform.position = new Vector2(1000, 1000);
    const render = new MockRenderComponent();
    obj.addComponent(render);

    system.update(new Set([obj]));
    expect(render.draw).not.toHaveBeenCalled();
  });

  it('sets a new rendering context', () => {
    const system = new RenderingSystem(mockCtx);
    const newCtx = { 
      save: jest.fn(),
      restore: jest.fn(),
      scale: jest.fn(),
      translate: jest.fn(),
      canvas: { width: 100, height: 100 } 
    } as unknown as CanvasRenderingContext2D;
    system.setContext(newCtx);
    
    const entities = new Set<GameObject>();
    system.update(entities);
    expect(newCtx.save).toHaveBeenCalled();
  });

  it('draws debug overlays including selected object and missing tags', () => {
    const system = new RenderingSystem(mockCtx);
    
    const obj1 = new MockGameObject('test-tag', 0, 50, 50);
    const obj2 = new MockGameObject('', 1, 50, 50); // No tag
    
    (Engine as unknown as { selectedObject: GameObject }).selectedObject = obj1;
    
    const debugCtx = {
      ...mockCtx,
      save: jest.fn(),
      restore: jest.fn(),
      strokeRect: jest.fn(),
      fillText: jest.fn(),
      strokeStyle: '',
      lineWidth: 0,
      font: '',
      fillStyle: ''
    } as unknown as CanvasRenderingContext2D;
    system.setContext(debugCtx);

    system.update(new Set([obj1, obj2]), 0.016, true);

    expect(debugCtx.strokeRect).toHaveBeenCalledTimes(2);
    // Selected object (obj1) check is done via style change
    expect(debugCtx.fillText).toHaveBeenCalledWith('test-tag', 0, -5);
    expect(debugCtx.fillText).toHaveBeenCalledWith('obj', 0, -5); // obj2 default tag
  });

  it('draws physics vectors (velocity and acceleration) in debug mode', () => {
    const system = new RenderingSystem(mockCtx);
    
    // Case 1: Velocity x only, Acceleration y only
    const obj1 = new MockGameObject('physics-obj-1', 0, 50, 50);
    const phys1 = new PhysicsComponent();
    phys1.velocity = new Vector2(100, 0);
    phys1.acceleration = new Vector2(0, 50);
    obj1.addComponent(phys1);

    // Case 2: Velocity y only, Acceleration x only
    const obj2 = new MockGameObject('physics-obj-2', 1, 50, 50);
    const phys2 = new PhysicsComponent();
    phys2.velocity = new Vector2(0, 100);
    phys2.acceleration = new Vector2(50, 0);
    obj2.addComponent(phys2);

    // Case 3: Zero vectors (should not draw)
    const obj3 = new MockGameObject('physics-obj-3', 2, 50, 50);
    const phys3 = new PhysicsComponent();
    obj3.addComponent(phys3);

    const debugCtx = {
      ...mockCtx,
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      strokeRect: jest.fn(),
      fillText: jest.fn(),
      strokeStyle: '',
      lineWidth: 0,
      font: '',
      fillStyle: ''
    } as unknown as CanvasRenderingContext2D;
    system.setContext(debugCtx);

    system.update(new Set([obj1, obj2, obj3]), 0.016, true);

    // Each non-zero vector (4 total: phys1 vel/acc, phys2 vel/acc) should call beginPath/stroke
    expect(debugCtx.beginPath).toHaveBeenCalledTimes(4);
    expect(debugCtx.stroke).toHaveBeenCalledTimes(4);
    
    // Check if moveTo was called at object center
    expect(debugCtx.moveTo).toHaveBeenCalledWith(25, 25);
  });

  it('draws collision debug indicators', () => {
    const system = new RenderingSystem(mockCtx);
    const obj1 = new MockGameObject('obj1', 0);
    const obj2 = new MockGameObject('obj2', 0);
    
    // Mock a collision manifold
    const manifold = {
      obj1,
      obj2,
      normal: new Vector2(1, 0),
      depth: 10
    } as unknown as Dino.CollisionManifold;
    
    (Engine as unknown as { debugCollisions: unknown[] }).debugCollisions = [{
      manifold,
      timestamp: Date.now()
    }];

    const debugCtx = {
      ...mockCtx,
      save: jest.fn(),
      restore: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      fill: jest.fn(),
      arc: jest.fn(),
      strokeRect: jest.fn(),
      fillText: jest.fn(),
      strokeStyle: '',
      lineWidth: 0,
      globalAlpha: 1
    } as unknown as CanvasRenderingContext2D;
    system.setContext(debugCtx);

    system.update(new Set(), 0.016, true);

    // Should draw dot and normal line
    expect(debugCtx.beginPath).toHaveBeenCalled();
    expect(debugCtx.arc).toHaveBeenCalled();
    expect(debugCtx.stroke).toHaveBeenCalled();
    expect(debugCtx.fill).toHaveBeenCalled();
    
    // Verify cleanup
    (Engine as unknown as { debugCollisions: { timestamp: number }[] }).debugCollisions[0].timestamp = Date.now() - 1000; // Over TTL
    system.update(new Set(), 0.016, true);
    expect((Engine as unknown as { debugCollisions: unknown[] }).debugCollisions.length).toBe(0);
  });

  it('respects showPhysicsVectors flag', () => {
    const system = new RenderingSystem(mockCtx);
    const obj = new MockGameObject('physics-obj', 0, 50, 50);
    const phys = new PhysicsComponent();
    phys.velocity = new Vector2(100, 0);
    obj.addComponent(phys);

    const debugCtx = {
      ...mockCtx,
      beginPath: jest.fn(),
      stroke: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      strokeRect: jest.fn(),
      fillText: jest.fn(),
    } as unknown as CanvasRenderingContext2D;
    system.setContext(debugCtx);

    // When true
    (Engine as unknown as { showPhysicsVectors: boolean }).showPhysicsVectors = true;
    system.update(new Set([obj]), 0.016, true);
    expect(debugCtx.beginPath).toHaveBeenCalled();

    // When false
    jest.clearAllMocks();
    (Engine as unknown as { showPhysicsVectors: boolean }).showPhysicsVectors = false;
    system.update(new Set([obj]), 0.016, true);
    expect(debugCtx.beginPath).not.toHaveBeenCalled();
    
    (Engine as unknown as { showPhysicsVectors: boolean }).showPhysicsVectors = true; // reset
  });

  it('respects showCollisionLines flag', () => {
    const system = new RenderingSystem(mockCtx);
    const mockTransform = { worldPosition: new Vector2(0, 0) };
    (Engine as unknown as { debugCollisions: unknown[] }).debugCollisions = [{
      manifold: { 
        obj1: { transform: mockTransform }, 
        obj2: { transform: mockTransform }, 
        normal: new Vector2(1, 0), 
        depth: 10 
      },
      timestamp: Date.now()
    }];

    const debugCtx = {
      ...mockCtx,
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      fill: jest.fn(),
      arc: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
    } as unknown as CanvasRenderingContext2D;
    system.setContext(debugCtx);

    // When true
    (Engine as unknown as { showCollisionLines: boolean }).showCollisionLines = true;
    system.update(new Set(), 0.016, true);
    expect(debugCtx.beginPath).toHaveBeenCalled();

    // When false
    jest.clearAllMocks();
    (Engine as unknown as { showCollisionLines: boolean }).showCollisionLines = false;
    system.update(new Set(), 0.016, true);
    expect(debugCtx.beginPath).not.toHaveBeenCalled();

    (Engine as unknown as { showCollisionLines: boolean }).showCollisionLines = true; // reset
  });

  it('handles objects without bounds during update', () => {
    const system = new RenderingSystem(mockCtx);
    class NoBoundsObject extends GameObject {}
    const obj = new NoBoundsObject('test', 0);
    // Place it inside viewport bounds so it passes frustum culling even with 0 width/height
    obj.transform.position = new Vector2(1, 1);
    
    const render = new MockRenderComponent();
    obj.addComponent(render);

    system.update(new Set([obj]));
    expect(render.draw).toHaveBeenCalled();
  });
});
