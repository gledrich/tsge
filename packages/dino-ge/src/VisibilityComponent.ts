import Component from './Component.js';

/**
 * Component that determines whether an object should be rendered.
 */
export default class VisibilityComponent extends Component {
  /** Whether the object should be rendered. */
  visible: boolean = true;
}
