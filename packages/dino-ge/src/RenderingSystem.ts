import System from './System.js';
import type GameObject from './GameObject.js';
import RenderComponent from './RenderComponent.js';
import VisibilityComponent from './VisibilityComponent.js';
import Engine from './Engine.js';
import PhysicsComponent from './PhysicsComponent.js';
import Vector2 from './Vector2.js';

/**
 * A system that processes entities with RenderComponents.
 * Handles camera transforms, frustum culling, and drawing.
 */
export default class RenderingSystem extends System {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    super();
    this.ctx = ctx;
  }

  /**
   * Updates the rendering context (used when the engine is re-initialized).
   * @param ctx The new canvas rendering context.
   */
  public setContext(ctx: CanvasRenderingContext2D): void {
    this.ctx = ctx;
  }

  /**
   * Main rendering loop.
   * @param entities The set of entities to process.
   * @param deltaTime Time passed since the last frame (optional).
   * @param debug Whether to draw debug overlays (hitboxes/tags).
   */
  public override update(entities: Set<GameObject>, deltaTime?: number, debug: boolean = false): void {
    const bounds = Engine.camera.getViewportBounds(
      (this.ctx.canvas as HTMLCanvasElement).width,
      (this.ctx.canvas as HTMLCanvasElement).height
    );

    this.ctx.save();

    // Apply camera transform
    this.ctx.scale(Engine.camera.zoom, Engine.camera.zoom);
    this.ctx.translate(-Engine.camera.position.x, -Engine.camera.position.y);

    // Draw Debug Collisions (Briefly)
    if (debug && Engine.showCollisionLines) {
      const now = Date.now();
      const TTL = 500; // 500ms

      // Clean up old collisions
      while (Engine.debugCollisions.length > 0 && now - Engine.debugCollisions[0].timestamp > TTL) {
        Engine.debugCollisions.shift();
      }

      Engine.debugCollisions.forEach(({ manifold, timestamp }) => {
        const { obj1, obj2, normal } = manifold;
        const opacity = 1 - (now - timestamp) / TTL;
        
        // Calculate contact point (approx center between objects along normal)
        const pos1 = obj1.transform.worldPosition;
        const pos2 = obj2.transform.worldPosition;
        const center = new Vector2(
          (pos1.x + pos2.x) / 2,
          (pos1.y + pos2.y) / 2
        );

        this.ctx.save();
        this.ctx.globalAlpha = opacity;
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#ff00ff'; // Magenta for collisions
        this.ctx.lineWidth = 2 / Engine.camera.zoom;
        
        // Draw Normal
        this.ctx.moveTo(center.x, center.y);
        this.ctx.lineTo(center.x + normal.x * 20, center.y + normal.y * 20);
        this.ctx.stroke();

        // Draw Dot at contact
        this.ctx.fillStyle = '#ff00ff';
        this.ctx.beginPath();
        this.ctx.arc(center.x, center.y, 3 / Engine.camera.zoom, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
      });
    }

    // Sort entities by zIndex for correct draw order
    const sorted = Array.from(entities).sort((a, b) => (a.metadata.zIndex > b.metadata.zIndex ? 1 : -1));

    sorted.forEach((object) => {
      const { worldPosition, worldScale } = object.transform;
      const width = (object.bounds?.width ?? 0) * worldScale.x;
      const height = (object.bounds?.height ?? 0) * worldScale.y;

      // Frustum Culling
      if (
        worldPosition.x < bounds.x + bounds.width &&
        worldPosition.x + width > bounds.x &&
        worldPosition.y < bounds.y + bounds.height &&
        worldPosition.y + height > bounds.y
      ) {
        // Find any RenderComponent on the entity
        const renderable = object.getComponent(RenderComponent);
        const visibility = object.getComponent(VisibilityComponent);
        const isVisible = visibility ? visibility.visible : true;

        if (renderable && isVisible) {
          renderable.draw(this.ctx);
        }

        // Draw debug overlays in world space
        if (debug) {
          this.ctx.save();
          this.ctx.strokeStyle = object === Engine.selectedObject ? '#00ff00' : 'red';
          this.ctx.lineWidth = (object === Engine.selectedObject ? 2 : 1) / Engine.camera.zoom;
          this.ctx.strokeRect(worldPosition.x, worldPosition.y, width, height);

          // Draw resize handle if selected
          if (object === Engine.selectedObject) {
            const handleSize = 8 / Engine.camera.zoom;
            this.ctx.fillStyle = '#FFD166';
            this.ctx.fillRect(
              worldPosition.x + width - handleSize / 2,
              worldPosition.y + height - handleSize / 2,
              handleSize,
              handleSize
            );
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 1 / Engine.camera.zoom;
            this.ctx.strokeRect(
              worldPosition.x + width - handleSize / 2,
              worldPosition.y + height - handleSize / 2,
              handleSize,
              handleSize
            );
          }

          this.ctx.font = `${12 / Engine.camera.zoom}px monospace`;
          this.ctx.fillStyle = this.ctx.strokeStyle;
          this.ctx.fillText(object.metadata.tag || 'obj', worldPosition.x, worldPosition.y - (5 / Engine.camera.zoom));

          // Draw Physics Vectors
          const physics = object.getComponent(PhysicsComponent);
          if (physics && Engine.showPhysicsVectors) {
            const centerX = worldPosition.x + width / 2;
            const centerY = worldPosition.y + height / 2;

            // Velocity (Blue)
            if (physics.velocity.x !== 0 || physics.velocity.y !== 0) {
              this.ctx.beginPath();
              this.ctx.strokeStyle = '#00bbff';
              this.ctx.moveTo(centerX, centerY);
              this.ctx.lineTo(centerX + physics.velocity.x, centerY + physics.velocity.y);
              this.ctx.stroke();
            }

            // Acceleration (Orange)
            if (physics.acceleration.x !== 0 || physics.acceleration.y !== 0) {
              this.ctx.beginPath();
              this.ctx.strokeStyle = '#ff9900';
              this.ctx.moveTo(centerX, centerY);
              this.ctx.lineTo(centerX + physics.acceleration.x, centerY + physics.acceleration.y);
              this.ctx.stroke();
            }
          }

          this.ctx.restore();
        }
      }
    });

    this.ctx.restore();
  }
}
