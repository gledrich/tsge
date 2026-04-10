import Input from './Input';
import Vector2 from './Vector2';
import Engine from './Engine';
import GameObject from './GameObject';
import SpriteComponent from './SpriteComponent';

jest.mock('./Engine', () => ({
  __esModule: true,
  default: {
    camera: {
      zoom: 1,
      position: { x: 0, y: 0 },
      getViewportBounds: jest.fn()
    },
    paused: false,
    debug: false,
    objects: new Set(),
    currentScene: null,
    selectedObject: null
  }
}));

describe('Input', () => {
  let capturedListeners: Record<string, ((event: unknown) => void)> = {};

  beforeEach(() => {
    // Reset private static state
    (Input as unknown as { keys: Set<string> }).keys.clear();
    (Input as unknown as { clickListeners: Set<unknown> }).clickListeners.clear();
    (Input as unknown as { isInitialized: boolean }).isInitialized = false;
    (Input as unknown as { mousePosition: Vector2 }).mousePosition = new Vector2(0, 0);
    (Input as unknown as { isDragging: boolean }).isDragging = false;
    (Input as unknown as { isResizing: boolean }).isResizing = false;
    jest.clearAllMocks();
    
    capturedListeners = {};
    jest.spyOn(document, 'addEventListener').mockImplementation((type, listener) => {
      capturedListeners[type] = listener as unknown as (event: unknown) => void;
    });

    // Reset Engine mock properties
    (Engine as unknown as { debug: boolean }).debug = false;
    (Engine as unknown as { paused: boolean }).paused = false;
    (Engine as unknown as { objects: Set<unknown> }).objects = new Set();
    (Engine as unknown as { currentScene: unknown }).currentScene = null;
    (Engine as unknown as { selectedObject: unknown }).selectedObject = null;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('tracks key states correctly', () => {
    Input.init();
    capturedListeners['keydown'](new KeyboardEvent('keydown', { key: 'w' }));
    expect(Input.isKeyDown('w')).toBe(true);
    capturedListeners['keyup']({ key: 'w' } as unknown as KeyboardEvent);
    expect(Input.isKeyDown('w')).toBe(false);
  });

  it('manages global click listeners', () => {
    const callback = jest.fn();
    Input.addClickListener(callback);
    Input.init();
    const canvas = document.createElement('canvas');
    capturedListeners['mousedown']({ target: canvas, button: 0 } as unknown as MouseEvent);
    expect(callback).toHaveBeenCalled();
    Input.removeClickListener(callback);
    capturedListeners['mousedown']({ target: canvas, button: 0 } as unknown as MouseEvent);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('handles mouse movement and position getters', () => {
    Input.init();
    capturedListeners['mousemove']({ clientX: 100, clientY: 200 } as unknown as MouseEvent);
    expect(Input.mouseX).toBe(100);
    expect(Input.mouseY).toBe(200);
  });

  it('prevents multiple initialisations', () => {
    Input.init();
    const firstCount = Object.keys(capturedListeners).length;
    Input.init();
    expect(Object.keys(capturedListeners).length).toBe(firstCount);
  });

  it('handles debug object selection on mousedown with sorting', () => {
    (Engine as unknown as { debug: boolean }).debug = true;
    const objBottom = {
      transform: { position: { x: 10, y: 10 }, worldPosition: { x: 10, y: 10 } },
      bounds: { width: 50, height: 50 },
      metadata: { zIndex: 0, tag: 'bottom' }
    } as unknown as GameObject;
    const objTop = {
      transform: { position: { x: 10, y: 10 }, worldPosition: { x: 10, y: 10 } },
      bounds: { width: 50, height: 50 },
      metadata: { zIndex: 10, tag: 'top' }
    } as unknown as GameObject;
    (Engine as unknown as { objects: Set<unknown> }).objects = new Set([objBottom, objTop]);
    
    Input.init();
    (Input as unknown as { mousePosition: Vector2 }).mousePosition = new Vector2(20, 20);
    capturedListeners['mousedown']({ target: document.createElement('canvas'), button: 0 } as unknown as MouseEvent);
    expect(Engine.selectedObject).toBe(objTop);

    // Reverse sorting test
    (objBottom.metadata as { zIndex: number }).zIndex = 20;
    capturedListeners['mousedown']({ target: document.createElement('canvas'), button: 0 } as unknown as MouseEvent);
    expect(Engine.selectedObject).toBe(objBottom);

    // Equality sorting test
    (objTop.metadata as { zIndex: number }).zIndex = 20;
    capturedListeners['mousedown']({ target: document.createElement('canvas'), button: 0 } as unknown as MouseEvent);
    expect(Engine.selectedObject).toBeDefined();
  });

  it('handles mousedown with an object having no bounds', () => {
    (Engine as unknown as { debug: boolean }).debug = true;
    const obj = {
      transform: { position: { x: 10, y: 10 }, worldPosition: { x: 10, y: 10 } },
      metadata: { zIndex: 0, tag: 'no-bounds' }
    } as unknown as GameObject;
    (Engine as unknown as { objects: Set<unknown> }).objects = new Set([obj]);
    Input.init();
    (Input as unknown as { mousePosition: Vector2 }).mousePosition = new Vector2(15, 15);
    capturedListeners['mousedown']({ target: document.createElement('canvas'), button: 0 } as unknown as MouseEvent);
    expect(Engine.selectedObject).toBeNull();
  });

  it('handles resize handle detection and interaction', () => {
    (Engine as unknown as { debug: boolean }).debug = true;
    const obj = {
      transform: { 
        position: new Vector2(10, 10), 
        worldPosition: new Vector2(10, 10),
        scale: new Vector2(1, 1)
      },
      bounds: { width: 100, height: 100 },
      metadata: { zIndex: 0, tag: 'resize-me' },
      getComponent: jest.fn(() => null)
    } as unknown as GameObject;
    
    (Engine as unknown as { selectedObject: unknown }).selectedObject = obj;
    (Engine as unknown as { objects: Set<unknown> }).objects = new Set([obj]);
    
    const mockCanvas = { style: { cursor: '' } };
    jest.spyOn(document, 'getElementById').mockReturnValue(mockCanvas as unknown as HTMLElement);

    Input.init();
    
    // Hover handle (at 110, 110)
    (Input as unknown as { mousePosition: Vector2 }).mousePosition = new Vector2(110, 110);
    capturedListeners['mousemove']({ clientX: 110, clientY: 110 } as unknown as MouseEvent);
    expect(mockCanvas.style.cursor).toBe('se-resize');

    // Click handle
    capturedListeners['mousedown']({ target: document.createElement('canvas'), button: 0 } as unknown as MouseEvent);
    expect((Input as unknown as { isResizing: boolean }).isResizing).toBe(true);

    // Resize to 200x300 (mouse at 210, 310)
    (Input as unknown as { mousePosition: Vector2 }).mousePosition = new Vector2(210, 310);
    capturedListeners['mousemove']({ clientX: 210, clientY: 310 } as unknown as MouseEvent);
    expect(obj.bounds!.width).toBe(200);
    expect(obj.bounds!.height).toBe(300);

    // Mouseup to reset state before next click
    capturedListeners['mouseup']({ button: 0 } as unknown as MouseEvent);

    // Click NEAR handle but not ON it (e.g. at 110, 100)
    // Range is 106-114 for x, 106-114 for y.
    (Input as unknown as { mousePosition: Vector2 }).mousePosition = new Vector2(110, 100);
    capturedListeners['mousedown']({ target: document.createElement('canvas'), button: 0 } as unknown as MouseEvent);
    expect((Input as unknown as { isResizing: boolean }).isResizing).toBe(false);
    expect((Input as unknown as { isDragging: boolean }).isDragging).toBe(true);

    // Reset and test other boundaries
    capturedListeners['mouseup']({ button: 0 } as unknown as MouseEvent);
    (Input as unknown as { mousePosition: Vector2 }).mousePosition = new Vector2(100, 110); // x too small
    capturedListeners['mousedown']({ target: document.createElement('canvas'), button: 0 } as unknown as MouseEvent);
    expect((Input as unknown as { isResizing: boolean }).isResizing).toBe(false);

    capturedListeners['mouseup']({ button: 0 } as unknown as MouseEvent);
    (Input as unknown as { mousePosition: Vector2 }).mousePosition = new Vector2(120, 110); // x too large
    capturedListeners['mousedown']({ target: document.createElement('canvas'), button: 0 } as unknown as MouseEvent);
    expect((Input as unknown as { isResizing: boolean }).isResizing).toBe(false);

    capturedListeners['mouseup']({ button: 0 } as unknown as MouseEvent);
    (Input as unknown as { mousePosition: Vector2 }).mousePosition = new Vector2(110, 120); // y too large
    capturedListeners['mousedown']({ target: document.createElement('canvas'), button: 0 } as unknown as MouseEvent);
    expect((Input as unknown as { isResizing: boolean }).isResizing).toBe(false);

    // Mouseup resets
    capturedListeners['mouseup']({ button: 0 } as unknown as MouseEvent);
    expect((Input as unknown as { isResizing: boolean }).isResizing).toBe(false);

    // Cursor reset when moving away from handle
    (Input as unknown as { mousePosition: Vector2 }).mousePosition = new Vector2(50, 50);
    capturedListeners['mousemove']({ clientX: 50, clientY: 50 } as unknown as MouseEvent);
    expect(mockCanvas.style.cursor).toBe('default');
  });

  it('resizes SpriteComponent using scale', () => {
    (Engine as unknown as { debug: boolean }).debug = true;
    const mockSprite = { frameWidth: 10, frameHeight: 10 };
    const obj = {
      transform: { 
        position: new Vector2(0, 0), 
        worldPosition: new Vector2(0, 0),
        scale: new Vector2(1, 1)
      },
      bounds: { width: 10, height: 10 },
      metadata: { zIndex: 0, tag: 'sprite' },
      getComponent: jest.fn((cls) => cls === SpriteComponent ? mockSprite : null)
    } as unknown as GameObject;
    
    (Engine as unknown as { selectedObject: unknown }).selectedObject = obj;
    (Input as unknown as { isResizing: boolean }).isResizing = true;
    Input.init();
    
    (Input as unknown as { mousePosition: Vector2 }).mousePosition = new Vector2(50, 50);
    capturedListeners['mousemove']({ clientX: 50, clientY: 50 } as unknown as MouseEvent);
    
    expect(obj.transform.scale.x).toBe(5);
    expect(obj.bounds!.width).toBe(50);
  });

  it('resizes ShapeComponent or TextComponent directly', () => {
    (Engine as unknown as { debug: boolean }).debug = true;
    const mockComp = { width: 10, height: 10 };
    const obj = {
      transform: { worldPosition: new Vector2(0, 0) },
      bounds: { width: 10, height: 10 },
      getComponent: jest.fn((cls) => {
        // By checking names we avoid actual import dependencies and it covers both
        if (cls.name === 'ShapeComponent') return mockComp;
        if (cls.name === 'TextComponent') return mockComp;
        return null;
      })
    } as unknown as GameObject;
    
    (Engine as unknown as { selectedObject: unknown }).selectedObject = obj;
    (Input as unknown as { isResizing: boolean }).isResizing = true;
    Input.init();

    // Test ShapeComponent path
    (obj.getComponent as jest.Mock).mockReturnValueOnce(mockComp).mockReturnValueOnce(null);
    (Input as unknown as { mousePosition: Vector2 }).mousePosition = new Vector2(100, 100);
    capturedListeners['mousemove']({ clientX: 100, clientY: 100 } as unknown as MouseEvent);
    expect(mockComp.width).toBe(100);

    // Test TextComponent path
    (obj.getComponent as jest.Mock).mockReturnValueOnce(null).mockReturnValueOnce(mockComp);
    (Input as unknown as { mousePosition: Vector2 }).mousePosition = new Vector2(80, 40);
    capturedListeners['mousemove']({ clientX: 80, clientY: 40 } as unknown as MouseEvent);
    expect(mockComp.width).toBe(80);
  });

  it('handles edge cases during resizing and feedback', () => {
    (Engine as unknown as { debug: boolean }).debug = true;
    const obj = {
      transform: { worldPosition: new Vector2(0, 0) },
      metadata: { zIndex: 0, tag: 'no-bounds' },
      getComponent: jest.fn(() => null)
    } as unknown as GameObject;
    
    (Engine as unknown as { selectedObject: unknown }).selectedObject = obj;
    Input.init();
    
    // No bounds, fallback update
    (Input as unknown as { isResizing: boolean }).isResizing = true;
    expect(() => {
      capturedListeners['mousemove']({ clientX: 100, clientY: 100 } as unknown as MouseEvent);
    }).not.toThrow();

    // No canvas element
    (Input as unknown as { isResizing: boolean }).isResizing = false;
    jest.spyOn(document, 'getElementById').mockReturnValue(null);
    expect(() => {
      capturedListeners['mousemove']({ clientX: 0, clientY: 0 } as unknown as MouseEvent);
    }).not.toThrow();

    // Hover handle with no canvas element (line 100 false branch)
    (Input as unknown as { mousePosition: Vector2 }).mousePosition = new Vector2(110, 110);
    expect(() => {
      capturedListeners['mousemove']({ clientX: 110, clientY: 110 } as unknown as MouseEvent);
    }).not.toThrow();

    // Mousedown handle with no bounds (lines 118-119 ??)
    (Input as unknown as { mousePosition: Vector2 }).mousePosition = new Vector2(0, 0); // (0,0) will match because 0 width/height means handle at (0,0) with size 8 (-4 to +4)
    expect(() => {
      capturedListeners['mousedown']({ target: document.createElement('canvas'), button: 0 } as unknown as MouseEvent);
    }).not.toThrow();

    // Resize sprite with no bounds (line 44 false branch)
    const mockSprite = { frameWidth: 10, frameHeight: 10 };
    const spriteObj = {
      transform: { 
        position: new Vector2(0, 0), 
        worldPosition: new Vector2(0, 0),
        scale: new Vector2(1, 1)
      },
      metadata: { zIndex: 0, tag: 'sprite-no-bounds' },
      getComponent: jest.fn((cls) => cls.name === 'SpriteComponent' ? mockSprite : null)
    } as unknown as GameObject;
    (Engine as unknown as { selectedObject: unknown }).selectedObject = spriteObj;
    (Input as unknown as { isResizing: boolean }).isResizing = true;
    expect(() => {
      capturedListeners['mousemove']({ clientX: 50, clientY: 50 } as unknown as MouseEvent);
    }).not.toThrow();
  });

  it('handles mousedown selection logic edge cases', () => {
    (Engine as unknown as { debug: boolean }).debug = true;
    const obj = {
      transform: { position: { x: 10, y: 10 }, worldPosition: { x: 10, y: 10 } },
      bounds: { width: 50, height: 50 },
      metadata: { zIndex: 0, tag: 'edge-case' }
    } as unknown as GameObject;
    (Engine as unknown as { objects: Set<unknown> }).objects = new Set([obj]);
    (Engine as unknown as { selectedObject: unknown }).selectedObject = null;
    Input.init();

    // Inside object
    (Input as unknown as { mousePosition: Vector2 }).mousePosition = new Vector2(35, 35);
    capturedListeners['mousedown']({ target: document.createElement('canvas'), button: 0 } as unknown as MouseEvent);
    expect(Engine.selectedObject).toBe(obj);

    // Reset
    (Engine as unknown as { selectedObject: unknown }).selectedObject = null;

    // x exactly on boundary (too small, so false)
    (Input as unknown as { mousePosition: Vector2 }).mousePosition = new Vector2(10, 35);
    capturedListeners['mousedown']({ target: document.createElement('canvas'), button: 0 } as unknown as MouseEvent);
    expect(Engine.selectedObject).toBeNull();

    // x exactly on boundary (too large, so false)
    (Input as unknown as { mousePosition: Vector2 }).mousePosition = new Vector2(60, 35);
    capturedListeners['mousedown']({ target: document.createElement('canvas'), button: 0 } as unknown as MouseEvent);
    expect(Engine.selectedObject).toBeNull();

    // y exactly on boundary (too small)
    (Input as unknown as { mousePosition: Vector2 }).mousePosition = new Vector2(35, 10);
    capturedListeners['mousedown']({ target: document.createElement('canvas'), button: 0 } as unknown as MouseEvent);
    expect(Engine.selectedObject).toBeNull();

    // y exactly on boundary (too large)
    (Input as unknown as { mousePosition: Vector2 }).mousePosition = new Vector2(35, 60);
    capturedListeners['mousedown']({ target: document.createElement('canvas'), button: 0 } as unknown as MouseEvent);
    expect(Engine.selectedObject).toBeNull();

    // x too small
    (Input as unknown as { mousePosition: Vector2 }).mousePosition = new Vector2(5, 35);
    capturedListeners['mousedown']({ target: document.createElement('canvas'), button: 0 } as unknown as MouseEvent);
    expect(Engine.selectedObject).toBeNull();

    // x too large
    (Input as unknown as { mousePosition: Vector2 }).mousePosition = new Vector2(65, 35);
    capturedListeners['mousedown']({ target: document.createElement('canvas'), button: 0 } as unknown as MouseEvent);
    expect(Engine.selectedObject).toBeNull();

    // y too small
    (Input as unknown as { mousePosition: Vector2 }).mousePosition = new Vector2(35, 5);
    capturedListeners['mousedown']({ target: document.createElement('canvas'), button: 0 } as unknown as MouseEvent);
    expect(Engine.selectedObject).toBeNull();

    // y too large
    (Input as unknown as { mousePosition: Vector2 }).mousePosition = new Vector2(35, 65);
    capturedListeners['mousedown']({ target: document.createElement('canvas'), button: 0 } as unknown as MouseEvent);
    expect(Engine.selectedObject).toBeNull();
  });

  it('handles object dragging in debug mode', () => {
    (Engine as unknown as { debug: boolean }).debug = true;
    const obj = {
      transform: { position: { x: 10, y: 10 }, worldPosition: { x: 10, y: 10 } },
      bounds: { width: 50, height: 50 },
      metadata: { zIndex: 0, tag: 'drag-me' }
    } as unknown as GameObject;
    (Engine as unknown as { objects: Set<unknown> }).objects = new Set([obj]);
    
    Input.init();
    (Input as unknown as { mousePosition: Vector2 }).mousePosition = new Vector2(35, 35);
    capturedListeners['mousedown']({ target: document.createElement('canvas'), button: 0 } as unknown as MouseEvent);
    expect(Engine.selectedObject).toBe(obj);

    (Input as unknown as { mousePosition: Vector2 }).mousePosition = new Vector2(100, 100);
    capturedListeners['mousemove']({ clientX: 100, clientY: 100 } as unknown as MouseEvent);
    expect(obj.transform.position.x).toBe(75);
  });

  it('handles dragging with parent', () => {
    (Engine as unknown as { debug: boolean }).debug = true;
    const parentTransform = { worldPosition: new Vector2(100, 100) };
    const obj = {
      transform: { position: { x: 10, y: 10 }, worldPosition: { x: 110, y: 110 }, parent: parentTransform },
      bounds: { width: 50, height: 50 },
      metadata: { zIndex: 0, tag: 'child' }
    } as unknown as GameObject;
    (Engine as unknown as { objects: Set<unknown> }).objects = new Set([obj]);
    
    Input.init();
    (Input as unknown as { mousePosition: Vector2 }).mousePosition = new Vector2(135, 135);
    capturedListeners['mousedown']({ target: document.createElement('canvas'), button: 0 } as unknown as MouseEvent);
    
    (Input as unknown as { mousePosition: Vector2 }).mousePosition = new Vector2(200, 200);
    capturedListeners['mousemove']({ clientX: 200, clientY: 200 } as unknown as MouseEvent);
    expect(obj.transform.position.x).toBe(75);
  });

  it('handles clicks on objects WITH currentScene', () => {
    (Engine as unknown as { debug: boolean }).debug = true;
    const obj = {
      transform: { worldPosition: new Vector2(0, 0) },
      bounds: { width: 10, height: 10 },
      metadata: { zIndex: 0, tag: 'in-scene' }
    } as unknown as GameObject;
    (Engine as unknown as { currentScene: unknown }).currentScene = { objects: new Set([obj]) };
    Input.init();
    (Input as unknown as { mousePosition: Vector2 }).mousePosition = new Vector2(5, 5);
    capturedListeners['mousedown']({ target: document.createElement('canvas'), button: 0 } as unknown as MouseEvent);
    expect(Engine.selectedObject).toBe(obj);
  });

  it('handles clicks on objects WITHOUT currentScene', () => {
    (Engine as unknown as { debug: boolean }).debug = true;
    (Engine as unknown as { currentScene: unknown }).currentScene = null;
    const obj = {
      transform: { worldPosition: new Vector2(0, 0) },
      bounds: { width: 10, height: 10 },
      metadata: { zIndex: 0, tag: 'no-scene' }
    } as unknown as GameObject;
    const objNoBounds = {
      transform: { worldPosition: new Vector2(0, 0) },
      metadata: { zIndex: 1, tag: 'no-bounds-in-loop' }
    } as unknown as GameObject;
    (Engine as unknown as { objects: Set<unknown> }).objects = new Set([obj, objNoBounds]);
    Input.init();
    (Input as unknown as { mousePosition: Vector2 }).mousePosition = new Vector2(5, 5);
    capturedListeners['mousedown']({ target: document.createElement('canvas'), button: 0 } as unknown as MouseEvent);
    expect(Engine.selectedObject).toBeDefined();

    // Mouseup with non-zero button
    capturedListeners['mouseup']({ button: 1 } as unknown as MouseEvent);
  });

  it('does not trigger global click listeners when paused', () => {
    (Engine as unknown as { paused: boolean }).paused = true;
    const callback = jest.fn();
    Input.addClickListener(callback);
    Input.init();
    capturedListeners['mousedown']({ target: document.createElement('canvas'), button: 0 } as unknown as MouseEvent);
    expect(callback).not.toHaveBeenCalled();
    Input.removeClickListener(callback);
  });

  it('handles clicks with NO objects hit', () => {
    (Engine as unknown as { debug: boolean }).debug = true;
    (Engine as unknown as { objects: Set<unknown> }).objects = new Set();
    Input.init();
    (Input as unknown as { mousePosition: Vector2 }).mousePosition = new Vector2(5, 5);
    capturedListeners['mousedown']({ target: document.createElement('canvas'), button: 0 } as unknown as MouseEvent);
    expect(Engine.selectedObject).toBeNull();
  });

  it('handles mousedown selection logic edge cases', () => {
    (Engine as unknown as { debug: boolean }).debug = true;
    const obj = {
      transform: { position: { x: 10, y: 10 }, worldPosition: { x: 10, y: 10 } },
      bounds: { width: 50, height: 50 },
      metadata: { zIndex: 0, tag: 'edge-case' }
    } as unknown as GameObject;
    (Engine as unknown as { objects: Set<unknown> }).objects = new Set([obj]);
    (Engine as unknown as { selectedObject: unknown }).selectedObject = null;
    Input.init();

    // Inside object
    (Input as unknown as { mousePosition: Vector2 }).mousePosition = new Vector2(35, 35);
    capturedListeners['mousedown']({ target: document.createElement('canvas'), button: 0 } as unknown as MouseEvent);
    expect(Engine.selectedObject).toBe(obj);

    // Reset
    (Engine as unknown as { selectedObject: unknown }).selectedObject = null;

    // x exactly on boundary (too small, so false)
    (Input as unknown as { mousePosition: Vector2 }).mousePosition = new Vector2(10, 35);
    capturedListeners['mousedown']({ target: document.createElement('canvas'), button: 0 } as unknown as MouseEvent);
    expect(Engine.selectedObject).toBeNull();

    // x exactly on boundary (too large, so false)
    (Input as unknown as { mousePosition: Vector2 }).mousePosition = new Vector2(60, 35);
    capturedListeners['mousedown']({ target: document.createElement('canvas'), button: 0 } as unknown as MouseEvent);
    expect(Engine.selectedObject).toBeNull();

    // y exactly on boundary (too small)
    (Input as unknown as { mousePosition: Vector2 }).mousePosition = new Vector2(35, 10);
    capturedListeners['mousedown']({ target: document.createElement('canvas'), button: 0 } as unknown as MouseEvent);
    expect(Engine.selectedObject).toBeNull();

    // y exactly on boundary (too large)
    (Input as unknown as { mousePosition: Vector2 }).mousePosition = new Vector2(35, 60);
    capturedListeners['mousedown']({ target: document.createElement('canvas'), button: 0 } as unknown as MouseEvent);
    expect(Engine.selectedObject).toBeNull();

    // x too small
    (Input as unknown as { mousePosition: Vector2 }).mousePosition = new Vector2(5, 35);
    capturedListeners['mousedown']({ target: document.createElement('canvas'), button: 0 } as unknown as MouseEvent);
    expect(Engine.selectedObject).toBeNull();

    // x too large
    (Input as unknown as { mousePosition: Vector2 }).mousePosition = new Vector2(65, 35);
    capturedListeners['mousedown']({ target: document.createElement('canvas'), button: 0 } as unknown as MouseEvent);
    expect(Engine.selectedObject).toBeNull();

    // y too small
    (Input as unknown as { mousePosition: Vector2 }).mousePosition = new Vector2(35, 5);
    capturedListeners['mousedown']({ target: document.createElement('canvas'), button: 0 } as unknown as MouseEvent);
    expect(Engine.selectedObject).toBeNull();

    // y too large
    (Input as unknown as { mousePosition: Vector2 }).mousePosition = new Vector2(35, 65);
    capturedListeners['mousedown']({ target: document.createElement('canvas'), button: 0 } as unknown as MouseEvent);
    expect(Engine.selectedObject).toBeNull();
  });

  it('resizes using fallback if NO component matches', () => {
    (Engine as unknown as { debug: boolean }).debug = true;
    const obj = {
      transform: { worldPosition: new Vector2(0, 0) },
      bounds: { width: 10, height: 10 },
      getComponent: jest.fn(() => null)
    } as unknown as GameObject;
    (Engine as unknown as { selectedObject: unknown }).selectedObject = obj;
    (Input as unknown as { isResizing: boolean }).isResizing = true;
    Input.init();
    (Input as unknown as { mousePosition: Vector2 }).mousePosition = new Vector2(50, 50);
    capturedListeners['mousemove']({ clientX: 50, clientY: 50 } as unknown as MouseEvent);
    expect(obj.bounds!.width).toBe(50);
  });

  it('toggles pause with P key', () => {
    jest.spyOn(document, 'getElementById').mockReturnValue({ style: { cursor: '' } } as unknown as HTMLElement);
    Input.init();
    
    // Lowercase p
    capturedListeners['keydown'](new KeyboardEvent('keydown', { key: 'p' }));
    expect(Engine.paused).toBe(true);
    capturedListeners['keydown'](new KeyboardEvent('keydown', { key: 'p' }));
    expect(Engine.paused).toBe(false);

    // Uppercase P
    capturedListeners['keydown'](new KeyboardEvent('keydown', { key: 'P' }));
    expect(Engine.paused).toBe(true);
    capturedListeners['keydown'](new KeyboardEvent('keydown', { key: 'P' }));
    expect(Engine.paused).toBe(false);

    // Non-p key should do nothing
    capturedListeners['keydown'](new KeyboardEvent('keydown', { key: 'w' }));
    expect(Engine.paused).toBe(false);

    // P key with missing canvas
    jest.spyOn(document, 'getElementById').mockReturnValue(null);
    expect(() => {
      capturedListeners['keydown'](new KeyboardEvent('keydown', { key: 'p' }));
    }).not.toThrow();
    expect(Engine.paused).toBe(true);
  });

  it('clears keys on window blur', () => {
    let blurListener: (event: unknown) => void = () => {};
    jest.spyOn(window, 'addEventListener').mockImplementation((type, listener) => {
      if (type === 'blur') blurListener = listener as unknown as (event: unknown) => void;
    });
    Input.init();
    capturedListeners['keydown'](new KeyboardEvent('keydown', { key: 'w' }));
    blurListener({});
    expect(Input.isKeyDown('w')).toBe(false);
  });

  it('ignores mousedown outside canvas', () => {
    Input.init();
    const div = document.createElement('div');
    capturedListeners['mousedown']({ target: div, button: 0 } as unknown as MouseEvent);
    expect(Input.isKeyDown('mouse0')).toBe(false);
  });

});
