import RenderingSystem from './RenderingSystem';
import GameObject from './GameObject';
import RenderComponent from './RenderComponent';
import VisibilityComponent from './VisibilityComponent';
import Vector2 from './Vector2';

jest.mock('./Engine', () => ({
  __esModule: true,
  default: {
    camera: {
      getViewportBounds: jest.fn(() => ({ x: 0, y: 0, width: 800, height: 600 })),
      zoom: 1,
      position: { x: 0, y: 0 }
    }
  }
}));

class MockGameObject extends GameObject {
  constructor(tag: string, zIndex: number, width: number = 10, height: number = 10) {
    super(tag, zIndex);
    this._width = width;
    this._height = height;
  }
  private _width: number;
  private _height: number;
  get width() { return this._width; }
  get height() { return this._height; }
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
    const order1 = render1.draw.mock.invocationCallOrder[0];
    const order2 = render2.draw.mock.invocationCallOrder[0];
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
});
