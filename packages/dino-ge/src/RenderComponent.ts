import Component from './Component.js';

/**
 * Base class for all rendering-related components.
 */
export default abstract class RenderComponent extends Component {
  /**
   * The actual rendering logic.
   * @param ctx The canvas 2D rendering context.
   */
  abstract draw(ctx: CanvasRenderingContext2D): void;
}
