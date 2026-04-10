import Engine from './Engine.js';
import GameObject from './GameObject.js';
import Vector2 from './Vector2.js';
import ResourceLoader from './Loader.js';
import SpriteComponent from './SpriteComponent.js';
import BoundsComponent from './BoundsComponent.js';

/**
 * Properties for creating a new Sprite.
 */
export interface SpriteProps {
  /** Unique tag for the object. */
  tag: string;
  /** Image element or tag from ResourceLoader. */
  img: HTMLImageElement | string;
  /** Number of rows in the spritesheet. */
  rows: number;
  /** Number of columns in the spritesheet. */
  cols: number;
  /** Initial world position. */
  position: Vector2;
  /** Starting frame column for animation. */
  startCol: number;
  /** Ending frame column for animation. */
  endCol: number;
  /** Rendering order. */
  zIndex?: number;
  /** Scale of the sprite (defaults to 1). */
  scale?: number | Vector2;
}

/**
 * Represents an animated sprite using a spritesheet.
 */
export default class Sprite extends GameObject {
  /** Internal sprite component for rendering and animation. */
  private _spriteComponent: SpriteComponent;

  /** The source image for the sprite. */
  get img(): HTMLImageElement { return this._spriteComponent.img; }
  set img(val: HTMLImageElement) { this._spriteComponent.img = val; }

  /** Number of rows in the spritesheet. */
  get rows(): number { return this._spriteComponent.rows; }
  set rows(val: number) { this._spriteComponent.rows = val; }

  /** Number of columns in the spritesheet. */
  get cols(): number { return this._spriteComponent.cols; }
  set cols(val: number) { this._spriteComponent.cols = val; }

  /** The starting column for the current animation loop. */
  get startCol(): number { return this._spriteComponent.startCol; }
  set startCol(val: number) { this._spriteComponent.startCol = val; }

  /** The ending column for the current animation loop. */
  get endCol(): number { return this._spriteComponent.endCol; }
  set endCol(val: number) { this._spriteComponent.endCol = val; }

  /** The pixel width of a single animation frame (calculated automatically). */
  get frameWidth(): number { return this._spriteComponent.frameWidth; }
  /** The pixel height of a single animation frame (calculated automatically). */
  get frameHeight(): number { return this._spriteComponent.frameHeight; }

  /** Whether the sprite is currently registered with the engine. */
  registered: boolean = false;

  /** The current frame index being displayed. */
  get currentFrame(): number { return this._spriteComponent.currentFrame; }
  set currentFrame(val: number) { this._spriteComponent.currentFrame = val; }

  /** Whether the sprite is horizontally flipped. */
  get flip(): boolean { return this._spriteComponent.flip; }
  set flip(val: boolean) { this._spriteComponent.flip = val; }

  /** Duration of each animation frame in milliseconds. */
  get frameDuration(): number { return this._spriteComponent.frameDuration; }
  set frameDuration(val: number) { this._spriteComponent.frameDuration = val; }

  /**
   * Gets or sets the scale of the sprite.
   * Updating this will also update the object's bounds.
   */
  get scale(): Vector2 { return this.transform.scale; }
  set scale(val: number | Vector2) {
    if (typeof val === 'number') {
      this.transform.scale = new Vector2(val, val);
    } else {
      this.transform.scale = val;
    }
    this._updateBounds();
  }

  constructor(props: SpriteProps) {
    if (!props.tag) {
      throw new Error('You must provide a tag for a Sprite');
    }

    super(props.tag, props.zIndex || 1);

    let img: HTMLImageElement;
    if (typeof props.img === 'string') {
      img = ResourceLoader.getImage(props.img);
    } else {
      img = props.img;
    }

    this._spriteComponent = new SpriteComponent(
      img,
      props.rows,
      props.cols,
      props.startCol,
      props.endCol
    );
    this.addComponent(this._spriteComponent);

    const scale = props.scale !== undefined ? props.scale : 1;
    if (typeof scale === 'number') {
      this.transform.scale = new Vector2(scale, scale);
    } else {
      this.transform.scale = scale;
    }

    this.bounds = new BoundsComponent(0, 0);
    this.addComponent(this.bounds);

    if (img.complete) {
      this._updateBounds();
    } else {
      img.addEventListener('load', () => this._updateBounds(), { once: true });
    }

    this.transform.position = props.position;
    this.registered = false;
  }

  /**
   * Updates the bounds of the sprite based on its current frame size and scale.
   * @private
   */
  private _updateBounds() {
    if (this.bounds) {
      this.bounds.width = this.frameWidth * this.transform.scale.x;
      this.bounds.height = this.frameHeight * this.transform.scale.y;
    }
  }

  /**
   * Registers the sprite with the engine and starts its animation loop.
   */
  play() {
    this._spriteComponent.playing = true;
    if (!this.registered) {
      Engine.registerObject(this);
      this.registered = true;
    }
  }

  /**
   * Stops the sprite's animation and removes it from the engine.
   */
  stop() {
    this._spriteComponent.playing = false;
    Engine.destroyObject(this);
  }
}
