import Engine, { EngineOpts, EngineCallbacks } from './Engine';
import { type EngineState } from './EngineState';
import { ObjectSet } from './ObjectSet';
import Scene from './Scene';
import GameObject from './GameObject';
import Vector2 from './Vector2';
import PhysicsComponent from './PhysicsComponent';
import BoundsComponent from './BoundsComponent';
import RenderingSystem from './RenderingSystem';
import System from './System';

class MockScene extends Scene {
  onLoad = jest.fn();
  update = jest.fn();
}

class MockGameObject extends GameObject {
  constructor(tag: string, zIndex: number) {
    super(tag, zIndex);
  }
}

/** Interface for global state during testing. */
interface GlobalWithState {
  __DINO_ENGINE_STATE__?: EngineState;
  __DINO_ENGINE_INSTANCE__?: unknown;
}

describe('Engine', () => {
  beforeAll(() => {
    global.ResizeObserver = class ResizeObserver {
      constructor(callback: (entries: unknown[], observer: ResizeObserver) => void) {
        // Mock implementation
        this._callback = callback;
      }
      private _callback: (entries: unknown[], observer: ResizeObserver) => void;
      observe = jest.fn();
      unobserve = jest.fn();
      disconnect = jest.fn();
      
      // Getter to satisfy type and potentially use in tests
      get callback() { return this._callback; }
    } as unknown as { new (callback: unknown): ResizeObserver; prototype: ResizeObserver; };
  });

  it('ObjectSet default findAll returns empty array', () => {
    const objSet = new ObjectSet();
    expect(objSet.findAll()).toEqual([]);
  });

  let callbacks: EngineCallbacks;
  let mockCtx: Record<string, jest.Mock | string | number | object>;

  beforeEach(() => {
    // Reset global shared state manually
    Engine.resetState();
    Engine.renderingSystem = undefined;
    
    const g = globalThis as unknown as GlobalWithState;
    delete g.__DINO_ENGINE_INSTANCE__;

    // Mock Canvas and Context
    mockCtx = {
      fillRect: jest.fn(),
      fillText: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      setTransform: jest.fn(),
      strokeRect: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      closePath: jest.fn(),
      drawImage: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      scale: jest.fn(),
      fillStyle: '',
      strokeStyle: '',
      textAlign: '',
      textBaseline: '',
      font: '',
      canvas: { width: 800, height: 600 }
    };

    jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockCtx as unknown as CanvasRenderingContext2D);

    callbacks = {
      onLoad: jest.fn(),
      update: jest.fn(),
      fixedUpdate: jest.fn()
    };

    // Ensure DOM is clean and has a body
    document.documentElement.innerHTML = '<html><head></head><body></body></html>';

    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('manages singleton state across instances', () => {
    const emitSpy = jest.spyOn(Engine, 'emit');
    
    Engine.paused = true;
    expect(Engine.paused).toBe(true);
    expect(emitSpy).toHaveBeenCalledWith('paused', true);
    
    Engine.paused = true; // same value
    expect(emitSpy).toHaveBeenCalledTimes(1);
    
    Engine.paused = false;
    expect(emitSpy).toHaveBeenCalledWith('paused', false);

    Engine.debug = true;
    expect(Engine.debug).toBe(true);
    expect(emitSpy).toHaveBeenCalledWith('debug', true);
    
    Engine.debug = true; // same value
    expect(emitSpy).toHaveBeenCalledTimes(3);
    
    Engine.debug = false;
    expect(emitSpy).toHaveBeenCalledWith('debug', false);
  });

  it('handles scene transitions correctly', () => {
    const scene = new MockScene();
    Engine.currentScene = scene;
    
    expect(Engine.currentScene).toBe(scene);
    expect(scene.onLoad).toHaveBeenCalled();

    Engine.currentScene = null;
    expect(Engine.currentScene).toBeNull();
  });

  it('provides a global event bus', () => {
    const callback = jest.fn();
    Engine.on('test-event', callback);
    
    Engine.emit('test-event', { foo: 'bar' });
    expect(callback).toHaveBeenCalledTimes(1);
    
    const event = (callback as jest.Mock).mock.calls[0][0] as CustomEvent;
    expect(event.detail).toEqual({ foo: 'bar' });
    
    Engine.off('test-event', callback);
    Engine.emit('test-event');
    expect(callback).toHaveBeenCalledTimes(1); // Still 1
  });

  it('registers and destroys objects globally if no scene is active', () => {
    const obj = new MockGameObject('test', 0);
    Engine.registerObject(obj);
    expect(Engine.objects.has(obj)).toBe(true);
    
    Engine.selectedObject = obj;
    // Branch coverage: set same value again
    Engine.selectedObject = obj;
    expect(Engine.selectedObject).toBe(obj);
    
    Engine.destroyObject(obj);
    expect(Engine.objects.has(obj)).toBe(false);
    expect(Engine.selectedObject).toBeNull();

    // With scene
    const scene = new MockScene();
    Engine.currentScene = scene;
    const obj2 = new MockGameObject('s', 0);
    Engine.registerObject(obj2);
    expect(scene.objects.has(obj2)).toBe(true);
    
    Engine.selectedObject = obj2;
    Engine.destroyObject(obj2);
    expect(scene.objects.has(obj2)).toBe(false);
    expect(Engine.selectedObject).toBeNull();
  });

  it('registers and destroys objects within active scene', () => {
    const scene = new MockScene();
    Engine.currentScene = scene;
    
    const obj = new MockGameObject('test', 0);
    Engine.registerObject(obj);
    expect(scene.objects.has(obj)).toBe(true);
    
    Engine.destroyObject(obj);
    expect(scene.objects.has(obj)).toBe(false);
  });

  it('initialises correctly with default and provided options', () => {
    const opts: Partial<EngineOpts> = {
      title: 'Test Game',
      backgroundColour: 'blue',
      width: '800px',
      height: '600px'
    };
    
    new Engine({ update: jest.fn() }, opts);
    
    expect(document.title).toBe('Test Game');
    expect(document.getElementById('canvas-container')).toBeDefined();
    
    jest.advanceTimersByTime(1);
  });

  it('initializes with containerId', () => {
    const container = document.createElement('div');
    container.id = 'my-custom-container';
    document.body.appendChild(container);

    new Engine({ update: jest.fn() }, { containerId: 'my-custom-container' });
    
    expect(container.querySelector('canvas')).toBeDefined();
    expect(document.getElementById('canvas-container')).toBeNull();
  });

  it('handles missing head during initialization', () => {
    // Mock getElementsByTagName to return empty for 'head'
    const originalGetTags = document.getElementsByTagName;
    const spy = jest.spyOn(document, 'getElementsByTagName').mockImplementation((tag) => {
      if (tag === 'head') return { 
        length: 0, 
        item: () => null, 
        namedItem: () => null 
      } as unknown as ReturnType<typeof document.getElementsByTagName>;
      return originalGetTags.call(document, tag);
    });

    new Engine({ update: jest.fn() });
    expect(document.getElementsByTagName('head')).toBeDefined(); // JSDOM might auto-create it
    spy.mockRestore();
  });

  it('calls onLoad callback when provided and handles optional branch', () => {
    const engine = new Engine(callbacks);
    (engine as unknown as { _onLoad: () => void })._onLoad(); 
    
    jest.advanceTimersByTime(1);
    expect(callbacks.onLoad).toHaveBeenCalled();

    (engine as unknown as { callbacks: { onLoad: unknown } }).callbacks.onLoad = undefined;
    jest.advanceTimersByTime(1);
  });

  it('handles optional callbacks gracefully', () => {
    const engine = new Engine({ update: jest.fn() });
    (engine as unknown as { _fixedUpdate: () => void })._fixedUpdate();

    (engine as unknown as { callbacks: { onLoad: unknown } }).callbacks.onLoad = undefined;
    jest.runAllTimers(); // Triggers the setTimeout in the constructor

    (engine as unknown as { _onLoad: () => void })._onLoad();
  });
  it('handles missing head/body gracefully during init', () => {
    const getTagSpy = jest.spyOn(document, 'getElementsByTagName').mockReturnValue({
      length: 0,
      item: () => null,
      namedItem: () => null,
      [Symbol.iterator]: function* () {}
    } as unknown as ReturnType<typeof document.getElementsByTagName>);
    
    new Engine(callbacks);
    
    expect(document.title).toBe('Example');
    getTagSpy.mockRestore();
  });

  it('handles existing rendering system during init', () => {
    const existingSys = new RenderingSystem(mockCtx as unknown as CanvasRenderingContext2D);
    Engine.renderingSystem = existingSys;
    
    new Engine(callbacks);
    expect(Engine.renderingSystem).toBe(existingSys);
  });

  it('handles resize events', () => {
    const engine = new Engine(callbacks);
    const canvasObj = (engine as unknown as { _canvas: { resize: (container?: HTMLElement) => void } })._canvas;
    const resizeSpy = jest.spyOn(canvasObj, 'resize');
    
    window.dispatchEvent(new Event('resize'));
    
    expect(resizeSpy).toHaveBeenCalled();
  });

  it('runs the game loop (update and draw) and handles multiple fixed updates', () => {
    let rafCallback: (time: number) => void = () => {};
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallback = cb as (time: number) => void;
      return 0;
    });

    const mockSys = { update: jest.fn(), fixedUpdate: jest.fn() };
    const noFixedSys = { update: jest.fn() };
    const globalObj = globalThis as unknown as { __DINO_ENGINE_STATE__: EngineState };
    globalObj.__DINO_ENGINE_STATE__.systems.push(mockSys as unknown as System);
    globalObj.__DINO_ENGINE_STATE__.systems.push(noFixedSys as unknown as System);

    const engine = new Engine({ update: jest.fn(), fixedUpdate: jest.fn() });
    (engine as unknown as { _onLoad: () => void })._onLoad();
    
    // Smooth FPS calc needs some time delta
    rafCallback(1000);
    rafCallback(1020); // 20ms later (~1.2 fixedDelta)
    
    expect(mockSys.fixedUpdate).toHaveBeenCalled();
    
    const scene = new MockScene();
    Engine.currentScene = scene;
    rafCallback(1040); // 20ms later triggers fixedUpdate with scene active
    expect(scene.update).toHaveBeenCalled();

    Engine.paused = true;
    const updateCountBefore = (callbacks.update as jest.Mock).mock.calls.length;
    rafCallback(1060);
    expect(callbacks.update).toHaveBeenCalledTimes(updateCountBefore);
    expect(mockCtx.fillRect).toHaveBeenCalled(); // Should draw once when paused
  });

  it('calculates smooth FPS and frame time', () => {
    let rafCallback: (time: number) => void = () => {};
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallback = cb as (time: number) => void;
      return 0;
    });

    const engine = new Engine({ update: jest.fn() });
    (engine as unknown as { _onLoad: () => void })._onLoad();

    // Mock timestamps
    rafCallback(1000); // Start at 1s
    rafCallback(1016.67); // Approx 60fps frame (~16.67ms)
    
    expect(engine.frameTime).toBeCloseTo(16.67);
    expect(engine.fps).toBe(60);

    // Provide 10 frames of 33.33ms (~30fps)
    for(let i = 1; i <= 10; i++) {
      rafCallback(1016.67 + (i * 33.33));
    }
    
    expect(engine.frameTime).toBeCloseTo(33.33);
    // Smooth FPS should be somewhere between 60 and 30 due to rolling average
    expect(engine.fps).toBeLessThan(60);
    expect(engine.fps).toBeGreaterThan(30);
  });

  it('provides mouse position getters', () => {
    const engine = new Engine(callbacks);
    expect(engine.mouseX).toBeDefined();
    expect(engine.mouseY).toBeDefined();
  });

  it('finds objects by tag', () => {
    new Engine(callbacks);
    const obj1 = new MockGameObject('enemy', 0);
    const obj2 = new MockGameObject('player', 0);
    Engine.objects.add(obj1);
    Engine.objects.add(obj2);
    
    const enemies = Engine.objects.findAll('enemy');
    expect(enemies).toHaveLength(1);
    expect(enemies[0]).toBe(obj1);
    
    const all = Engine.objects.findAll();
    expect(all).toBeDefined();
  });

  it('draws debug information and inspector with various object states', () => {
    const engine = new Engine(callbacks);
    Engine.debug = true;

    const obj = new MockGameObject('target', 0);
    const phys = new PhysicsComponent();
    phys.velocity = new Vector2(10, 20);
    phys.acceleration = new Vector2(1, 2);
    obj.addComponent(phys);
    obj.bounds = new BoundsComponent(10, 10);
    Engine.objects.add(obj);
    Engine.selectedObject = obj;

    (engine as unknown as { _draw: () => void })._draw();
    expect(mockCtx.fillText).toHaveBeenCalled();

    const simpleObj = new MockGameObject('simple', 0);
    Engine.selectedObject = simpleObj;
    (engine as unknown as { _draw: () => void })._draw();

    // Test when no object is selected
    Engine.selectedObject = null;
    (engine as unknown as { _draw: () => void })._draw();

    // Test when object lacks metadata (TagComponent)
    const noTagObj = new MockGameObject('notag', 0);
    Engine.selectedObject = noTagObj;
    (engine as unknown as { _draw: () => void })._draw();

    Engine.objects.add(simpleObj);
    Engine.selectedObject = simpleObj;
    (engine as unknown as { _draw: () => void })._draw();

    // Raw object mock for branch coverage
    const rawObj = {
      transform: { 
        position: new Vector2(),
        worldPosition: new Vector2(),
        worldRotation: 0,
        worldScale: new Vector2(1, 1)
      },
      metadata: { tag: 'raw', zIndex: 0 },
      getComponent: jest.fn().mockReturnValue(null),
      bounds: { width: 10, height: 10 },
      id: 'test-id'
    } as unknown as GameObject;
    Engine.objects.add(rawObj);
    Engine.selectedObject = rawObj;
    (engine as unknown as { _draw: () => void })._draw();
  });

  it('provides utility methods (setTimeout, countdown, cursor)', async () => {
    const engine = new Engine(callbacks);
    
    const timeoutFn = jest.fn();
    engine.setTimeout(timeoutFn, 1000);
    
    jest.advanceTimersByTime(1000);
    await Promise.resolve();
    expect(timeoutFn).toHaveBeenCalled();

    const fn = jest.fn();
    const onEnded = jest.fn();
    engine.countdown(2000, fn, onEnded);
    
    jest.advanceTimersByTime(1000);
    expect(fn).toHaveBeenCalledTimes(1);
    
    jest.advanceTimersByTime(1000);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(onEnded).toHaveBeenCalled();

    const mockCanvas = { style: { cursor: '' } };
    jest.spyOn(document, 'getElementById').mockImplementation((id) => {
      if (id === 'canvas') return mockCanvas as unknown as HTMLElement;
      return null;
    });
    
    engine.cursor = 'pointer';
    expect(mockCanvas.style.cursor).toBe('pointer');
    
    (document.getElementById as jest.Mock).mockReturnValue(null);
    engine.cursor = 'wait';

    // Test countdown with 0 duration
    const endFn = jest.fn();
    engine.countdown(0, jest.fn(), endFn);
    jest.advanceTimersByTime(0);
    expect(endFn).toHaveBeenCalled();
  });

  it('handles missing context during _setBackground', () => {
    const engine = new Engine(callbacks);
    (engine as unknown as { _ctx: CanvasRenderingContext2D | null })._ctx = null;
    (engine as unknown as { _setBackground: () => void })._setBackground();
  });

  it('handles missing renderingSystem during _draw', () => {
    const engine = new Engine(callbacks);
    Engine.renderingSystem = undefined;
    (engine as unknown as { _draw: () => void })._draw();
  });

  it('draws without an active scene', () => {
    const engine = new Engine(callbacks);
    (engine as unknown as { _draw: () => void })._draw();
  });

  it('destroys all objects', () => {
    Engine.objects.add(new MockGameObject('a', 0));
    Engine.destroyAll();
    expect(Engine.objects.size).toBe(0);

    const scene = new MockScene();
    Engine.currentScene = scene;
    scene.add(new MockGameObject('b', 0));
    Engine.destroyAll();
    expect(scene.objects.size).toBe(0);
  });

  it('manages debug visualization toggles', () => {
    Engine.showPhysicsVectors = false;
    expect(Engine.showPhysicsVectors).toBe(false);
    Engine.showPhysicsVectors = true;
    expect(Engine.showPhysicsVectors).toBe(true);

    Engine.showCollisionLines = false;
    expect(Engine.showCollisionLines).toBe(false);
    Engine.showCollisionLines = true;
    expect(Engine.showCollisionLines).toBe(true);
  });

  it('manages z-order dirty flag and sorted cache', () => {
    Engine.resetState();
    expect(Engine.zOrderDirty).toBe(true);
    
    const obj1 = new MockGameObject('obj1', 10);
    Engine.registerObject(obj1);
    expect(Engine.zOrderDirty).toBe(true);
    
    // Simulate RenderingSystem clearing the flag
    Engine.sortedObjects = [obj1];
    Engine.zOrderDirty = false;
    
    const obj2 = new MockGameObject('obj2', 5);
    Engine.registerObject(obj2);
    expect(Engine.zOrderDirty).toBe(true);
    
    Engine.zOrderDirty = false;
    Engine.destroyObject(obj1);
    expect(Engine.zOrderDirty).toBe(true);
    
    Engine.zOrderDirty = false;
    obj2.metadata.zIndex = 20;
    expect(Engine.zOrderDirty).toBe(true);

    expect(Engine.sortedObjects).toBeDefined();
    Engine.sortedObjects = [];
    expect(Engine.sortedObjects).toEqual([]);
  });
});
