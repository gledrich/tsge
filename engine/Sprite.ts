import Engine from './Engine.js';
import GameObject from './GameObject.js';
import Vector2 from './Vector2.js';
import ResourceLoader from './Loader.js';

const sprites = new Set<Sprite>();

interface SpriteProps {
  tag: string;
  img: HTMLImageElement | string;
  rows: number;
  cols: number;
  position: Vector2;
  startCol: number;
  endCol: number;
  zIndex: string;
}

export default class Sprite extends GameObject {
  tag: string;
  img: HTMLImageElement;
  rows: number;
  cols: number;
  position: Vector2;
  startCol: number;
  endCol: number;
  zIndex: string;
  frameWidth: number = 0;
  frameHeight: number = 0;
  registered: boolean;
  currentFrame: number;
  flip: boolean = false;

  get width(): number {
    return this.frameWidth * 3;
  }

  get height(): number {
    return this.frameHeight * 3;
  }

  constructor(props: SpriteProps) {
    if (!props.tag) {
      throw new Error('You must provide a tag for a Sprite');
    }

    super(props.tag, props.zIndex || '1');

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

    sprites.add(this);

    const setDimensions = () => {
      this.frameWidth = this.img.width / this.cols;
      this.frameHeight = this.img.height / this.rows;
    };

    if (this.img.complete) {
      setDimensions();
    } else {
      this.img.addEventListener('load', setDimensions);
    }

    this.registered = false;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.frameWidth || !this.frameHeight) return;

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

  play() {
    if (!this.registered) {
      Engine.registerObject(this);
      this.registered = true;
    }
  }

  stop() {
    Engine.destroyObject(this);
    sprites.delete(this);
  }
}
