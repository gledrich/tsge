import Sprite from './Sprite';
import Vector2 from './Vector2';
import Engine from './Engine';
import SpriteComponent from './SpriteComponent';

jest.mock('./Loader', () => {
  const mockImg = new Image();
  mockImg.width = 100;
  mockImg.height = 100;
  return {
    __esModule: true,
    default: {
      getImage: jest.fn(() => mockImg)
    }
  };
});

jest.mock('./Engine', () => ({
  __esModule: true,
  default: {
    registerObject: jest.fn(),
    destroyObject: jest.fn()
  }
}));

describe('Sprite', () => {
  const mockProps = {
    tag: 'player',
    img: 'dino',
    rows: 1,
    cols: 10,
    position: new Vector2(0, 0),
    startCol: 0,
    endCol: 5
  };

  it('initialises correctly', () => {
    const sprite = new Sprite(mockProps);
    expect(sprite.metadata.tag).toBe('player');
    expect(sprite.rows).toBe(1);
    expect(sprite.cols).toBe(10);
    expect(sprite.hasComponent(SpriteComponent)).toBe(true);
  });

  it('synchronises properties with SpriteComponent', () => {
    const sprite = new Sprite(mockProps);
    sprite.flip = true;
    expect(sprite.getComponent(SpriteComponent)!.flip).toBe(true);
    
    sprite.currentFrame = 3;
    expect(sprite.getComponent(SpriteComponent)!.currentFrame).toBe(3);
  });

  it('registers with engine on play', () => {
    const sprite = new Sprite(mockProps);
    sprite.play();
    expect(Engine.registerObject).toHaveBeenCalledWith(sprite);
    expect(sprite.registered).toBe(true);
  });

  it('destroys from engine on stop', () => {
    const sprite = new Sprite(mockProps);
    sprite.play();
    sprite.stop();
    expect(Engine.destroyObject).toHaveBeenCalledWith(sprite);
  });
});
