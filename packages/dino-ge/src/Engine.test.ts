import Engine from './Engine';
import Scene from './Scene';
import GameObject from './GameObject';

class MockScene extends Scene {
  onLoad = jest.fn();
  update = jest.fn();
}

class MockGameObject extends GameObject {}

describe('Engine', () => {
  beforeEach(() => {
    // Reset global state
    Engine.paused = false;
    Engine.debug = false;
    Engine.selectedObject = null;
    Engine.objects.clear();
    jest.clearAllMocks();
  });

  it('manages singleton state across instances', () => {
    Engine.paused = true;
    expect(Engine.paused).toBe(true);
  });

  it('handles scene transitions correctly', () => {
    const scene = new MockScene();
    Engine.currentScene = scene;
    
    expect(Engine.currentScene).toBe(scene);
    expect(scene.onLoad).toHaveBeenCalled();
  });

  it('provides a global event bus', () => {
    const callback = jest.fn();
    Engine.on('test-event', callback);
    
    Engine.emit('test-event', { foo: 'bar' });
    expect(callback).toHaveBeenCalledTimes(1);
    
    const event = callback.mock.calls[0][0] as CustomEvent;
    expect(event.detail).toEqual({ foo: 'bar' });
    
    Engine.off('test-event', callback);
    Engine.emit('test-event');
    expect(callback).toHaveBeenCalledTimes(1); // Still 1
  });

  it('registers and destroys objects globally if no scene is active', () => {
    // Force no scene
    (Engine as unknown as { _currentScene: Scene | null })._currentScene = null;
    
    const obj = new MockGameObject('test', 0);
    Engine.registerObject(obj);
    expect(Engine.objects.has(obj)).toBe(true);
    
    Engine.destroyObject(obj);
    expect(Engine.objects.has(obj)).toBe(false);
  });

  it('registers and destroys objects within active scene', () => {
    const scene = new MockScene();
    Engine.currentScene = scene;
    
    const obj = new MockGameObject('test', 0);
    Engine.registerObject(obj);
    expect(scene.objects.has(obj)).toBe(true);
    
    Engine.destroyObject(obj);
    expect(scene.objects.has(obj)).toBe(false);
  });
});
