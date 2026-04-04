import Vector2 from './Vector2.js';
import GameObject from './GameObject.js';
import Circle from './Circle.js';

/**
 * Utility class for collision detection between game objects.
 */
export default class Physics {
  /**
   * Checks if two game objects are colliding.
   * Supports Circle-Circle, Circle-Rectangle, and Rectangle-Rectangle (AABB) collisions.
   * @param obj1 First object.
   * @param obj2 Second object.
   * @returns True if the objects are colliding.
   */
  static checkCollision(obj1: GameObject, obj2: GameObject): boolean {
    const isCircle1 = obj1 instanceof Circle;
    const isCircle2 = obj2 instanceof Circle;

    // Circle vs Circle
    if (isCircle1 && isCircle2) {
      const c1 = obj1 as Circle;
      const c2 = obj2 as Circle;
      const dist = Vector2.distance(c1.center, c2.center);
      return dist < c1.radius + c2.radius;
    }

    // Circle vs Rectangle (Exactly one is a circle)
    if (isCircle1 || isCircle2) {
      const circle = (isCircle1 ? obj1 : obj2) as Circle;
      const rect = (isCircle1 ? obj2 : obj1);

      // Find the closest point to the circle within the rectangle
      const closestX = Math.max(rect.position.x, Math.min(circle.center.x, rect.position.x + rect.width));
      const closestY = Math.max(rect.position.y, Math.min(circle.center.y, rect.position.y + rect.height));

      const distance = Vector2.distance(circle.center, new Vector2(closestX, closestY));
      return distance < circle.radius;
    }

    // Standard AABB (Rect vs Rect)
    return (
      obj1.position.x < obj2.position.x + obj2.width &&
      obj1.position.x + obj1.width > obj2.position.x &&
      obj1.position.y < obj2.position.y + obj2.height &&
      obj1.position.y + obj1.height > obj2.position.y
    );
  }
}
