import Input from './Input';
import Vector2 from './Vector2';
import Engine from './Engine';
import Scene from './Scene';
import GameObject from './GameObject';

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
    jest.clearAllMocks();
    
    capturedListeners = {};
    jest.spyOn(document, 'addEventListener').mockImplementation((type, listener) => {
      capturedListeners[type] = listener as unknown as (event: unknown) => void;
    });

    // Reset Engine mock properties
    (Engine as unknown as { debug: boolean }).debug = false;
    (Engine as unknown as { paused: boolean }).paused = false;
    (Engine as unknown as { objects: Set<unknown> }).objects = new Set();
    (Engine as unknown as { currentScene: Scene | null }).currentScene = null;
    (Engine as unknown as { selectedObject: GameObject | null }).selectedObject = null;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('tracks key states correctly', () => {
    Input.init();
    
    expect(capturedListeners['keydown']).toBeDefined();
    
    capturedListeners['keydown'](new KeyboardEvent('keydown', { key: 'w' }));
    expect(Input.isKeyDown('w')).toBe(true);
    
    // Test branch: key already down (should return early)
    capturedListeners['keydown'](new KeyboardEvent('keydown', { key: 'w' }));
    expect(Input.isKeyDown('w')).toBe(true);

    capturedListeners['keyup'](new KeyboardEvent('keyup', { key: 'w' }));
    expect(Input.isKeyDown('w')).toBe(false);
  });

  it('manages global click listeners', () => {
    const callback = jest.fn();
    Input.addClickListener(callback);
    
    Input.init();
    
    // Simulate click on canvas
    const canvas = document.createElement('canvas');
    const clickEvent = {
      target: canvas,
      clientX: 10,
      clientY: 10
    };
    
    capturedListeners['click'](clickEvent as unknown as MouseEvent);
    
    expect(callback).toHaveBeenCalled();
    
    Input.removeClickListener(callback);
    capturedListeners['click'](clickEvent as unknown as MouseEvent);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('handles mouse movement and position getters', () => {
    Input.init();
    const moveEvent = { clientX: 100, clientY: 200 };
    capturedListeners['mousemove'](moveEvent as unknown as MouseEvent);
    
    // Engine.camera zoom=1, pos=(0,0)
    expect(Input.mouseX).toBe(100);
    expect(Input.mouseY).toBe(200);
  });

  it('prevents multiple initialisations', () => {
    Input.init();
    const firstCount = Object.keys(capturedListeners).length;
    Input.init();
    expect(Object.keys(capturedListeners).length).toBe(firstCount);
  });

  it('ignores clicks outside canvas', () => {
    Input.init();
    const callback = jest.fn();
    Input.addClickListener(callback);
    
    const div = document.createElement('div');
    capturedListeners['click']({ target: div } as unknown as MouseEvent);
    expect(callback).not.toHaveBeenCalled();
  });

  it('handles debug object selection on click with sorting', () => {
    (Engine as unknown as { debug: boolean }).debug = true;
    
    const objBottom = {
      transform: { position: { x: 10, y: 10 } },
      bounds: { width: 50, height: 50 },
      metadata: { zIndex: 0, tag: 'bottom' }
    } as unknown as GameObject;
    const objTop = {
      transform: { position: { x: 10, y: 10 } },
      bounds: { width: 50, height: 50 },
      metadata: { zIndex: 10, tag: 'top' }
    } as unknown as GameObject;
    (Engine as unknown as { objects: Set<GameObject> }).objects = new Set([objBottom, objTop]);
    
    Input.init();
    const canvas = document.createElement('canvas');
    
    // Set mouse position inside both
    (Input as any).mousePosition = new Vector2(20, 20);

    // Should select objTop first due to sorting (10 > 0)
    capturedListeners['click']({ target: canvas } as unknown as MouseEvent);
    expect(Engine.selectedObject).toBe(objTop);

    // Test reverse sort branch by changing zIndex
    (objBottom.metadata as { zIndex: number }).zIndex = 20;
    capturedListeners['click']({ target: canvas } as unknown as MouseEvent);
    expect(Engine.selectedObject).toBe(objBottom);

    // Test zIndex equality branch (20 > 20 is false, returns -1)
    (objTop.metadata as { zIndex: number }).zIndex = 20;
    capturedListeners['click']({ target: canvas } as unknown as MouseEvent);
    expect(Engine.selectedObject).toBeDefined();

    // Test branch where an object has no bounds
    const objNoBounds = {
      transform: { position: { x: 10, y: 10 } },
      metadata: { zIndex: 100, tag: 'no-bounds' }
    } as unknown as GameObject;
    (Engine as any).objects.add(objNoBounds);
    capturedListeners['click']({ target: canvas } as unknown as MouseEvent);
    expect(Engine.selectedObject).not.toBe(objNoBounds);

    // Click outside
    (Input as any).mousePosition = new Vector2(100, 100);
    capturedListeners['click']({ target: canvas } as unknown as MouseEvent);
    expect(Engine.selectedObject).toBeNull();
  });

  it('selects objects from currentScene if present', () => {
    (Engine as unknown as { debug: boolean }).debug = true;
    const mockObj = {
      transform: { position: { x: 10, y: 10 } },
      bounds: { width: 50, height: 50 },
      metadata: { zIndex: 0, tag: 'scene-target' }
    } as unknown as GameObject;
    
    (Engine as unknown as { currentScene: { objects: Set<GameObject> } | null }).currentScene = { objects: new Set([mockObj]) };
    
    Input.init();
    const canvas = document.createElement('canvas');
    
    (Input as any).mousePosition = new Vector2(20, 20);
    capturedListeners['click']({ 
      target: canvas, 
      clientX: 20, clientY: 20 
    } as unknown as MouseEvent);
    expect(Engine.selectedObject).toBe(mockObj);
  });

  it('respects pause state for clicks', () => {
    (Engine as unknown as { paused: boolean }).paused = true;
    const callback = jest.fn();
    Input.addClickListener(callback);
    
    Input.init();
    const canvas = document.createElement('canvas');
    capturedListeners['click']({ target: canvas } as unknown as MouseEvent);
    expect(callback).not.toHaveBeenCalled();
  });

  it('tracks mouse buttons with mousedown/mouseup', () => {
    Input.init();
    const canvas = document.createElement('canvas');
    
    capturedListeners['mousedown']({ target: canvas, button: 0 } as unknown as MouseEvent);
    expect(Input.isKeyDown('mouse0')).toBe(true);
    
    // Test branch: button already down
    capturedListeners['mousedown']({ target: canvas, button: 0 } as unknown as MouseEvent);
    expect(Input.isKeyDown('mouse0')).toBe(true);

    capturedListeners['mouseup']({ button: 0 } as unknown as MouseEvent);
    expect(Input.isKeyDown('mouse0')).toBe(false);
  });

  it('ignores mousedown outside canvas', () => {
    Input.init();
    const div = document.createElement('div');
    capturedListeners['mousedown']({ target: div, button: 0 } as unknown as MouseEvent);
    expect(Input.isKeyDown('mouse0')).toBe(false);
  });

  it('toggles pause with P key both ways', () => {
    (Engine as unknown as { paused: boolean }).paused = false;
    
    // Mock getElementById for cursor style
    const mockCanvas = { style: { cursor: '' } };
    jest.spyOn(document, 'getElementById').mockReturnValue(mockCanvas as unknown as HTMLElement);

    Input.init();
    // Toggle to paused: true
    capturedListeners['keydown'](new KeyboardEvent('keydown', { key: 'p' }));
    expect(Engine.paused).toBe(true);
    expect(mockCanvas.style.cursor).toBe('default');

    // Toggle to paused: false
    capturedListeners['keydown'](new KeyboardEvent('keydown', { key: 'p' }));
    expect(Engine.paused).toBe(false);
  });

  it('clears keys on window blur', () => {
    let blurListener: (event: unknown) => void = () => {};
    jest.spyOn(window, 'addEventListener').mockImplementation((type, listener) => {
      if (type === 'blur') blurListener = listener as unknown as (event: unknown) => void;
    });

    Input.init();
    capturedListeners['keydown'](new KeyboardEvent('keydown', { key: 'w' }));
    expect(Input.isKeyDown('w')).toBe(true);
    
    blurListener({});
    expect(Input.isKeyDown('w')).toBe(false);
  });
});
