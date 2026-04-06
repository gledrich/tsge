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
    expect(textObj.tag).toBe('score-ui');
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
      // Click inside: position (100,100), size (100,50) -> Bounds (100-200, 100-150)
      capturedListener(new Vector2(150, 125));
      expect(onClick).toHaveBeenCalledTimes(1);
      
      // Click outside
      capturedListener(new Vector2(50, 50));
      expect(onClick).toHaveBeenCalledTimes(1); // Still 1
    }
  });
});
