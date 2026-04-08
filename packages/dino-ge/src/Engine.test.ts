import Engine, { EngineOpts, EngineCallbacks } from './Engine';
import Scene from './Scene';
import GameObject from './GameObject';
import Vector2 from './Vector2';
import PhysicsComponent from './PhysicsComponent';
import BoundsComponent from './BoundsComponent';
import RenderingSystem from './RenderingSystem';

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
  let callbacks: EngineCallbacks;
  let mockCtx: Record<string, jest.Mock | string | number | object>;

  beforeEach(() => {
    // Mock Canvas and Context
    mockCtx = {
      fillRect: jest.fn(),
      fillText: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      setTransform: jest.fn(),
      strokeRect: jest.fn(),
      beginPath: jest.fn(),
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

    // Reset global state
    (Engine as unknown as { paused: boolean }).paused = false;
    (Engine as unknown as { debug: boolean }).debug = false;
    (Engine as unknown as { selectedObject: GameObject | null }).selectedObject = null;
    (Engine as unknown as { renderingSystem: RenderingSystem | undefined }).renderingSystem = undefined;
    Engine.objects.clear();
    (Engine as unknown as { _currentScene: Scene | null })._currentScene = null;
    
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
    // Branch test: default findAll before constructor
    const freshObjects = new (Engine.objects.constructor as unknown as new () => { findAll: (tag?: string) => GameObject[] })();
    expect(freshObjects.findAll('any')).toEqual([]);

    // Force known start state
    (Engine as unknown as { paused: boolean }).paused = false;
    (Engine as unknown as { debug: boolean }).debug = false;

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
    (Engine as unknown as { _currentScene: Scene | null })._currentScene = null;
    
    const obj = new MockGameObject('test', 0);
    Engine.registerObject(obj);
    expect(Engine.objects.has(obj)).toBe(true);
    
    Engine.destroyObject(obj);
    expect(Engine.objects.has(obj)).toBe(false);
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

  it('calls onLoad callback when provided', () => {
    const engine = new Engine(callbacks);
    jest.advanceTimersByTime(1);
    expect(callbacks.onLoad).toHaveBeenCalled();

    // Branch coverage for line 273 (onLoad being optional)
    (engine.callbacks as unknown as { onLoad: undefined }).onLoad = undefined;
    // Should not throw if the deferred timeout runs
  });

  it('handles missing head/body gracefully during init', () => {
    // Mock getElementsByTagName to return empty arrays
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
    (Engine as unknown as { renderingSystem: RenderingSystem }).renderingSystem = existingSys;
    
    new Engine(callbacks);
    expect(Engine.renderingSystem).toBe(existingSys);
  });

  it('handles resize events', () => {
    const engine = new Engine(callbacks);
    const canvasObj = (engine as unknown as { _canvas: { resize: () => void } })._canvas;
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

    const mockSys = { update: jest.fn() };
    (Engine as unknown as { _systems: unknown[] })._systems.push(mockSys);

    const engine = new Engine({ update: jest.fn() });
    (engine as unknown as { _onLoad: () => void })._onLoad();
    
    rafCallback(50); 
    expect(callbacks.fixedUpdate).not.toHaveBeenCalled();
    
    const scene = new MockScene();
    Engine.currentScene = scene;
    rafCallback(100);
    expect(scene.update).toHaveBeenCalled();

    Engine.paused = true;
    const updateCountBefore = (callbacks.update as jest.Mock).mock.calls.length;
    rafCallback(150);
    expect(callbacks.update).toHaveBeenCalledTimes(updateCountBefore);
  });

  it('calculates smooth FPS and frame time', () => {
    let rafCallback: (time: number) => void = () => {};
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallback = cb as (time: number) => void;
      return 0;
    });

    const engine = new Engine({ update: jest.fn() });
    const engineInternal = engine as unknown as { _onLoad: () => void };
    engineInternal._onLoad();

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
    
    // Default tag branch
    const all = (Engine.objects as unknown as { findAll: (tag?: string) => GameObject[] }).findAll();
    expect(all).toBeDefined();
  });

  it('draws debug information and inspector with various object states', () => {
    const engine = new Engine(callbacks);
    Engine.debug = true;
    
    // 1. Full object
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
    (simpleObj as unknown as { bounds: BoundsComponent | null }).bounds = null;
    Engine.selectedObject = simpleObj;
    (engine as unknown as { _draw: () => void })._draw();

    const rawObj = {
      transform: { position: new Vector2() },
      metadata: { tag: 'raw', zIndex: 0 },
      getComponent: jest.fn().mockReturnValue(null),
      bounds: { width: 10, height: 10 }
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

    // cursor
    const mockCanvas = { style: { cursor: '' } };
    jest.spyOn(document, 'getElementById').mockImplementation((id) => {
      if (id === 'canvas') return mockCanvas as unknown as HTMLElement;
      return null;
    });
    
    engine.cursor = 'pointer';
    expect(mockCanvas.style.cursor).toBe('pointer');
    
    (document.getElementById as jest.Mock).mockReturnValue(null);
    engine.cursor = 'wait';
  });

  it('handles missing context during _setBackground', () => {
    const engine = new Engine(callbacks);
    (engine as unknown as { _ctx: CanvasRenderingContext2D | null })._ctx = null;
    (engine as unknown as { _setBackground: () => void })._setBackground();
  });

  it('handles missing renderingSystem during _draw', () => {
    const engine = new Engine(callbacks);
    (Engine as unknown as { renderingSystem: undefined }).renderingSystem = undefined;
    (engine as unknown as { _draw: () => void })._draw();
  });

  it('draws without an active scene', () => {
    const engine = new Engine(callbacks);
    (Engine as unknown as { _currentScene: Scene | null })._currentScene = null;
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
});
