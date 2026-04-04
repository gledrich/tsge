import Engine from './Engine.js';
import Vector2 from './Vector2.js';

export default abstract class GameObject {
  tag: string;
  zIndex: string;
  velocity: Vector2 = new Vector2(0, 0);
  acceleration: Vector2 = new Vector2(0, 0);

  constructor(tag: string, zIndex: string) {
    this.tag = tag;
    this.zIndex = zIndex;
  }

  abstract get position(): Vector2;
  abstract get width(): number;
  abstract get height(): number;

  abstract draw(ctx: CanvasRenderingContext2D): void;

  registerSelf() {
    Engine.registerObject(this);
  }

  destroySelf() {
    Engine.destroyObject(this);
  }
}
