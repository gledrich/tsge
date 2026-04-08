import GameObject from './GameObject.js';

/**
 * A non-rendering GameObject that can be used to group other objects together
 * within the scene hierarchy.
 */
export default class Group extends GameObject {
  constructor(tag: string = 'group', zIndex: number = 0) {
    super(tag, zIndex);
    this.registerSelf();
  }
}
