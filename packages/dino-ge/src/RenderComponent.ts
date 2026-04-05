import Component from './Component.js';

/**
 * Base class for all rendering-related components.
 */
export default abstract class RenderComponent extends Component {
  /** Internal flag to identify rendering components across module instances. */
  public readonly isRenderComponent: boolean = true;

  /**
   * The actual rendering logic moved from GameObject.
   * @param ctx The canvas 2D rendering context.
   */
  abstract draw(ctx: CanvasRenderingContext2D): void;
}
