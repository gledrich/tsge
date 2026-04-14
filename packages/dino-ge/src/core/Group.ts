import GameObject from './GameObject.js';

/**
 * A non-rendering GameObject that can be used to group other objects together
 * within the scene hierarchy.
 */
export default class Group extends GameObject {
  /**
   * Initializes a new instance of a Group.
   * @param tag A descriptive name for the group.
   * @param zIndex The rendering order (higher numbers are drawn on top).
   */
  constructor(tag: string = 'group', zIndex: number = 0) {
    super(tag, zIndex);
    this.registerSelf();
  }
}
