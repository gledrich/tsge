import Engine from "./Engine.js";

export default abstract class GameObject {
  tag: string;
  zIndex: string;

  constructor(tag: string, zIndex: string) {
    this.tag = tag;
    this.zIndex = zIndex;
  }

  registerSelf() {
    Engine.registerObject(this);
  }

  destroySelf() {
    Engine.destroyObject(this);
  }
}
