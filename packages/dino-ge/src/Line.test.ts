import Line, { LineProperties } from './Line';
import Vector2 from './Vector2';
import VisibilityComponent from './VisibilityComponent';
import PhysicsComponent from './PhysicsComponent';
import LineComponent from './LineComponent';
import BoundsComponent from './BoundsComponent';
import Engine from './Engine';
import Registry from './Registry';

describe('Line', () => {
  const mockProps: LineProperties = {
    p1: new Vector2(10, 10),
    p2: new Vector2(50, 50),
    width: 5,
    tag: 'separator',
    zIndex: 2
  };

  beforeEach(() => {
    Engine.resetState();
    jest.clearAllMocks();
  });

  it('initialises with provided properties', () => {
    const spy = jest.spyOn(Registry, 'registerObject');
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
    expect(spy).toHaveBeenCalledWith(line);
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

  it('initialises with physics and visibility options', () => {
    const obj = new Line({ p1: new Vector2(), p2: new Vector2(), visible: false, physics: { velocity: new Vector2(1,2), acceleration: new Vector2(3,4), mass: 5, isStatic: true, restitution: 0.5, friction: 0.2 } });
    expect(obj.getComponent(VisibilityComponent)?.visible).toBe(false);
    const pc = obj.getComponent(PhysicsComponent);
    expect(pc?.velocity.x).toBe(1);
    expect(pc?.acceleration.x).toBe(3);
    expect(pc?.mass).toBe(5);
    expect(pc?.isStatic).toBe(true);
    expect(pc?.restitution).toBe(0.5);
    expect(pc?.friction).toBe(0.2);
  });
});
