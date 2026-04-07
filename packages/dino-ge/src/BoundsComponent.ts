import Component from './Component.js';

/**
 * Component that holds the width and height of an entity.
 */
export default class BoundsComponent extends Component {
  /** Width in pixels. */
  public width: number;
  /** Height in pixels. */
  public height: number;

  constructor(width: number = 0, height: number = 0) {
    super();
    this.width = width;
    this.height = height;
  }
}
