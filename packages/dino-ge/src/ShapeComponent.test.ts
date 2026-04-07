import ShapeComponent from './ShapeComponent';
import GameObject from './GameObject';
import Vector2 from './Vector2';

class MockGameObject extends GameObject {}

describe('ShapeComponent', () => {
  it('initialises as a rectangle correctly', () => {
    const component = new ShapeComponent('rect', 'red', 100, 50);
    expect(component.type).toBe('rect');
    expect(component.colour).toBe('red');
    expect(component.width).toBe(100);
    expect(component.height).toBe(50);
  });

  it('initialises as a circle correctly', () => {
    const component = new ShapeComponent('circle', 'blue', 25);
    expect(component.type).toBe('circle');
    expect(component.colour).toBe('blue');
    expect(component.width).toBe(25); // width is radius for circles
  });

  it('draws a rectangle to the context', () => {
    const component = new ShapeComponent('rect', 'green', 10, 20);
    const obj = new MockGameObject('test', 0);
    obj.transform.position = new Vector2(100, 100);
    component.gameObject = obj;

    const mockCtx = {
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      scale: jest.fn(),
      fillRect: jest.fn(),
      fillStyle: ''
    } as unknown as CanvasRenderingContext2D;

    component.draw(mockCtx);

    expect(mockCtx.save).toHaveBeenCalled();
    expect(mockCtx.translate).toHaveBeenCalledWith(100, 100);
    expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 10, 20);
    expect(mockCtx.restore).toHaveBeenCalled();
  });

  it('draws a circle to the context', () => {
    const component = new ShapeComponent('circle', 'yellow', 15);
    const obj = new MockGameObject('test', 0);
    component.gameObject = obj;

    const mockCtx = {
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      scale: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      closePath: jest.fn(),
      fillStyle: ''
    } as unknown as CanvasRenderingContext2D;

    component.draw(mockCtx);

    expect(mockCtx.save).toHaveBeenCalled();
    // width is radius. arc parameters: x, y, radius, startAngle, endAngle
    expect(mockCtx.arc).toHaveBeenCalledWith(15, 15, 15, 0, Math.PI * 2);
    expect(mockCtx.fill).toHaveBeenCalled();
    expect(mockCtx.restore).toHaveBeenCalled();
  });
});
