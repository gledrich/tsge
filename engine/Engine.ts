import Canvas from './Canvas.js';
import Line from './Line.js';
import Text from './Text.js';
import GameObject from './GameObject.js';
import Rectangle from './Rectangle.js';
import Sprite from './Sprite.js';

export interface EngineOpts {
  width: string;
  height: string;
  title: string;
  backgroundColour: string;
}

export interface EngineCallbacks {
  onLoad: Function;
  update: Function;
}

class ObjectSet extends Set<GameObject> {
  findAll: Function;
}

export default class Engine {
  public static objects = new ObjectSet();
  public static paused = false;

  #canvas: HTMLCanvasElement;
  #ctx: CanvasRenderingContext2D;
  #window: HTMLDivElement;
  #title: HTMLTitleElement;

  backgroundColour: string;
  callbacks: EngineCallbacks;

  width: number;
  height: number;

  mouseX: number;
  mouseY: number;

  fps: number = 0;
  #oldTimestamp: number = 0;
  #secondsPassed: number;

  constructor(callbacks: EngineCallbacks, opts: EngineOpts) {
    const defaultedOpts = {
      width: '100%',
      height: '100%',
      title: 'Example',
      backgroundColour: 'white',
      ...opts,
    };


    Engine.objects.findAll = this.#findAllObjects.bind(this);

    this.#title = document.createElement('title');
    this.#title.innerHTML = defaultedOpts.title;
    document.getElementsByTagName('head')[0].appendChild(this.#title);

    this.backgroundColour = defaultedOpts.backgroundColour;

    this.callbacks = {
      onLoad: () => {
        callbacks.onLoad();
        this.#onLoad();
      },
      update: callbacks.update,
    };

    this.#canvas = new Canvas().canvas;
    this.#ctx = this.#canvas.getContext('2d');
    this.width = this.#canvas.width;
    this.height = this.#canvas.height;

    this.#window = document.createElement('div');
    this.#window.id = 'canvas-container';
    this.#window.style.width = defaultedOpts.width;
    this.#window.style.height = defaultedOpts.height;

    document.addEventListener('mousemove', this.#setMousePos.bind(this));

    document.getElementsByTagName('body')[0].appendChild(this.#window);
    this.#window.appendChild(this.#canvas);
  }

  #onLoad() {
    this.#draw();

    window.requestAnimationFrame(this.#update.bind(this));
  }

  #update(timestamp: number) {
    if (!Engine.paused) {
      this.#secondsPassed = (timestamp - this.#oldTimestamp) / 1000;
      this.#oldTimestamp = timestamp;

      this.fps = Math.round(1 / this.#secondsPassed);

      this.callbacks.update();
      this.#draw();
    }

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

      if (object instanceof Rectangle) {
        this.#drawRectangle(object);
      }

      if (object instanceof Sprite) {
        this.#drawSprite(object);
      }
    });
  }

  #drawText(text: Text) {
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

  #drawLine(line: Line) {
    this.#ctx.lineWidth = line.width;
    this.#ctx.moveTo(line.x1, line.y1);
    this.#ctx.lineTo(line.x2, line.y2);
    this.#ctx.stroke();
  }

  #drawRectangle(rectangle: Rectangle) {
    this.#ctx.fillStyle = rectangle.colour;
    this.#ctx.fillRect(
      rectangle.position.x,
      rectangle.position.y,
      rectangle.width,
      rectangle.height
    );
  }

  #drawSprite(sprite: Sprite) {
    const {
      img,
      cols,
      frameWidth,
      frameHeight,
      position,
      startCol,
      endCol,
      ref,
    } = sprite;

    this.#ctx.imageSmoothingEnabled = true;
    this.#ctx.imageSmoothingQuality = 'high';

    const maxFrame = endCol - 1;

    while (Engine[ref] < startCol) {
      Engine[ref] += 1;
    }

    if (Engine[ref] > maxFrame) {
      Engine[ref] = startCol;
    }

    // Update rows and columns
    const column = Engine[ref] % cols;
    const row = Math.floor(Engine[ref] / cols);

    this.#ctx.drawImage(
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

  #findAllObjects(tag: string = '') {
    return Array.from(Engine.objects).filter((obj) => obj.tag === tag);
  }

  #setMousePos(event: MouseEvent) {
    if (event) {
      this.mouseX = event.x;
      this.mouseY = event.y;
    }
  }

  async setTimeout(timeoutFn: Function, time: number) {
    await new Promise((resolve) => {
      setTimeout(resolve, time);
    });
    timeoutFn();
  }

  countdown(milliseconds: number, fn: Function, onEnded: Function) {
    setTimeout(onEnded, milliseconds);

    for (let i = 1; i <= milliseconds; i += 1) {
      if (i % 1000 === 0) {
        setTimeout(fn, i);
      }
    }
  }

  set cursor(value: string) {
    document.getElementById('canvas').style.cursor = value;
  }

  static #sortSet() {
    const arr: GameObject[] = Array.from(Engine.objects);

    arr.sort((a, b) => (a.zIndex > b.zIndex ? 1 : -1));

    return new Set<GameObject>(arr);
  }

  static registerObject(object: GameObject) {
    if (object instanceof Sprite) {
      const ref = `${object.tag}_${this.objects.size}`;
      const sprite = object;

      this[ref] = 0;
      sprite.ref = ref;
      sprite.img.id = ref;
      this.objects.add(sprite);

      setInterval(() => {
        this[ref] += 1;
      }, 100);
    } else {
      this.objects.add(object);
    }
  }

  static destroyObject(object: GameObject) {
    if (object instanceof Sprite) {
      delete Engine[object.tag];
    }

    this.objects.delete(object);
  }

  static destroyAll() {
    this.objects.clear();
  }
}
