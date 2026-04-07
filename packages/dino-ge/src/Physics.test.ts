import Physics from './Physics';
import Rectangle from './Rectangle';
import Circle from './Circle';
import Vector2 from './Vector2';
import PhysicsComponent from './PhysicsComponent';

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
      
      const initialR2X = r2.position.x;
      Physics.checkCollision(r1, r2);
      
      // r2 should have been pushed right
      expect(r2.position.x).toBeGreaterThan(initialR2X);
      // r1 should remain at 0
      expect(r1.position.x).toBe(0);
    });
  });
});
