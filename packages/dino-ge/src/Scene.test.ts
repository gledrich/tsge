import Scene from './Scene';
import GameObject from './GameObject';

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
});
