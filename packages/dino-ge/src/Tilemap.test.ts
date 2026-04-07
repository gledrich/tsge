import Tilemap from './Tilemap';
import Vector2 from './Vector2';
import TilemapComponent from './TilemapComponent';
import ResourceLoader from './Loader';

jest.mock('./Loader', () => ({
  __esModule: true,
  default: {
    getImage: jest.fn(() => ({ width: 32, height: 32 }))
  }
}));

describe('Tilemap', () => {
  const mockData = [
    [0, 0, 0],
    [0, 0, 0]
  ];
  const mockProps = {
    tag: 'background',
    tileset: 'tiles',
    data: mockData,
    tileSize: 16,
    tilesetCols: 2,
    position: new Vector2(0, 0)
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initialises correctly and calls ResourceLoader', () => {
    const tilemap = new Tilemap(mockProps);
    expect(tilemap.metadata.tag).toBe('background');
    expect(ResourceLoader.getImage).toHaveBeenCalledWith('tiles');
    expect(tilemap.hasComponent(TilemapComponent)).toBe(true);
  });

  it('initialises with default tag and zIndex if not provided', () => {
    const tm = new Tilemap({
      tileset: { width: 32, height: 32 } as unknown as HTMLImageElement,
      data: [[0]],
      tileSize: 16,
      tilesetCols: 1,
      position: new Vector2(0, 0)
    });
    expect(tm.metadata.tag).toBe('tilemap');
    expect(tm.metadata.zIndex).toBe(0);
  });

  it('calculates width and height correctly', () => {
    const tilemap = new Tilemap(mockProps);
    // 3 columns * 16px = 48px width
    // 2 rows * 16px = 32px height
    expect(tilemap.bounds?.width).toBe(48);
    expect(tilemap.bounds?.height).toBe(32);
  });

  it('uses provided image object without calling ResourceLoader', () => {
    const mockImg = { width: 64, height: 64 } as HTMLImageElement;
    new Tilemap({
      ...mockProps,
      tileset: mockImg
    });
    expect(ResourceLoader.getImage).not.toHaveBeenCalled();
  });
});
