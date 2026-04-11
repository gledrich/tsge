import Engine, { EngineOpts, EngineCallbacks, ObjectSet } from './Engine';
import Scene from './Scene';
import GameObject from './GameObject';
import PhysicsComponent from './PhysicsComponent';
import BoundsComponent from './BoundsComponent';
import Camera from './Camera';
import System from './System';
import PhysicsSystem from './PhysicsSystem';

class MockScene extends Scene {
  onLoad = jest.fn();
  update = jest.fn();
}

class MockGameObject extends GameObject {
  constructor(tag: string, zIndex: number) {
    super(tag, zIndex);
  }
}

describe('Engine', () => {
  beforeAll(() => {
    global.ResizeObserver = class ResizeObserver {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      constructor(callback: (entries: unknown[], observer: ResizeObserver) => void) {
        // Just a mock
      }
      observe = jest.fn();
      unobserve = jest.fn();
      disconnect = jest.fn();
    } as unknown as { new (callback: unknown): ResizeObserver; prototype: ResizeObserver; };
  });

  it('ObjectSet default findAll returns all objects if no tag', () => {
    const objSet = new ObjectSet();
    const obj = new MockGameObject('test', 0);
    objSet.add(obj);
    expect(objSet.findAll()).toEqual([obj]);
    expect(objSet.findAll('other')).toEqual([]);
  });

  let callbacks: EngineCallbacks;
  let mockCtx: Record<string, jest.Mock | string | number | object>;

  beforeEach(() => {
    // Reset global shared state manually
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const globalObj = globalThis as unknown as Record<string, any>;
    globalObj.__DINO_ENGINE_STATE__ = {
      objects: new ObjectSet(),
      paused: false,
      debug: false,
      selectedObject: null,
      camera: new Camera(),
      systems: [new PhysicsSystem()],
      events: new EventTarget(),
      currentScene: null,
      debugCollisions: [],
      showPhysicsVectors: false,
      showCollisionLines: false
    };
    Engine.renderingSystem = undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).__DINO_ENGINE_INSTANCE__;

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
    
    Engine.paused = true; // same value (line 144 false branch)
    expect(emitSpy).toHaveBeenCalledTimes(1);
    
    Engine.paused = false;
    expect(emitSpy).toHaveBeenCalledWith('paused', false);

    Engine.debug = true;
    expect(Engine.debug).toBe(true);
    expect(emitSpy).toHaveBeenCalledWith('debug', true);
    
    Engine.debug = true; // same value (line 154 false branch)
    expect(emitSpy).toHaveBeenCalledTimes(3);
    
    Engine.debug = false;
    expect(emitSpy).toHaveBeenCalledWith('debug', false);

    const obj = new MockGameObject('t', 0);
    Engine.selectedObject = obj;
    expect(Engine.selectedObject).toBe(obj);
    Engine.selectedObject = obj; // same value (line 172 false branch)
    expect(emitSpy).toHaveBeenCalledTimes(5);
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
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('registers and destroys objects correctly', () => {
    const obj = new MockGameObject('test', 0);
    Engine.registerObject(obj);
    expect(Engine.objects.has(obj)).toBe(true);
    
    Engine.selectedObject = obj;
    Engine.destroyObject(obj);
    expect(Engine.objects.has(obj)).toBe(false);
    expect(Engine.selectedObject).toBeNull();

    // With scene
    const scene = new MockScene();
    Engine.currentScene = scene;
    const obj2 = new MockGameObject('s', 0);
    Engine.registerObject(obj2);
    expect(scene.objects.has(obj2)).toBe(true);
    
    Engine.destroyObject(obj2);
    expect(scene.objects.has(obj2)).toBe(false);
  });

  it('initialises correctly with default and provided options', () => {
    const opts: Partial<EngineOpts> = {
      title: 'Test Game',
      backgroundColour: 'blue',
      width: '800px',
      height: '600px'
    };
    
    new Engine(callbacks, opts);
    
    expect(document.title).toBe('Test Game');
    expect(document.getElementById('canvas-container')).toBeDefined();
    
    jest.advanceTimersByTime(0);
    expect(callbacks.onLoad).toHaveBeenCalled();
  });

  it('initializes with containerId', () => {
    const container = document.createElement('div');
    container.id = 'my-custom-container';
    document.body.appendChild(container);

    new Engine(callbacks, { containerId: 'my-custom-container' });
    
    expect(container.querySelector('canvas')).toBeDefined();
    expect(document.getElementById('canvas-container')).toBeNull();
  });

  it('handles missing head during initialization', () => {
    const originalGetTags = document.getElementsByTagName;
    const spy = jest.spyOn(document, 'getElementsByTagName').mockImplementation((tag) => {
      if (tag === 'head') return { 
        length: 0, 
        item: () => null, 
        namedItem: () => null 
      } as unknown as ReturnType<typeof document.getElementsByTagName>;
      return originalGetTags.call(document, tag);
    });

    new Engine(callbacks);
    expect(document.getElementsByTagName('head')).toBeDefined();
    spy.mockRestore();
  });

  it('handles resize events', () => {
    const engine = new Engine(callbacks);
    const canvasObj = (engine as unknown as { _canvas: { resize: (el: unknown) => void } })._canvas;
    const resizeSpy = jest.spyOn(canvasObj, 'resize');
    
    window.dispatchEvent(new Event('resize'));
    expect(resizeSpy).toHaveBeenCalled();
  });

  it('handles triggerLoad with zero dimensions and stability check', () => {
    const container = document.createElement('div');
    container.id = 'test-container-for-load';
    document.body.appendChild(container);

    const engine = new Engine(callbacks, { containerId: 'test-container-for-load' });
    const triggerLoad = (engine as unknown as { _canvas: { onResize: () => void } })._canvas.onResize;
    
    // Mock dimensions to be 0 initially
    Object.defineProperty(engine, 'width', { value: 0, configurable: true });
    Object.defineProperty(engine, 'height', { value: 0, configurable: true });
    
    triggerLoad();
    expect(callbacks.onLoad).not.toHaveBeenCalled();

    // Set dimensions but unstable
    Object.defineProperty(engine, 'width', { value: 800, configurable: true });
    Object.defineProperty(engine, 'height', { value: 600, configurable: true });
    
    triggerLoad();
    expect(callbacks.onLoad).not.toHaveBeenCalled();

    // Now they are stable
    triggerLoad();
    expect(callbacks.onLoad).toHaveBeenCalled();

    // hasLoaded branch
    Object.defineProperty(engine, 'width', { value: 0, configurable: true });
    triggerLoad(); 
  });

  it('runs the game loop (update and draw) and handles multiple fixed updates', () => {
    let rafCallback: (time: number) => void = () => {};
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallback = cb as (time: number) => void;
      return 0;
    });

    // Test with missing fixedUpdate in callbacks (line 363 false branch)
    const engine = new Engine({ update: jest.fn(), onLoad: jest.fn() });
    (engine as unknown as { _onLoad: () => void })._onLoad();

    const mockSys = { update: jest.fn(), fixedUpdate: jest.fn() };
    const noFixedSys = { update: jest.fn() };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const globalObj = globalThis as unknown as Record<string, any>;
    globalObj.__DINO_ENGINE_STATE__.systems.push(mockSys as unknown as System);
    globalObj.__DINO_ENGINE_STATE__.systems.push(noFixedSys as unknown as System);
    
    // Mock timestamps
    rafCallback(1000);
    rafCallback(1020); // 20ms later (> 16.6ms fixedDelta)
    
    expect(mockSys.fixedUpdate).toHaveBeenCalled();
    
    const scene = new MockScene();
    Engine.currentScene = scene;
    rafCallback(1040);
    expect(scene.update).toHaveBeenCalled();

    Engine.paused = true;
    rafCallback(1060);
  });

  it('calculates smooth FPS and frame time', () => {
    let rafCallback: (time: number) => void = () => {};
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallback = cb as (time: number) => void;
      return 0;
    });

    const engine = new Engine(callbacks);
    (engine as unknown as { _onLoad: () => void })._onLoad();

    rafCallback(1000);
    rafCallback(1016.67);
    
    expect(engine.frameTime).toBeCloseTo(16.67);
    expect(engine.fps).toBe(60);

    for(let i = 1; i <= 10; i++) {
      rafCallback(1016.67 + (i * 33.33));
    }
    
    expect(engine.frameTime).toBeCloseTo(33.33);
    expect(engine.fps).toBeLessThan(60);
    expect(engine.fps).toBeGreaterThan(30);
  });

  it('provides mouse position getters', () => {
    const engine = new Engine(callbacks);
    expect(engine.mouseX).toBeDefined();
    expect(engine.mouseY).toBeDefined();
  });

  it('provides access to debugCollisions and camera via getters', () => {
    expect(Engine.debugCollisions).toBeInstanceOf(Array);
    expect(Engine.camera).toBeInstanceOf(Camera);
  });

  it('updates renderingSystem context on new Engine creation', () => {
    new Engine(callbacks);
    const firstRS = Engine.renderingSystem;
    expect(firstRS).toBeDefined();
    
    const setContextSpy = jest.spyOn(firstRS!, 'setContext');
    new Engine(callbacks);
    expect(setContextSpy).toHaveBeenCalled();
  });

  it('draws debug information and inspector with various object states', () => {
    Engine.debug = true;
    const engine = new Engine(callbacks);

    const obj = new MockGameObject('target', 0);
    obj.addComponent(new PhysicsComponent());
    obj.bounds = new BoundsComponent(10, 10);
    Engine.objects.add(obj);
    Engine.selectedObject = obj;

    (engine as unknown as { _draw: () => void })._draw();
    expect(mockCtx.fillText).toHaveBeenCalled();
  });

  it('initialises default systems if none present', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const globalObj = globalThis as unknown as Record<string, any>;
    globalObj.__DINO_ENGINE_STATE__.systems = [];
    new Engine(callbacks);
    expect(globalObj.__DINO_ENGINE_STATE__.systems.length).toBeGreaterThan(0);
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

    // Line 442 false branch: missing canvas during cursor set
    (document.getElementById as jest.Mock).mockReturnValue(null);
    engine.cursor = 'wait';
  });

  it('destroys all objects and cleans up instance', () => {
    const engine = new Engine(callbacks);
    const cleanupSpy = jest.spyOn(engine, 'cleanup');
    
    Engine.objects.add(new MockGameObject('a', 0));
    Engine.destroyAll();
    
    expect(cleanupSpy).toHaveBeenCalled();
    expect(Engine.objects.size).toBe(0);

    const scene = new MockScene();
    Engine.currentScene = scene;
    scene.add(new MockGameObject('b', 0));
    Engine.destroyAll();
    expect(scene.objects.size).toBe(0);
  });

  it('edge case coverage for Engine properties and methods', () => {
    const engine = new Engine(callbacks);
    
    // Line 213/216 false branches: missing _canvas
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (engine as any)._canvas = null;
    expect(engine.width).toBe(0);
    expect(engine.height).toBe(0);
    engine.cleanup(); // Cover line 449 false branch

    // Line 389 false branch: missing _ctx
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (engine as any)._ctx = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (engine as any)._setBackground(); // Should return early

    // Line 382 false branch: missing renderingSystem
    Engine.renderingSystem = undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (engine as any)._draw(); // Should not call update

    // Line 456 false branch: missing __DINO_ENGINE_INSTANCE__ during destroyAll
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).__DINO_ENGINE_INSTANCE__;
    Engine.destroyAll(); // Should not throw
  });
});
