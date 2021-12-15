import Engine from './Engine.js';
import GameObject from './GameObject.js';

interface LineProperties {
  tag: string;
  width: number;
  p1: Vector2;
  p2: Vector2;
  zIndex: string;
}

export default class Line extends GameObject {
  tag: string;
  width: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  zIndex: string;

  constructor(props: LineProperties = {
    tag: 'line', width: 1, zIndex: '0', p1: { x: 0, y: 0 }, p2: { x: 0, y: 0 }
  }) {
    super(props.tag, props.zIndex);
    this.width = props.width;
    this.x1 = props.p1.x;
    this.y1 = props.p1.y;
    this.x2 = props.p2.x;
    this.y2 = props.p2.y;

    
    this.registerSelf();
  }
}
