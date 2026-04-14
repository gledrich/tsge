import ShapeComponent from './ShapeComponent.js';
import GameObject from '../core/GameObject.js';
import Vector2 from '../math/Vector2.js';
import BoundsComponent from './BoundsComponent.js';

class MockGameObject extends GameObject {}

describe('ShapeComponent', () => {
  it('initialises as a rectangle correctly', () => {
    const component = new ShapeComponent('rect', 'red', 100, 50);
    expect(component.type).toBe('rect');
    expect(component.colour).toBe('red');
    expect(component.width).toBe(100);
    expect(component.height).toBe(50);
  });

  it('initialises with default width and height', () => {
    const component = new ShapeComponent('rect', 'red');
    expect(component.width).toBe(0);
    expect(component.height).toBe(0);
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
    obj.addComponent(component); // automatically creates bounds 10x20

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
    obj.addComponent(component); // automatically creates bounds 30x30

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

  it('early returns from draw if no gameObject is attached', () => {
    const component = new ShapeComponent('rect', 'red', 10, 10);
    const mockCtx = {
      save: jest.fn(),
    } as unknown as CanvasRenderingContext2D;

    component.draw(mockCtx);

    expect(mockCtx.save).not.toHaveBeenCalled();
  });

  it('early returns from draw if no bounds is attached', () => {
    const component = new ShapeComponent('rect', 'red', 10, 10);
    const obj = new MockGameObject('test', 0);
    component.gameObject = obj; // Manual set bypasses onAttach bounds creation
    const mockCtx = {
      save: jest.fn(),
    } as unknown as CanvasRenderingContext2D;

    component.draw(mockCtx);

    expect(mockCtx.save).not.toHaveBeenCalled();
  });

  it('applies rotation during draw', () => {
    const component = new ShapeComponent('rect', 'green', 10, 20);
    const obj = new MockGameObject('test', 0);
    obj.addComponent(component);
    obj.transform.rotation = Math.PI / 2;

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

    expect(mockCtx.rotate).toHaveBeenCalledWith(Math.PI / 2);
  });

  it('does not draw if type is unknown', () => {
    // Force invalid type for testing
    const component = new ShapeComponent('rect', 'green', 10, 20);
    (component as unknown as { type: string }).type = 'invalid';
    
    const obj = new MockGameObject('test', 0);
    obj.addComponent(component);

    const mockCtx = {
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      scale: jest.fn(),
      fillRect: jest.fn(),
      beginPath: jest.fn(),
      fillStyle: ''
    } as unknown as CanvasRenderingContext2D;

    component.draw(mockCtx);

    expect(mockCtx.fillRect).not.toHaveBeenCalled();
    expect(mockCtx.beginPath).not.toHaveBeenCalled();
  });

  it('automatically creates/updates BoundsComponent on GameObject', () => {
    const component = new ShapeComponent('rect', 'red', 100, 50);
    const obj = new MockGameObject('test', 0);
    
    // Initially no bounds
    expect(obj.bounds).toBeUndefined();
    
    obj.addComponent(component);
    
    // Bounds should be created via onAttach hook called by addComponent
    expect(obj.bounds).toBeDefined();
    expect(obj.bounds!.width).toBe(100);
    expect(obj.bounds!.height).toBe(50);
    
    component.width = 200;
    expect(obj.bounds!.width).toBe(200);

    // Updating component height should update bounds
    component.height = 300;
    expect(obj.bounds!.height).toBe(300);
  });

  it('handles setters when attached to bounds', () => {
    const obj = new MockGameObject('test', 0);
    const component = new ShapeComponent('rect', 'red', 10, 10);
    obj.addComponent(component);
    
    // Test width getter/setter on attached rect
    component.width = 50;
    expect(component.width).toBe(50);
    expect(obj.bounds!.width).toBe(50);
    
    // Test height getter/setter on attached rect
    component.height = 60;
    expect(component.height).toBe(60);
    expect(obj.bounds!.height).toBe(60);

    const circleComp = new ShapeComponent('circle', 'blue', 10);
    obj.addComponent(circleComp);
    
    // Test width getter/setter on attached circle (as radius)
    circleComp.width = 20; // Radius 20 -> Width 40
    expect(circleComp.width).toBe(20);
    expect(obj.bounds!.width).toBe(40);
  });

  it('updates existing BoundsComponent on GameObject', () => {
    const obj = new MockGameObject('test', 0);
    const bounds = new BoundsComponent(10, 10);
    obj.bounds = bounds;
    obj.addComponent(bounds);

    const component = new ShapeComponent('rect', 'red', 100, 50);
    obj.addComponent(component);

    expect(obj.bounds).toBe(bounds); // Should reuse existing
    expect(bounds.width).toBe(100);
    expect(bounds.height).toBe(50);
  });

  it('handles circle radius doubling in bounds', () => {
    const obj = new MockGameObject('test', 0);
    const component = new ShapeComponent('circle', 'blue', 25);
    obj.addComponent(component);

    expect(obj.bounds!.width).toBe(50);
    expect(obj.bounds!.height).toBe(50);

    component.width = 30;
    expect(obj.bounds!.width).toBe(60);
  });

  it('does nothing in _updateGameObjectBounds if unattached', () => {
    const component = new ShapeComponent('rect', 'red', 100, 50);
    expect(() => {
      (component as unknown as { _updateGameObjectBounds: () => void })._updateGameObjectBounds();
    }).not.toThrow();
  });

  it('handles setters when attached to object WITHOUT bounds', () => {
    const obj = new MockGameObject('test', 0);
    const component = new ShapeComponent('rect', 'red', 10, 10);
    component.gameObject = obj; // Manual set bypasses onAttach bounds creation
    
    expect(() => {
      component.width = 50;
      component.height = 60;
    }).not.toThrow();
  });

  it('handles setters when completely unattached', () => {
    const component = new ShapeComponent('rect', 'red', 10, 10);
    expect(() => {
      component.width = 50;
      component.height = 60;
    }).not.toThrow();
    expect(component.width).toBe(50);
  });
});
