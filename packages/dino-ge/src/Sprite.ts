import Engine from './Engine.js';
import GameObject from './GameObject.js';
import Vector2 from './Vector2.js';
import ResourceLoader from './Loader.js';

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
  zIndex: number;
}

/**
 * Represents an animated sprite using a spritesheet.
 */
export default class Sprite extends GameObject {
  /** The source image for the sprite. */
  img: HTMLImageElement;
  /** Number of rows in the spritesheet. */
  rows: number;
  /** Number of columns in the spritesheet. */
  cols: number;
  /** The world position of the sprite. */
  position: Vector2;
  /** The starting column for the current animation loop. */
  startCol: number;
  /** The ending column for the current animation loop. */
  endCol: number;
  /** The pixel width of a single animation frame (calculated automatically). */
  frameWidth: number = 0;
  /** The pixel height of a single animation frame (calculated automatically). */
  frameHeight: number = 0;
  /** Whether the sprite is currently registered with the engine. */
  registered: boolean = false;
  /** The current frame index being displayed. */
  currentFrame: number = 0;
  /** Whether the sprite is horizontally flipped. */
  flip: boolean = false;
  /** Duration of each animation frame in milliseconds. */
  frameDuration: number = 100;
  #lastFrameUpdate: number = Date.now();

  /**
   * Gets the display width of the sprite (scaled by 3).
   */
  get width(): number {
    return this.frameWidth * 3;
  }

  /**
   * Gets the display height of the sprite (scaled by 3).
   */
  get height(): number {
    return this.frameHeight * 3;
  }

  constructor(props: SpriteProps) {
    if (!props.tag) {
      throw new Error('You must provide a tag for a Sprite');
    }

    super(props.tag, props.zIndex || 1);

    if (typeof props.img === 'string') {
      this.img = ResourceLoader.getImage(props.img);
    } else {
      this.img = props.img;
    }

    this.rows = props.rows;
    this.cols = props.cols;
    this.position = props.position;
    this.startCol = props.startCol;
    this.endCol = props.endCol;
    this.currentFrame = props.startCol || 0;

    const setDimensions = () => {
      this.frameWidth = this.img.width / this.cols;
      this.frameHeight = this.img.height / this.rows;
    };

    if (this.img.complete) {
      setDimensions();
    } else {
      this.img.addEventListener('load', setDimensions, { once: true });
    }

    this.registered = false;
  }

  /**
   * Main rendering method for the sprite.
   * Handles frame calculation and horizontal flipping.
   * @param ctx The canvas 2D rendering context.
   */
  draw(ctx: CanvasRenderingContext2D) {
    if (!this.visible || !this.frameWidth || !this.frameHeight) return;

    const now = Date.now();
    if (this.registered && now - this.#lastFrameUpdate > this.frameDuration) {
      this.currentFrame += 1;
      this.#lastFrameUpdate = now;
    }

    const {
      img,
      cols,
      frameWidth,
      frameHeight,
      position,
      startCol,
      endCol,
    } = this;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const maxFrame = endCol - 1;

    if (this.currentFrame < startCol) {
      this.currentFrame = startCol;
    }

    if (this.currentFrame > maxFrame) {
      this.currentFrame = startCol;
    }

    // Update rows and columns
    const column = this.currentFrame % cols;
    const row = Math.floor(this.currentFrame / cols);

    ctx.save();
    if (this.flip) {
      ctx.translate(position.x + (frameWidth * 3), position.y);
      ctx.scale(-1, 1);
      ctx.drawImage(
        img,
        column * frameWidth,
        row * frameHeight,
        frameWidth,
        frameHeight,
        0,
        0,
        frameWidth * 3,
        frameHeight * 3
      );
    } else {
      ctx.drawImage(
        img,
        column * frameWidth,
        row * frameHeight,
        frameWidth,
        frameHeight,
        position.x,
        position.y,
        frameWidth * 3,
        frameHeight * 3
      );
    }
    ctx.restore();
  }

  /**
   * Registers the sprite with the engine and starts its animation loop.
   */
  play() {
    if (!this.registered) {
      Engine.registerObject(this);
      this.registered = true;
    }
  }

  /**
   * Stops the sprite's animation and removes it from the engine.
   */
  stop() {
    Engine.destroyObject(this);
  }
}
