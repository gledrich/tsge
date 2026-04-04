import GameObject from './GameObject.js';

export default abstract class Scene {
  public objects: Set<GameObject> = new Set();

  onLoad(): void {}
  update(): void {}

  add(object: GameObject) {
    this.objects.add(object);
  }

  remove(object: GameObject) {
    this.objects.delete(object);
  }

  clear() {
    this.objects.clear();
  }
}
