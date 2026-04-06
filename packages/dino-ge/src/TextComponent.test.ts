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
});
