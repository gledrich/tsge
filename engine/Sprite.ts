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
  ref: string;

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

    sprites.add(this);

    this.img.onload = () => {
      this.frameWidth = this.img.width / this.cols;
      this.frameHeight = this.img.height / this.rows;
    };

    this.registered = false;
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
