import Component from './Component.js';

/**
 * Component that holds metadata like tags and rendering order.
 */
export default class TagComponent extends Component {
  /** A unique identifier for the object type. */
  tag: string;
  /** Rendering order (lower is background, higher is foreground). */
  zIndex: number;

  constructor(tag: string = 'obj', zIndex: number = 0) {
    super();
    this.tag = tag;
    this.zIndex = zIndex;
  }
}
