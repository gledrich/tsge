/**
 * Handles asynchronous loading of assets like images.
 */
export default class ResourceLoader {
  private static assets: Map<string, HTMLImageElement> = new Map();
  private static loadingQueue: Set<string> = new Set();
  private static totalToLoad: number = 0;
  private static loadedCount: number = 0;

  /**
   * Queue an image for loading.
   * @param tag Unique tag to reference the image later.
   * @param src Path to the image file.
   */
  static queueImage(tag: string, src: string) {
    if (this.assets.has(tag)) return;
    
    // Check if tag already exists in queue
    const isAlreadyQueued = Array.from(this.loadingQueue).some(item => JSON.parse(item).tag === tag);
    if (isAlreadyQueued) return;

    this.loadingQueue.add(JSON.stringify({ tag, src }));
    this.totalToLoad++;
  }

  /**
   * Start loading all queued assets.
   * @param onProgress Optional callback for loading progress updates.
   */
  static async loadAll(onProgress?: (percent: number) => void): Promise<void> {
    if (this.loadingQueue.size === 0) return Promise.resolve();

    const promises = Array.from(this.loadingQueue).map(item => {
      const { tag, src } = JSON.parse(item);
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          this.assets.set(tag, img);
          this.loadedCount++;
          if (onProgress) {
            onProgress((this.loadedCount / this.totalToLoad) * 100);
          }
          resolve();
        };
        img.onerror = () => {
          console.error(`Failed to load asset: ${src}`);
          reject();
        };
      });
    });

    await Promise.all(promises);
    this.loadingQueue.clear();
    this.totalToLoad = 0;
    this.loadedCount = 0;
  }

  /**
   * Get a loaded asset by its tag.
   * @param tag The tag used when queuing the asset.
   * @returns The loaded HTMLImageElement.
   */
  static getImage(tag: string): HTMLImageElement {
    const asset = this.assets.get(tag);
    if (!asset) {
      throw new Error(`Asset not found: ${tag}. Make sure it is queued and loaded.`);
    }
    return asset;
  }
}
