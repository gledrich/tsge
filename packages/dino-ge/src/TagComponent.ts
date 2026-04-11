import Component from './Component.js';
import Engine from './Engine.js';

/**
 * Component that holds metadata like tags and rendering order.
 */
export default class TagComponent extends Component {
  /** A unique identifier for the object type. */
  tag: string;
  private _zIndex: number;

  /** Rendering order (lower is background, higher is foreground). */
  get zIndex(): number { return this._zIndex; }
  set zIndex(val: number) {
    if (this._zIndex !== val) {
      this._zIndex = val;
      Engine.zOrderDirty = true;
    }
  }

  constructor(tag: string = 'obj', zIndex: number = 0) {
    super();
    this.tag = tag;
    this._zIndex = zIndex;
  }
}
