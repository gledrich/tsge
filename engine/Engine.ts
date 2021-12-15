import Canvas from './Canvas.js';
import Line from './Line.js';
import Text from './Text.js';
import GameObject from './GameObject.js';

export interface EngineOpts {
  width: string;
  height: string;
  title: string;
  backgroundColour: string;
}

export interface EngineCallbacks {
  onLoad: Function;
}

export default class Engine {
  static objects = new Set<GameObject>();

  #canvas: HTMLCanvasElement;
  #ctx: CanvasRenderingContext2D;
  #window: HTMLDivElement;
  #title: HTMLTitleElement;

  backgroundColour: string;
  callbacks: EngineCallbacks;

  constructor(
    callbacks: EngineCallbacks,
    opts: EngineOpts = {
      width: '100%',
      height: '100%',
      title: 'Example',
      backgroundColour: 'white',
    }
  ) {
    this.#title = document.createElement('title');
    this.#title.innerHTML = opts.title;
    document.getElementsByTagName('head')[0].appendChild(this.#title);

    this.backgroundColour = opts.backgroundColour;

    this.callbacks = {
      onLoad: () => {
        callbacks.onLoad();
        this.#onLoad();
      },
    };

    this.#canvas = new Canvas().canvas;
    this.#ctx = this.#canvas.getContext('2d');

    this.#window = document.createElement('div');
    this.#window.style.width = opts.width;
    this.#window.style.height = opts.height;

    document.getElementsByTagName('body')[0].appendChild(this.#window);
    this.#window.appendChild(this.#canvas);
  }

  #onLoad() {
    console.log('loaded');
    this.#draw();

    window.requestAnimationFrame(this.#update.bind(this));
  }

  fps = 0;

  #oldTimestamp = 0;

  #secondsPassed;

  #update(timestamp) {
    this.#secondsPassed = (timestamp - this.#oldTimestamp) / 1000;
    this.#oldTimestamp = timestamp;

    this.fps = Math.round(1 / this.#secondsPassed);

    // this.updateCallback();
    this.#draw();

    window.requestAnimationFrame(this.#update.bind(this));
  }

  #setBackground() {
    this.#ctx.fillStyle = this.backgroundColour;
    this.#ctx.fillRect(0, 0, this.#canvas.width, this.#canvas.height);
  }

  #draw() {
    this.#setBackground();

    Engine.#sortSet().forEach((object) => {
      if (object instanceof Text) {
        this.#drawText(object);
      }

      if (object instanceof Line) {
        this.#drawLine(object);
      }
    });
  }

  #drawText(text) {
    if (text.backgroundColour) {
      this.#ctx.fillStyle = text.backgroundColour;
      this.#ctx.fillRect(
        text.position.x,
        text.position.y,
        text.width,
        text.height
      );
    }

    this.#ctx.font = text.font;
    this.#ctx.fillStyle = text.colour;
    this.#ctx.textAlign = text.horizontalAlign;
    this.#ctx.textBaseline = text.verticalAlign;
    this.#ctx.fillText(
      text.text,
      text.position.x + text.width / 2,
      text.position.y + text.height / 2
    );
  }

  #drawLine(line) {
    this.#ctx.lineWidth = line.width;
    this.#ctx.moveTo(line.x1, line.y1);
    this.#ctx.lineTo(line.x2, line.y2);
    this.#ctx.stroke();
  }

  static #sortSet() {
    const arr: GameObject[] = Array.from(Engine.objects);

    arr.sort((a, b) =>
      a.zIndex > b.zIndex ? 1 : -1
    );

    return new Set(arr);
  }

  static registerObject(object) {
    this.objects.add(object);
  }

  static destroyObject(object) {
    this.objects.delete(object);
  }
}
