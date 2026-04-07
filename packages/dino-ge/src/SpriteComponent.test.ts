import SpriteComponent from './SpriteComponent';
import GameObject from './GameObject';

class MockGameObject extends GameObject {}

describe('SpriteComponent', () => {
  let mockImg: HTMLImageElement;

  beforeEach(() => {
    mockImg = {
      width: 100,
      height: 100,
      complete: true,
      addEventListener: jest.fn()
    } as unknown as HTMLImageElement;
  });

  it('calculates frame dimensions correctly', () => {
    // 100px / 10 cols = 10px frameWidth
    // 100px / 2 rows = 50px frameHeight
    const component = new SpriteComponent(mockImg, 2, 10, 0, 5);
    expect(component.frameWidth).toBe(10);
    expect(component.frameHeight).toBe(50);
  });

  it('initialises with provided animation range', () => {
    const component = new SpriteComponent(mockImg, 1, 10, 2, 8);
    expect(component.startCol).toBe(2);
    expect(component.endCol).toBe(8);
    expect(component.currentFrame).toBe(2);
  });

  it('loops animation correctly during draw', () => {
    let now = 1000;
    jest.spyOn(Date, 'now').mockImplementation(() => now);

    const component = new SpriteComponent(mockImg, 1, 10, 0, 2);
    const obj = new MockGameObject('test', 0);
    component.gameObject = obj;
    component.playing = true;
    component.frameDuration = 100;

    const mockCtx = {
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      scale: jest.fn(),
      drawImage: jest.fn(),
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high'
    } as unknown as CanvasRenderingContext2D;

    // Initially at startCol (0)
    expect(component.currentFrame).toBe(0);

    // Draw without advancing time
    component.draw(mockCtx);
    expect(component.currentFrame).toBe(0);

    // Advance time past duration
    now += 150;
    component.draw(mockCtx);
    expect(component.currentFrame).toBe(1);

    // Advance time again, should wrap to startCol (0)
    now += 150;
    component.draw(mockCtx);
    expect(component.currentFrame).toBe(0);

    jest.restoreAllMocks();
  });
});
