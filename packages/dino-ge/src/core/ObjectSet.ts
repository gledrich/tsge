import type GameObject from './GameObject.js';

/**
 * A specialised Set for managing GameObjects with tag-based lookups.
 */
export class ObjectSet extends Set<GameObject> {
  /**
   * Finds all objects with a specific tag.
   * @param tag The tag to filter by. If omitted, returns all objects.
   */
  findAll(tag?: string): GameObject[] {
    if (!tag) return Array.from(this);
    return Array.from(this).filter((obj) => obj.metadata.tag === tag);
  }
}
