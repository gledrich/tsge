import Scene from './Scene.js';
import GameObject from './GameObject.js';

class MockScene extends Scene {}
class MockGameObject extends GameObject {}

describe('Scene', () => {
  it('manages game objects correctly', () => {
    const scene = new MockScene();
    const obj1 = new MockGameObject('test1', 0);
    const obj2 = new MockGameObject('test2', 0);
    
    scene.add(obj1);
    scene.add(obj2);
    expect(scene.objects.size).toBe(2);
    expect(scene.objects.has(obj1)).toBe(true);
    
    scene.remove(obj1);
    expect(scene.objects.size).toBe(1);
    expect(scene.objects.has(obj1)).toBe(false);
    
    scene.clear();
    expect(scene.objects.size).toBe(0);
  });

  it('provides default lifecycle methods', () => {
    const scene = new MockScene();
    // These should not throw even if they are empty
    scene.onLoad();
    scene.update();
  });
});
