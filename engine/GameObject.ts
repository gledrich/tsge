import Engine from './Engine.js';
import Vector2 from './Vector2.js';

export default abstract class GameObject {
  tag: string;
  zIndex: string;

  constructor(tag: string, zIndex: string) {
    this.tag = tag;
    this.zIndex = zIndex;
  }

  abstract get position(): Vector2;
  abstract get width(): number;
  abstract get height(): number;

  hasCollided(obj: GameObject): boolean {
    return (
      this.position.x < obj.position.x + obj.width &&
      this.position.x + this.width > obj.position.x &&
      this.position.y < obj.position.y + obj.height &&
      this.position.y + this.height > obj.position.y
    );
  }

  abstract draw(ctx: CanvasRenderingContext2D): void;

  registerSelf() {
    Engine.registerObject(this);
  }

  destroySelf() {
    Engine.destroyObject(this);
  }
}
