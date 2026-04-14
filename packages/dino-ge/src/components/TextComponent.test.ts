import TextComponent from './TextComponent.js';
import GameObject from '../core/GameObject.js';
import BoundsComponent from './BoundsComponent.js';

class MockGameObject extends GameObject {}

describe('TextComponent', () => {
  it('initialises with provided values', () => {
    const component = new TextComponent(
      'Hello',
      '20px Arial',
      'white',
      'center',
      'middle',
      100,
      40,
      'blue'
    );
    
    expect(component.text).toBe('Hello');
    expect(component.font).toBe('20px Arial');
    expect(component.colour).toBe('white');
    expect(component.horizontalAlign).toBe('center');
    expect(component.verticalAlign).toBe('middle');
    expect(component.width).toBe(100);
    expect(component.height).toBe(40);
    expect(component.backgroundColour).toBe('blue');
  });

  it('draws to the context if gameObject is present', () => {
    const component = new TextComponent(
      'Test',
      '10px Arial',
      'black',
      'center',
      'middle',
      50,
      20,
      'red'
    );
    const obj = new MockGameObject('test', 0);
    obj.addComponent(component); // automatically creates bounds 50x20

    const mockCtx = {
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      scale: jest.fn(),
      fillRect: jest.fn(),
      fillText: jest.fn(),
      beginPath: jest.fn(),
      closePath: jest.fn(),
      font: '',
      fillStyle: '',
      textAlign: '',
      textBaseline: ''
    } as unknown as CanvasRenderingContext2D;

    component.draw(mockCtx);

    expect(mockCtx.save).toHaveBeenCalled();
    expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 50, 20);
    expect(mockCtx.fillText).toHaveBeenCalledWith('Test', 25, 10);
    expect(mockCtx.restore).toHaveBeenCalled();
  });

  it('early returns from draw if no gameObject is attached', () => {
    const component = new TextComponent('a', 'b', 'c', 'left', 'top', 0, 0);
    const mockCtx = {
      save: jest.fn(),
    } as unknown as CanvasRenderingContext2D;

    component.draw(mockCtx);

    expect(mockCtx.save).not.toHaveBeenCalled();
  });

  it('early returns from draw if no bounds is attached', () => {
    const component = new TextComponent('a', 'b', 'c', 'left', 'top', 0, 0);
    const obj = new MockGameObject('test', 0);
    component.gameObject = obj; // Manual set bypasses onAttach bounds creation
    const mockCtx = {
      save: jest.fn(),
    } as unknown as CanvasRenderingContext2D;

    component.draw(mockCtx);

    expect(mockCtx.save).not.toHaveBeenCalled();
  });

  it('applies rotation and handles missing background during draw', () => {
    const component = new TextComponent('Test', '10px Arial', 'black', 'left', 'top', 50, 20);
    const obj = new MockGameObject('test', 0);
    obj.addComponent(component);
    obj.transform.rotation = Math.PI / 4;

    const mockCtx = {
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      scale: jest.fn(),
      fillRect: jest.fn(),
      fillText: jest.fn(),
      font: '',
      fillStyle: '',
      textAlign: '',
      textBaseline: ''
    } as unknown as CanvasRenderingContext2D;

    component.draw(mockCtx);

    expect(mockCtx.rotate).toHaveBeenCalledWith(Math.PI / 4);
    expect(mockCtx.fillRect).not.toHaveBeenCalled();
    expect(mockCtx.fillText).toHaveBeenCalled();
  });

  it('automatically creates/updates BoundsComponent on GameObject', () => {
    const component = new TextComponent('a', 'b', 'c', 'left', 'top', 50, 20);
    const obj = new MockGameObject('test', 0);
    
    // Initially no bounds
    expect(obj.bounds).toBeUndefined();
    
    obj.addComponent(component);
    
    // Bounds should be created via onAttach hook called by addComponent
    expect(obj.bounds).toBeDefined();
    expect(obj.bounds!.width).toBe(50);
    expect(obj.bounds!.height).toBe(20);
    
    // Updating component width should update bounds
    component.width = 100;
    expect(obj.bounds!.width).toBe(100);

    // Updating component height should update bounds
    component.height = 150;
    expect(obj.bounds!.height).toBe(150);
  });

  it('handles setters when attached to bounds', () => {
    const obj = new MockGameObject('test', 0);
    const component = new TextComponent('a', 'b', 'c', 'left', 'top', 10, 10);
    obj.addComponent(component);
    
    // Test width getter/setter
    component.width = 50;
    expect(component.width).toBe(50);
    expect(obj.bounds!.width).toBe(50);
    
    // Test height getter/setter
    component.height = 60;
    expect(component.height).toBe(60);
    expect(obj.bounds!.height).toBe(60);
  });

  it('updates existing BoundsComponent on GameObject', () => {
    const obj = new MockGameObject('test', 0);
    const bounds = new BoundsComponent(10, 10);
    obj.bounds = bounds;
    obj.addComponent(bounds);

    const component = new TextComponent('a', 'b', 'c', 'left', 'top', 50, 20);
    obj.addComponent(component);

    expect(obj.bounds).toBe(bounds); // Should reuse existing
    expect(bounds.width).toBe(50);
    expect(bounds.height).toBe(20);
  });

  it('does nothing in _updateGameObjectBounds if unattached', () => {
    const component = new TextComponent('a', 'b', 'c', 'left', 'top', 50, 20);
    expect(() => {
      (component as unknown as { _updateGameObjectBounds: () => void })._updateGameObjectBounds();
    }).not.toThrow();
  });

  it('handles setters when attached to object WITHOUT bounds', () => {
    const obj = new MockGameObject('test', 0);
    const component = new TextComponent('a', 'b', 'c', 'left', 'top', 10, 10);
    component.gameObject = obj; // Manual set bypasses onAttach bounds creation
    
    expect(() => {
      component.width = 50;
      component.height = 60;
    }).not.toThrow();
  });

  it('handles setters when completely unattached', () => {
    const component = new TextComponent('a', 'b', 'c', 'left', 'top', 10, 10);
    expect(() => {
      component.width = 50;
      component.height = 60;
    }).not.toThrow();
    expect(component.width).toBe(50);
  });

  it('handles draw alignment branches', () => {
    const mockCtx = {
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      scale: jest.fn(),
      fillRect: jest.fn(),
      fillText: jest.fn(),
      font: '',
      fillStyle: '',
      textAlign: '',
      textBaseline: ''
    } as unknown as CanvasRenderingContext2D;

    const obj = new MockGameObject('test', 0);

    // Test Right/Bottom alignment
    const component = new TextComponent('Test', '10px Arial', 'black', 'right', 'bottom', 50, 20);
    obj.addComponent(component);
    component.draw(mockCtx);
    expect(mockCtx.fillText).toHaveBeenCalledWith('Test', 50, 20);

    // Test End alignment
    const component2 = new TextComponent('Test', '10px Arial', 'black', 'end', 'top', 50, 20);
    const obj2 = new MockGameObject('test2', 0);
    obj2.addComponent(component2);
    component2.draw(mockCtx);
    expect(mockCtx.fillText).toHaveBeenCalledWith('Test', 50, 0);
  });
});
