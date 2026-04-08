import Group from './Group';
import GameObject from './GameObject';
import Engine from './Engine';

jest.mock('./Engine', () => ({
  __esModule: true,
  default: {
    registerObject: jest.fn(),
    currentScene: null,
    objects: new Set()
  }
}));

describe('Group', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be an instance of GameObject', () => {
    const group = new Group();
    expect(group).toBeInstanceOf(GameObject);
  });

  it('should have default tag "group" and zIndex 0', () => {
    const group = new Group();
    expect(group.metadata.tag).toBe('group');
    expect(group.metadata.zIndex).toBe(0);
  });

  it('should accept custom tag and zIndex', () => {
    const group = new Group('my-group', 10);
    expect(group.metadata.tag).toBe('my-group');
    expect(group.metadata.zIndex).toBe(10);
  });

  it('should register itself with the engine upon creation', () => {
    new Group();
    expect(Engine.registerObject).toHaveBeenCalled();
  });
});
