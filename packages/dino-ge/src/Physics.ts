import Vector2 from './Vector2.js';
import GameObject from './GameObject.js';
import Circle from './Circle.js';

/**
 * Utility class for collision detection between game objects.
 */
export default class Physics {
  /**
   * Checks if two game objects are colliding.
   /**
    * Checks if two game objects are colliding and resolves it if not static.
    * @param obj1 First object.
    * @param obj2 Second object.
    * @returns True if the objects are colliding.
    */
   static checkCollision(obj1: GameObject, obj2: GameObject): boolean {
     const isCircle1 = obj1 instanceof Circle;
     const isCircle2 = obj2 instanceof Circle;
     let isColliding = false;

     if (isCircle1 && isCircle2) {
       const c1 = obj1 as Circle;
       const c2 = obj2 as Circle;
       isColliding = Vector2.distance(c1.center, c2.center) < c1.radius + c2.radius;
     } else if (isCircle1 || isCircle2) {
       const circle = (isCircle1 ? obj1 : obj2) as Circle;
       const rect = (isCircle1 ? obj2 : obj1);
       const closestX = Math.max(rect.position.x, Math.min(circle.center.x, rect.position.x + rect.width));
       const closestY = Math.max(rect.position.y, Math.min(circle.center.y, rect.position.y + rect.height));
       isColliding = Vector2.distance(circle.center, new Vector2(closestX, closestY)) < circle.radius;
     } else {
       isColliding = (
         obj1.position.x < obj2.position.x + obj2.width &&
         obj1.position.x + obj1.width > obj2.position.x &&
         obj1.position.y < obj2.position.y + obj2.height &&
         obj1.position.y + obj1.height > obj2.position.y
       );
     }

     if (isColliding && (!obj1.isStatic || !obj2.isStatic)) {
       this.resolveCollision(obj1, obj2);
     }

     return isColliding;
   }
  private static resolveCollision(obj1: GameObject, obj2: GameObject) {
    // Calculate overlap
    const overlapX = Math.min(
      obj1.position.x + obj1.width - obj2.position.x,
      obj2.position.x + obj2.width - obj1.position.x
    );
    const overlapY = Math.min(
      obj1.position.y + obj1.height - obj2.position.y,
      obj2.position.y + obj2.height - obj1.position.y
    );

    // Push apart
    if (overlapX < overlapY) {
      if (obj1.position.x < obj2.position.x) {
        if (!obj1.isStatic) obj1.position.x -= overlapX / 2;
        if (!obj2.isStatic) obj2.position.x += overlapX / 2;
      } else {
        if (!obj1.isStatic) obj1.position.x += overlapX / 2;
        if (!obj2.isStatic) obj2.position.x -= overlapX / 2;
      }
    } else {
      if (obj1.position.y < obj2.position.y) {
        if (!obj1.isStatic) obj1.position.y -= overlapY / 2;
        if (!obj2.isStatic) obj2.position.y += overlapY / 2;
      } else {
        if (!obj1.isStatic) obj1.position.y += overlapY / 2;
        if (!obj2.isStatic) obj2.position.y -= overlapY / 2;
      }
    }
  }
}
