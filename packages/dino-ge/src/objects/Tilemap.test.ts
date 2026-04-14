import Tilemap, { TilemapProps } from './Tilemap.js';
import Vector2 from '../math/Vector2.js';
import ResourceLoader from '../core/Loader.js';
import TilemapComponent from '../components/TilemapComponent.js';
import BoundsComponent from '../components/BoundsComponent.js';
import Engine from '../core/Engine.js';
import Registry from '../core/Registry.js';

jest.mock('../core/Loader.js', () => ({
  __esModule: true,
  default: {
    getImage: jest.fn()
  }
}));

describe('Tilemap', () => {
  const mockImg = { width: 32, height: 32 } as HTMLImageElement;
  const mockData = [[1, 0], [0, 1]];
  const mockProps: TilemapProps = {
    tileset: mockImg,
    data: mockData,
    tileSize: 16,
    tilesetCols: 2,
    position: new Vector2(10, 20)
  };

  beforeEach(() => {
    Engine.resetState();
    jest.clearAllMocks();
  });

  it('initialises with an Image element', () => {
    const spy = jest.spyOn(Registry, 'registerObject');
    const tilemap = new Tilemap(mockProps);
    
    expect(tilemap.tileset).toBe(mockImg);
    expect(tilemap.data).toBe(mockData);
    expect(tilemap.tileSize).toBe(16);
    expect(tilemap.tilesetCols).toBe(2);
    expect(tilemap.transform.position.x).toBe(10);
    expect(tilemap.transform.position.y).toBe(20);
    
    // Bounds: 2 tiles * 16px = 32px
    expect(tilemap.bounds?.width).toBe(32);
    expect(tilemap.bounds?.height).toBe(32);
    
    expect(tilemap.hasComponent(BoundsComponent)).toBe(true);
    expect(tilemap.hasComponent(TilemapComponent)).toBe(true);
    expect(spy).toHaveBeenCalledWith(tilemap);
  });

  it('initialises with a tileset tag from ResourceLoader', () => {
    (ResourceLoader.getImage as jest.Mock).mockReturnValue(mockImg);
    
    const propsWithTag: TilemapProps = {
      ...mockProps,
      tileset: 'tiles-tag'
    };
    
    const tilemap = new Tilemap(propsWithTag);
    
    expect(ResourceLoader.getImage).toHaveBeenCalledWith('tiles-tag');
    expect(tilemap.tileset).toBe(mockImg);
  });

  it('uses provided tag and zIndex', () => {
    const props: TilemapProps = {
      ...mockProps,
      tag: 'level-1',
      zIndex: -1
    };
    
    const tilemap = new Tilemap(props);
    
    expect(tilemap.metadata.tag).toBe('level-1');
    expect(tilemap.metadata.zIndex).toBe(-1);
  });
});
