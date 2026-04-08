import Text from './Text';
import Vector2 from './Vector2';
import TextComponent from './TextComponent';
import Engine from './Engine';
import Input from './Input';

jest.mock('./Engine', () => ({
  __esModule: true,
  default: {
    registerObject: jest.fn(),
    destroyObject: jest.fn()
  }
}));

// Use a custom mock to capture the listener
let capturedListener: ((pos: Vector2) => void) | null = null;
jest.mock('./Input', () => ({
  __esModule: true,
  default: {
    addClickListener: jest.fn((listener) => { capturedListener = listener; }),
    removeClickListener: jest.fn(() => { capturedListener = null; })
  }
}));

describe('Text', () => {
  const mockProps = {
    text: 'Score: 0',
    position: new Vector2(100, 100),
    tag: 'score-ui'
  };

  beforeEach(() => {
    capturedListener = null;
    jest.clearAllMocks();
  });

  it('initialises correctly', () => {
    const textObj = new Text(mockProps);
    expect(textObj.text).toBe('Score: 0');
    expect(textObj.metadata.tag).toBe('score-ui');
    expect(textObj.hasComponent(TextComponent)).toBe(true);
  });

  it('synchronises properties with TextComponent', () => {
    const textObj = new Text(mockProps);
    textObj.text = 'Score: 10';
    expect(textObj.getComponent(TextComponent)!.text).toBe('Score: 10');
    expect(textObj.length).toBe(9);
    
    textObj.colour = 'red';
    expect(textObj.getComponent(TextComponent)!.colour).toBe('red');
  });

  it('registers with engine immediately if register prop is true', () => {
    new Text({ ...mockProps, register: true });
    expect(Engine.registerObject).toHaveBeenCalled();
    expect(Input.addClickListener).toHaveBeenCalled();
  });

  it('handles clicks within its bounds', () => {
    const onClick = jest.fn();
    const textObj = new Text({
      ...mockProps,
      width: 100,
      height: 50,
      onClick
    });
    
    // Ensure it's registered so capturedListener is set
    textObj.registerSelf();
    
    expect(capturedListener).toBeDefined();
    if (capturedListener) {
      // Hit
      capturedListener(new Vector2(150, 125));
      expect(onClick).toHaveBeenCalledTimes(1);
      
      // Miss X low
      capturedListener(new Vector2(50, 125));
      // Miss X high
      capturedListener(new Vector2(250, 125));
      // Miss Y low
      capturedListener(new Vector2(150, 50));
      // Miss Y high
      capturedListener(new Vector2(150, 175));
      
      expect(onClick).toHaveBeenCalledTimes(1);
    }

    // Branch: bounds is missing
    textObj.bounds = undefined;
    if (capturedListener) {
      capturedListener(new Vector2(150, 125));
      expect(onClick).toHaveBeenCalledTimes(1);
    }
  });

  it('destroys itself from engine and input', () => {
    const textObj = new Text({ ...mockProps, register: true });
    expect(textObj.registered).toBe(true);
    
    textObj.destroySelf();
    expect(textObj.registered).toBe(false);
    expect(Engine.destroyObject).toHaveBeenCalledWith(textObj);
    expect(Input.removeClickListener).toHaveBeenCalled();

    // Branch: call again when already destroyed
    textObj.destroySelf();
    expect(Engine.destroyObject).toHaveBeenCalledTimes(1);
  });

  it('provides access to additional properties', () => {
    const textObj = new Text(mockProps);
    
    textObj.backgroundColour = 'black';
    expect(textObj.backgroundColour).toBe('black');
    
    textObj.font = '20px Arial';
    expect(textObj.font).toBe('20px Arial');
    
    textObj.horizontalAlign = 'left';
    expect(textObj.horizontalAlign).toBe('left');
    
    textObj.verticalAlign = 'top';
    expect(textObj.verticalAlign).toBe('top');
  });

  it('handles default values when props are missing', () => {
    // Only text and position are strictly required by the interface
    const textObj = new Text({ text: 'test', position: new Vector2(), tag: 'custom-tag', zIndex: 5 });
    expect(textObj.metadata.tag).toBe('custom-tag');
    expect(textObj.metadata.zIndex).toBe(5);
    expect(textObj.colour).toBe('black');
    expect(textObj.fontSize).toBe(25);
    expect(textObj.horizontalAlign).toBe('center');
    expect(textObj.verticalAlign).toBe('middle');
    // Branch: width defaulted
    expect(textObj.bounds?.width).toBe(25 * 4);
    // Branch: height defaulted
    expect(textObj.bounds?.height).toBe(25 * 2);
    // Branch: backgroundColour defaulted
    expect(textObj.backgroundColour).toBe('');

    // Another one with defaults for tag and zIndex
    const textObj2 = new Text({ text: 'a', position: new Vector2() });
    expect(textObj2.metadata.tag).toBe('text');
    expect(textObj2.metadata.zIndex).toBe(0);
    
    // Call default onClick for function coverage
    textObj2.onClick();

    // Trigger the default from defaultProps specifically
    const textObj3 = new Text({ text: 'default', position: new Vector2() });
    textObj3.onClick(); // This calls the defaultOnClick from defaultProps
  });

  it('manages manual registration', () => {
    const textObj = new Text({ ...mockProps, register: false });
    expect(textObj.registered).toBe(false);
    expect(Engine.registerObject).not.toHaveBeenCalled();

    // Register manually
    textObj.registerSelf();
    expect(textObj.registered).toBe(true);
    expect(Engine.registerObject).toHaveBeenCalledTimes(1);

    // Branch: call again when already registered
    textObj.registerSelf();
    expect(Engine.registerObject).toHaveBeenCalledTimes(1);
  });

  it('handles optional onClick branches', () => {
    // Branch: onClick not provided in props (uses default empty fn)
    new Text({ ...mockProps, register: true });
    
    if (capturedListener) {
      capturedListener(new Vector2(150, 125));
      // Should not throw
    }

    // Branch: defaultedProps.onClick is falsy (hits line 137 false branch)
    const textObj2 = new Text({ ...mockProps, onClick: null as unknown as () => void });
    expect(textObj2.onClick).toBeDefined(); // Still has class-level default

    // Branch: this.onClick is falsy (hits line 188 false branch)
    (textObj2 as unknown as { onClick: unknown }).onClick = null;
    if (capturedListener) {
      capturedListener(new Vector2(150, 125));
      // Should not throw
    }
  });
});
