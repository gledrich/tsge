import Input from './Input';
import Vector2 from './Vector2';

jest.mock('./Engine', () => ({
  __esModule: true,
  default: {
    camera: {
      zoom: 1,
      position: { x: 0, y: 0 }
    },
    paused: false,
    debug: false
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
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('tracks key states correctly', () => {
    Input.init();
    
    expect(capturedListeners['keydown']).toBeDefined();
    
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
});
