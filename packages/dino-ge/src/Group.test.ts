import Group from './Group';
import GameObject from './GameObject';
import Engine from './Engine';
import Registry from './Registry';

describe('Group', () => {
  beforeEach(() => {
    Engine.resetState();
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
    const spy = jest.spyOn(Registry, 'registerObject');
    const group = new Group();
    expect(spy).toHaveBeenCalledWith(group);
  });
});
