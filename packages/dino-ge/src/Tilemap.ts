import GameObject from './GameObject.js';
import Vector2 from './Vector2.js';
import ResourceLoader from './Loader.js';

/**
 * Properties for creating a new Tilemap.
 */
export interface TilemapProps {
  /** Unique tag for the object. */
  tag: string;
  /** Image element or tag from ResourceLoader. */
  tileset: HTMLImageElement | string;
  /** 2D array of tile indices. */
  data: number[][];
  /** Tile size in pixels. */
  tileSize: number;
  /** Number of columns in the tileset image. */
  tilesetCols: number;
  /** Initial world position. */
  position: Vector2;
  /** Rendering order. */
  zIndex: number;
}

/**
 * Represents a grid-based map rendered from a tileset.
 */
export default class Tilemap extends GameObject {
  /** The source image for the tileset. */
  tileset: HTMLImageElement;
  /** 2D array of tile indices. */
  data: number[][];
  /** Tile size in pixels. */
  tileSize: number;
  /** Number of columns in the tileset image. */
  tilesetCols: number;
  /** The world position of the tilemap. */
  position: Vector2;

  /** Gets the width of the tilemap in pixels. */
  get width(): number {
    return this.data[0].length * this.tileSize;
  }

  /** Gets the height of the tilemap in pixels. */
  get height(): number {
    return this.data.length * this.tileSize;
  }

  constructor(props: TilemapProps) {
    super(props.tag, props.zIndex);

    if (typeof props.tileset === 'string') {
      this.tileset = ResourceLoader.getImage(props.tileset);
    } else {
      this.tileset = props.tileset;
    }

    this.data = props.data;
    this.tileSize = props.tileSize;
    this.tilesetCols = props.tilesetCols;
    this.position = props.position;
    this.registerSelf();
  }

  /**
   * Main rendering method for the tilemap.
   * @param ctx The canvas 2D rendering context.
   */
  draw(ctx: CanvasRenderingContext2D) {
    if (!this.visible) return;

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
          this.position.x + x * this.tileSize,
          this.position.y + y * this.tileSize,
          this.tileSize,
          this.tileSize
        );
      }
    }
  }
}
