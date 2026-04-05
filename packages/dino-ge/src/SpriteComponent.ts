import RenderComponent from './RenderComponent.js';

/**
 * Component that holds data for rendering an animated sprite.
 */
export default class SpriteComponent extends RenderComponent {
  /** The source image for the sprite. */
  img: HTMLImageElement;
  /** Number of rows in the spritesheet. */
  rows: number;
  /** Number of columns in the spritesheet. */
  cols: number;
  /** The starting column for the current animation loop. */
  startCol: number;
  /** The ending column for the current animation loop. */
  endCol: number;
  /** The pixel width of a single animation frame. */
  frameWidth: number = 0;
  /** The pixel height of a single animation frame. */
  frameHeight: number = 0;
  /** The current frame index being displayed. */
  currentFrame: number = 0;
  /** Whether the sprite is horizontally flipped. */
  flip: boolean = false;
  /** Duration of each animation frame in milliseconds. */
  frameDuration: number = 100;
  /** Whether the sprite is currently playing its animation. */
  playing: boolean = false;
  
  #lastFrameUpdate: number = Date.now();

  constructor(img: HTMLImageElement, rows: number, cols: number, startCol: number, endCol: number) {
    super();
    this.img = img;
    this.rows = rows;
    this.cols = cols;
    this.startCol = startCol;
    this.endCol = endCol;
    this.currentFrame = startCol;

    const setDimensions = () => {
      this.frameWidth = this.img.width / this.cols;
      this.frameHeight = this.img.height / this.rows;
    };

    if (this.img.complete) {
      setDimensions();
    } else {
      this.img.addEventListener('load', setDimensions, { once: true });
    }
  }

  /**
   * Draws the current frame of the sprite.
   * @param ctx The canvas 2D rendering context.
   */
  draw(ctx: CanvasRenderingContext2D) {
    if (!this.frameWidth || !this.frameHeight || !this.gameObject) return;

    const now = Date.now();
    if (this.playing && now - this.#lastFrameUpdate > this.frameDuration) {
      this.currentFrame += 1;
      this.#lastFrameUpdate = now;
    }

    const {
      img,
      cols,
      frameWidth,
      frameHeight,
      startCol,
      endCol,
    } = this;

    const { position } = this.gameObject;

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
}
