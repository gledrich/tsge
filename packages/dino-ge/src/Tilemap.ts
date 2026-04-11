import GameObject from './GameObject.js';
import Vector2 from './Vector2.js';
import ResourceLoader from './Loader.js';
import TilemapComponent from './TilemapComponent.js';

/**
 * Properties for creating a new Tilemap.
 */
export interface TilemapProps {
  /** Unique tag for the object. */
  tag?: string;
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
  zIndex?: number;
}

const defaultProps = {
  tag: 'tilemap',
  zIndex: 0
};

/**
 * Represents a grid-based map rendered from a tileset.
 */
export default class Tilemap extends GameObject {
  /** The source image for the tileset. */
  public tileset: HTMLImageElement;
  /** 2D array of tile indices. */
  public data: number[][];
  /** Tile size in pixels. */
  public tileSize: number;
  /** Number of columns in the tileset image. */
  public tilesetCols: number;

  /**
   * Initializes a new instance of a Tilemap.
   * @param props Configuration properties for the tilemap.
   */
  constructor(props: TilemapProps) {
    super(props.tag || defaultProps.tag, props.zIndex || defaultProps.zIndex);

    if (typeof props.tileset === 'string') {
      this.tileset = ResourceLoader.getImage(props.tileset);
    } else {
      this.tileset = props.tileset;
    }

    this.data = props.data;
    this.tileSize = props.tileSize;
    this.tilesetCols = props.tilesetCols;

    this.transform.position = props.position;

    // TilemapComponent will automatically create/update BoundsComponent via onAttach
    this.addComponent(new TilemapComponent(
      this.tileset,
      this.data,
      this.tileSize,
      this.tilesetCols
    ));

    this.registerSelf();
  }
}
