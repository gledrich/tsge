import System from './System.js';
import type GameObject from './GameObject.js';
import RenderComponent from './RenderComponent.js';
import VisibilityComponent from './VisibilityComponent.js';
import Engine from './Engine.js';

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

    // Sort entities by zIndex for correct draw order
    const sorted = Array.from(entities).sort((a, b) => (a.zIndex > b.zIndex ? 1 : -1));

    sorted.forEach((object) => {
      // Frustum Culling
      if (
        object.position.x < bounds.x + bounds.width &&
        object.position.x + object.width > bounds.x &&
        object.position.y < bounds.y + bounds.height &&
        object.position.y + object.height > bounds.y
      ) {
        // Find any RenderComponent on the entity
        const renderable = object.getComponent(RenderComponent);
        const visibility = object.getComponent(VisibilityComponent);
        const isVisible = visibility ? visibility.visible : true;

        if (renderable && isVisible) {
          renderable.draw(this.ctx);
        }
        
        // Backward compatibility: call draw() if it exists on the object itself
        const legacyObj = object as unknown as { draw?: (ctx: CanvasRenderingContext2D) => void };
        if (legacyObj.draw && !(object.getComponent(RenderComponent))) {
           legacyObj.draw(this.ctx);
        }

        // Draw debug overlays in world space
        if (debug) {
          this.ctx.save();
          this.ctx.strokeStyle = object === Engine.selectedObject ? '#00ff00' : 'red';
          this.ctx.lineWidth = (object === Engine.selectedObject ? 2 : 1) / Engine.camera.zoom;
          this.ctx.strokeRect(object.position.x, object.position.y, object.width, object.height);

          this.ctx.font = `${12 / Engine.camera.zoom}px monospace`;
          this.ctx.fillStyle = this.ctx.strokeStyle;
          this.ctx.fillText(object.tag || 'obj', object.position.x, object.position.y - (5 / Engine.camera.zoom));
          this.ctx.restore();
        }
      }
    });

    this.ctx.restore();
  }
}
