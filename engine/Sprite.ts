import Engine from './Engine.js';
import GameObject from './GameObject.js';
import Vector2 from './Vector2.js';

const sprites = new Set<Sprite>();

interface SpriteProps {
  tag: string;
  img: HTMLImageElement;
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
  frameWidth: number;
  frameHeight: number;
  registered: boolean;
  currentFrame: number;

  constructor(props: SpriteProps) {
    if (!props.tag) {
      throw new Error('You must provide a tag for a Sprite');
    }

    super(props.tag, props.zIndex || '1');

    this.img = props.img;
    this.rows = props.rows;
    this.cols = props.cols;
    this.position = props.position;
    this.startCol = props.startCol;
    this.endCol = props.endCol;
    this.currentFrame = props.startCol || 0;

    sprites.add(this);

    this.img.onload = () => {
      this.frameWidth = this.img.width / this.cols;
      this.frameHeight = this.img.height / this.rows;
    };

    this.registered = false;
  }

  draw(ctx: CanvasRenderingContext2D) {
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
