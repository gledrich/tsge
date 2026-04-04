import Engine from "./Engine.js";

export default abstract class GameObject {
  tag: string;
  zIndex: string;

  constructor(tag: string, zIndex: string) {
    this.tag = tag;
    this.zIndex = zIndex;
  }

  abstract draw(ctx: CanvasRenderingContext2D): void;

  registerSelf() {
    Engine.registerObject(this);
  }

  destroySelf() {
    Engine.destroyObject(this);
  }
}
