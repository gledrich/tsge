import RenderComponent from './RenderComponent.js';

/**
 * Component that holds data for rendering a tilemap.
 */
export default class TilemapComponent extends RenderComponent {
  /** The source image for the tileset. */
  tileset: HTMLImageElement;
  /** 2D array of tile indices. */
  data: number[][];
  /** Tile size in pixels. */
  tileSize: number;
  /** Number of columns in the tileset image. */
  tilesetCols: number;

  constructor(tileset: HTMLImageElement, data: number[][], tileSize: number, tilesetCols: number) {
    super();
    this.tileset = tileset;
    this.data = data;
    this.tileSize = tileSize;
    this.tilesetCols = tilesetCols;
  }

  /**
   * Draws the tilemap to the canvas.
   * @param ctx The canvas 2D rendering context.
   */
  draw(ctx: CanvasRenderingContext2D) {
    if (!this.gameObject) return;

    const { position, rotation, scale } = this.gameObject.transform;

    ctx.save();
    ctx.translate(position.x, position.y);
    if (rotation !== 0) ctx.rotate(rotation);
    ctx.scale(scale.x, scale.y);

    for (let y = 0; y < this.data.length; y++) {
      for (let x = 0; x < this.data[y].length; x++) {
        const tileIndex = this.data[y][x];
        if (tileIndex === -1) continue; // Empty tile

        const sourceX = (tileIndex % this.tilesetCols) * this.tileSize;
        const sourceY = Math.floor(tileIndex / this.tilesetCols) * this.tileSize;

        ctx.drawImage(
          this.tileset,
          sourceX,
          sourceY,
          this.tileSize,
          this.tileSize,
          x * this.tileSize, // Drawn relative to translated context
          y * this.tileSize,
          this.tileSize,
          this.tileSize
        );
      }
    }
    
    ctx.restore();
  }
}
