import Component from '../core/Component.js';

/**
 * Component that determines whether an object should be rendered.
 */
export default class VisibilityComponent extends Component {
  /** Whether the object should be rendered. */
  visible: boolean;

  constructor(visible: boolean = true) {
    super();
    this.visible = visible;
  }
}
