import TilemapComponent from './TilemapComponent';
import GameObject from './GameObject';

class MockGameObject extends GameObject { }

describe('TilemapComponent', () => {
  const mockTileset = { width: 32, height: 32 } as HTMLImageElement;
  const mockData = [
    [0, 1],
    [-1, 0]
  ];

  it('initialises with provided values', () => {
    const component = new TilemapComponent(mockTileset, mockData, 16, 1);

    expect(component.tileset).toBe(mockTileset);
    expect(component.data).toBe(mockData);
    expect(component.tileSize).toBe(16);
    expect(component.tilesetCols).toBe(1);
  });

  it('draws to the context if gameObject is present', () => {
    const component = new TilemapComponent(mockTileset, mockData, 16, 1);
    const obj = new MockGameObject('test', 0);
    component.gameObject = obj;

    const mockCtx = {
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      scale: jest.fn(),
      drawImage: jest.fn()
    } as unknown as CanvasRenderingContext2D;

    component.draw(mockCtx);

    expect(mockCtx.save).toHaveBeenCalled();
    // 3 non-empty tiles in mockData
    expect(mockCtx.drawImage).toHaveBeenCalledTimes(3);
    expect(mockCtx.restore).toHaveBeenCalled();
  });
});
