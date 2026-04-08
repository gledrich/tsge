import Line, { LineProperties } from './Line';
import Vector2 from './Vector2';
import LineComponent from './LineComponent';
import BoundsComponent from './BoundsComponent';
import Engine from './Engine';

jest.mock('./Engine', () => ({
  __esModule: true,
  default: {
    registerObject: jest.fn(),
    currentScene: null
  }
}));

describe('Line', () => {
  const mockProps: LineProperties = {
    p1: new Vector2(10, 10),
    p2: new Vector2(50, 50),
    width: 5,
    tag: 'separator',
    zIndex: 2
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initialises with provided properties', () => {
    const line = new Line(mockProps);
    
    expect(line.metadata.tag).toBe('separator');
    expect(line.metadata.zIndex).toBe(2);
    expect(line.strokeWidth).toBe(5);
    expect(line.x1).toBe(10);
    expect(line.y1).toBe(10);
    expect(line.x2).toBe(50);
    expect(line.y2).toBe(50);
    
    expect(line.startPosition.x).toBe(10);
    expect(line.startPosition.y).toBe(10);
    
    // Bounds: abs(50-10) = 40
    expect(line.bounds?.width).toBe(40);
    expect(line.bounds?.height).toBe(40);
    
    expect(line.hasComponent(BoundsComponent)).toBe(true);
    expect(line.hasComponent(LineComponent)).toBe(true);
    expect(Engine.registerObject).toHaveBeenCalledWith(line);
  });

  it('initialises with default properties', () => {
    const minProps: LineProperties = {
      p1: new Vector2(0, 0),
      p2: new Vector2(100, 0)
    };
    
    const line = new Line(minProps);
    
    expect(line.metadata.tag).toBe('line');
    expect(line.metadata.zIndex).toBe(0);
    expect(line.strokeWidth).toBe(1);
    expect(line.bounds?.width).toBe(100);
    expect(line.bounds?.height).toBe(0);
  });
});
