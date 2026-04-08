import Physics from './Physics';
import Rectangle from './Rectangle';
import Circle from './Circle';
import Vector2 from './Vector2';
import PhysicsComponent from './PhysicsComponent';
import GameObject from './GameObject';

describe('Physics', () => {
  describe('checkCollision - Rectangle vs Rectangle', () => {
    it('returns true when rectangles overlap', () => {
      const r1 = new Rectangle({
        position: new Vector2(0, 0),
        width: 50,
        height: 50
      });
      const r2 = new Rectangle({
        position: new Vector2(25, 25),
        width: 50,
        height: 50
      });
      expect(Physics.checkCollision(r1, r2)).toBe(true);
    });

    it('returns false when rectangles do not overlap', () => {
      const r1 = new Rectangle({
        position: new Vector2(0, 0),
        width: 50,
        height: 50
      });
      const r2 = new Rectangle({
        position: new Vector2(100, 100),
        width: 50,
        height: 50
      });
      expect(Physics.checkCollision(r1, r2)).toBe(false);
    });
  });

  describe('checkCollision - Circle vs Circle', () => {
    it('returns true when circles overlap', () => {
      const c1 = new Circle({
        position: new Vector2(0, 0),
        radius: 10
      }); // Center (10, 10)
      const c2 = new Circle({
        position: new Vector2(10, 10),
        radius: 10
      }); // Center (20, 20)
      // Distance approx 14.14 < sum of radii (20)
      expect(Physics.checkCollision(c1, c2)).toBe(true);
    });

    it('returns false when circles do not overlap', () => {
      const c1 = new Circle({
        position: new Vector2(0, 0),
        radius: 10
      }); // Center (10, 10)
      const c2 = new Circle({
        position: new Vector2(30, 30),
        radius: 10
      }); // Center (40, 40)
      // Distance approx 42.4 > 20
      expect(Physics.checkCollision(c1, c2)).toBe(false);
    });
  });

  describe('checkCollision - Circle vs Rectangle', () => {
    it('returns true when circle and rectangle overlap', () => {
      const rect = new Rectangle({
        position: new Vector2(0, 0),
        width: 100,
        height: 100
      });
      const circle = new Circle({
        position: new Vector2(90, 90),
        radius: 20
      }); // Center (110, 110)
      expect(Physics.checkCollision(rect, circle)).toBe(true);
    });

    it('returns false when circle and rectangle do not overlap', () => {
      const rect = new Rectangle({
        position: new Vector2(0, 0),
        width: 50,
        height: 50
      });
      const circle = new Circle({
        position: new Vector2(100, 100),
        radius: 10
      });
      expect(Physics.checkCollision(rect, circle)).toBe(false);
    });
  });

  describe('Collision Resolution', () => {
    it('resolves collision by pushing objects apart', () => {
      const r1 = new Rectangle({
        position: new Vector2(0, 0),
        width: 50,
        height: 50
      });
      const r2 = new Rectangle({
        position: new Vector2(40, 0),
        width: 50,
        height: 50
      });

      // Static objects don't move
      r1.addComponent(new PhysicsComponent());
      r1.getComponent(PhysicsComponent)!.isStatic = true;

      r2.addComponent(new PhysicsComponent());

      const initialR2X = r2.transform.position.x;
      Physics.checkCollision(r1, r2);

      // r2 should have been pushed right
      expect(r2.transform.position.x).toBeGreaterThan(initialR2X);
      // r1 should remain at 0
      expect(r1.transform.position.x).toBe(0);
    });

    it('applies impulse to change velocities on collision', () => {
      const r1 = new Rectangle({
        position: new Vector2(0, 0),
        width: 50,
        height: 50
      });
      const r2 = new Rectangle({
        position: new Vector2(40, 0),
        width: 50,
        height: 50
      });

      const phys1 = new PhysicsComponent();
      phys1.velocity = new Vector2(100, 0);
      r1.addComponent(phys1);

      const phys2 = new PhysicsComponent();
      phys2.velocity = new Vector2(-100, 0);
      r2.addComponent(phys2);

      Physics.checkCollision(r1, r2);

      // With restitution 0.5 (default), they should bounce back
      // Relative velocity was 200. After impulse it should be reversed and scaled by e.
      expect(phys1.velocity.x).toBeLessThan(100);
      expect(phys2.velocity.x).toBeGreaterThan(-100);
    });

    it('respects restitution (bounciness) values', () => {
      const r1 = new Rectangle({ position: new Vector2(0, 0), width: 50, height: 50 });
      const r2 = new Rectangle({ position: new Vector2(40, 0), width: 50, height: 50 });

      const phys1 = new PhysicsComponent();
      phys1.velocity = new Vector2(100, 0);
      phys1.restitution = 1.0; // Perfectly elastic
      r1.addComponent(phys1);

      const phys2 = new PhysicsComponent();
      phys2.velocity = new Vector2(0, 0);
      phys2.restitution = 1.0;
      phys2.isStatic = true;
      r2.addComponent(phys2);

      Physics.checkCollision(r1, r2);

      // Should bounce back with exactly same speed (100 -> -100)
      expect(phys1.velocity.x).toBeCloseTo(-100);
    });

    it('does not resolve collision between two static objects', () => {
      const r1 = new Rectangle({ position: new Vector2(0, 0), width: 50, height: 50 });
      const r2 = new Rectangle({ position: new Vector2(25, 0), width: 50, height: 50 });

      const p1 = new PhysicsComponent(); p1.isStatic = true;
      const p2 = new PhysicsComponent(); p2.isStatic = true;
      r1.addComponent(p1);
      r2.addComponent(p2);

      const pos1 = r1.transform.position.clone();
      const pos2 = r2.transform.position.clone();

      expect(Physics.checkCollision(r1, r2)).toBe(true);
      expect(r1.transform.position.x).toBe(pos1.x);
      expect(r2.transform.position.x).toBe(pos2.x);
    });

    it('does not apply impulse if velocities are separating', () => {
      const r1 = new Rectangle({ position: new Vector2(0, 0), width: 50, height: 50 });
      const r2 = new Rectangle({ position: new Vector2(40, 0), width: 50, height: 50 });

      const phys1 = new PhysicsComponent();
      phys1.velocity = new Vector2(-100, 0); // Moving left, away from r2
      r1.addComponent(phys1);

      const phys2 = new PhysicsComponent();
      phys2.velocity = new Vector2(100, 0); // Moving right, away from r1
      r2.addComponent(phys2);

      Physics.checkCollision(r1, r2);

      expect(phys1.velocity.x).toBe(-100);
      expect(phys2.velocity.x).toBe(100);
    });

    it('resolves collision when only one object has a PhysicsComponent', () => {
      const r1 = new Rectangle({ position: new Vector2(0, 0), width: 50, height: 50 });
      const r2 = new Rectangle({ position: new Vector2(40, 0), width: 50, height: 50 });

      const phys1 = new PhysicsComponent();
      phys1.velocity = new Vector2(100, 0);
      r1.addComponent(phys1);
      // r2 has no PhysicsComponent

      Physics.checkCollision(r1, r2);
      expect(phys1.velocity.x).toBeLessThan(100);

      // Other way around
      const r3 = new Rectangle({ position: new Vector2(0, 0), width: 50, height: 50 });
      const r4 = new Rectangle({ position: new Vector2(40, 0), width: 50, height: 50 });
      const phys4 = new PhysicsComponent();
      phys4.velocity = new Vector2(-100, 0);
      r4.addComponent(phys4);

      Physics.checkCollision(r3, r4);
      expect(phys4.velocity.x).toBeGreaterThan(-100);
    });
  });

  describe('Edge Cases and Branch Coverage', () => {
    it('flips normal correctly in Rect vs Circle', () => {
      const rect = new Rectangle({ position: new Vector2(0, 0), width: 50, height: 50 });
      const circle = new Circle({ position: new Vector2(40, 0), radius: 25 }); // Center (65, 25)

      const manifold = Physics.getCollisionManifold(rect, circle);
      expect(manifold).not.toBeNull();
      // Direction from rect to circle is positive X
      expect(manifold!.normal.x).toBeGreaterThan(0);
    });

    it('resolves AABB collision on X axis with 0 diff', () => {
      // Objects perfectly aligned on X center.
      // width 50. r1 pos -25 (center 0). r2 pos -20 (center 5). diff.x = 5.
      // To get diff.x = 0, they must have same center X.
      const r1 = new Rectangle({ position: new Vector2(0, 0), width: 50, height: 100 });
      const r2 = new Rectangle({ position: new Vector2(0, 40), width: 50, height: 100 });
      // overlapX = 50. overlapY = 100 - 40 = 60.
      // overlapX < overlapY is TRUE. 50 < 60.
      // diff.x = 0. Hits -1 branch.
      const manifold = Physics.getCollisionManifold(r1, r2);
      expect(manifold!.normal.x).toBe(-1);
    });

    it('resolves AABB collision on Y axis with 0 diff', () => {
      const r1 = new Rectangle({ position: new Vector2(0, 0), width: 100, height: 50 });
      const r2 = new Rectangle({ position: new Vector2(40, 0), width: 100, height: 50 });
      // overlapX = 100 - 40 = 60. overlapY = 50.
      // overlapX < overlapY is FALSE. 60 < 50 is False.
      // diff.y = 0. Hits -1 branch for Y normal.
      const manifold = Physics.getCollisionManifold(r1, r2);
      expect(manifold!.normal.y).toBe(-1);
    });

    it('resolves AABB collision on Y axis if overlaps are equal', () => {
      const r1 = new Rectangle({ position: new Vector2(0, 0), width: 50, height: 50 });
      const r2 = new Rectangle({ position: new Vector2(40, 40), width: 50, height: 50 });
      // overlapX = 50 - 40 = 10. overlapY = 50 - 40 = 10.
      // overlapX < overlapY is FALSE. Hits else branch (Y axis).
      const manifold = Physics.getCollisionManifold(r1, r2);
      expect(manifold!.normal.y).toBe(1);
    });

    it('handles perfectly overlapping circles', () => {
      const c1 = new Circle({ position: new Vector2(0, 0), radius: 10 });
      const c2 = new Circle({ position: new Vector2(0, 0), radius: 10 });
      const manifold = Physics.getCollisionManifold(c1, c2);
      expect(manifold!.normal.y).toBe(1); // Default normal
      expect(manifold!.depth).toBe(20);
    });

    it('resolves AABB collision on Y axis if it is the axis of least penetration', () => {
      const r1 = new Rectangle({ position: new Vector2(0, 0), width: 100, height: 50 });
      const r2 = new Rectangle({ position: new Vector2(0, 40), width: 100, height: 50 });
      // X overlap is 100, Y overlap is 10. Normal should be (0, 1)
      const manifold = Physics.getCollisionManifold(r1, r2);
      expect(manifold!.normal.x).toBe(0);
      expect(manifold!.normal.y).toBe(1);
    });

    it('resolves AABB collision on X axis if it is the axis of least penetration', () => {
      const r1 = new Rectangle({ position: new Vector2(0, 0), width: 50, height: 100 });
      const r2 = new Rectangle({ position: new Vector2(40, 0), width: 50, height: 100 });
      // X overlap is 10, Y overlap is 100. Normal should be (1, 0)
      const manifold = Physics.getCollisionManifold(r1, r2);
      expect(manifold!.normal.x).toBe(1);
      expect(manifold!.normal.y).toBe(0);

      // Test negative X direction
      const r3 = new Rectangle({ position: new Vector2(0, 0), width: 50, height: 100 });
      const r4 = new Rectangle({ position: new Vector2(-40, 0), width: 50, height: 100 });
      const manifold2 = Physics.getCollisionManifold(r3, r4);
      expect(manifold2!.normal.x).toBe(-1);
    });

    it('resolves AABB collision on Y axis with negative direction', () => {
      const r1 = new Rectangle({ position: new Vector2(0, 0), width: 100, height: 50 });
      const r2 = new Rectangle({ position: new Vector2(0, -40), width: 100, height: 50 });
      const manifold = Physics.getCollisionManifold(r1, r2);
      expect(manifold!.normal.y).toBe(-1);

      // Test positive Y direction
      const r3 = new Rectangle({ position: new Vector2(0, 0), width: 100, height: 50 });
      const r4 = new Rectangle({ position: new Vector2(0, 40), width: 100, height: 50 });
      const manifold2 = Physics.getCollisionManifold(r3, r4);
      expect(manifold2!.normal.y).toBe(1);
    });

    it('returns null for AABBs that only overlap on X axis', () => {
      const r1 = new Rectangle({ position: new Vector2(0, 0), width: 50, height: 50 });
      const r2 = new Rectangle({ position: new Vector2(0, 100), width: 50, height: 50 });
      expect(Physics.getCollisionManifold(r1, r2)).toBeNull();
    });

    it('returns early when single-object velocities are already separating', () => {
      const r1 = new Rectangle({ position: new Vector2(0, 0), width: 50, height: 50 });
      const r2 = new Rectangle({ position: new Vector2(40, 0), width: 50, height: 50 });

      const phys1 = new PhysicsComponent();
      phys1.velocity = new Vector2(-100, 0); // Moving left, away from r2
      r1.addComponent(phys1);

      const initialVel = phys1.velocity.clone();
      Physics.checkCollision(r1, r2);

      expect(phys1.velocity.x).toBe(initialVel.x);
    });

    it('handles circle centered inside rectangle (all edges)', () => {
      const rect = new Rectangle({ position: new Vector2(0, 0), width: 100, height: 100 });

      // Closer to left
      const cLeft = new Circle({ position: new Vector2(0, 40), radius: 10 }); // Center (10, 50)
      let m = Physics.getCollisionManifold(cLeft, rect);
      expect(m!.normal.x).toBe(-1);

      // Closer to right
      const cRight = new Circle({ position: new Vector2(80, 40), radius: 10 }); // Center (90, 50)
      m = Physics.getCollisionManifold(cRight, rect);
      expect(m!.normal.x).toBe(1);

      // Closer to top
      const cTop = new Circle({ position: new Vector2(40, 0), radius: 10 }); // Center (50, 10)
      m = Physics.getCollisionManifold(cTop, rect);
      expect(m!.normal.y).toBe(-1);

      // Closer to bottom
      const cBottom = new Circle({ position: new Vector2(40, 80), radius: 10 }); // Center (50, 90)
      m = Physics.getCollisionManifold(cBottom, rect);
      expect(m!.normal.y).toBe(1);
    });

    it('handles collision where one object has no bounds component', () => {
      class NoBoundsObject extends GameObject { }
      const o1 = new NoBoundsObject('o1', 0);
      o1.transform.position = new Vector2(10, 10);

      const o2 = new Rectangle({ position: new Vector2(0, 0), width: 100, height: 100 });

      // o1 has no bounds (w1=0, h1=0). o2 has width 100, height 100.
      // center1 = (10, 10). center2 = (50, 50). diff = (40, 40).
      // overlapX = (0 + 50) - 40 = 10.
      // overlapY = (0 + 50) - 40 = 10.
      // Both positive
      const manifold = Physics.getCollisionManifold(o1, o2);
      expect(manifold).not.toBeNull();
      expect(manifold!.depth).toBe(10);
    });

    it('handles objects without bounds components', () => {
      class RawObject extends GameObject { }
      const o1 = new RawObject('o1', 0);
      const o2 = new RawObject('o2', 0);
      o1.transform.position = new Vector2(0, 0);
      o2.transform.position = new Vector2(0, 0);

      // Both at same pos, no bounds = width/height 0. Should return null or handle gracefully.
      expect(Physics.getCollisionManifold(o1, o2)).toBeNull();
    });
  });
});
