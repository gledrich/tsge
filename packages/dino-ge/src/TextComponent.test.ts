import TextComponent from './TextComponent';
import GameObject from './GameObject';

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
      'left',
      'top',
      50,
      20,
      'red'
    );
    const obj = new MockGameObject('test', 0);
    component.gameObject = obj;

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

  it('applies rotation and handles missing background during draw', () => {
    const component = new TextComponent('Test', '10px Arial', 'black', 'left', 'top', 50, 20);
    const obj = new MockGameObject('test', 0);
    obj.transform.rotation = Math.PI / 4;
    component.gameObject = obj;

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
  });
});
