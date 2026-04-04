import Engine from './Engine.js';
import Vector2 from './Vector2.js';
import Circle from './Circle.js';

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

  hasCollided(obj: GameObject): boolean {
    const thisIsCircle = this instanceof Circle;
    const objIsCircle = obj instanceof Circle;

    // Circle vs Circle
    if (thisIsCircle && objIsCircle) {
      const dist = Vector2.distance((this as any).center, (obj as any).center);
      return dist < (this as any).radius + (obj as any).radius;
    }

    // Circle vs Rectangle (Exactly one is a circle)
    if (thisIsCircle || objIsCircle) {
      const circle = (thisIsCircle ? this : obj) as any;
      const rect = (thisIsCircle ? obj : this);

      // Find the closest point to the circle within the rectangle
      const closestX = Math.max(rect.position.x, Math.min(circle.center.x, rect.position.x + rect.width));
      const closestY = Math.max(rect.position.y, Math.min(circle.center.y, rect.position.y + rect.height));

      const distance = Vector2.distance(circle.center, new Vector2(closestX, closestY));
      return distance < circle.radius;
    }

    // Standard AABB (Rect vs Rect)
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
