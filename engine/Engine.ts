import Canvas from './Canvas.js';
import GameObject from './GameObject.js';
import Sprite from './Sprite.js';
import Input from './Input.js';
import Scene from './Scene.js';

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
  private static _currentScene: Scene;

  public static get currentScene(): Scene {
    return this._currentScene;
  }

  public static set currentScene(scene: Scene) {
    this._currentScene = scene;
    scene.onLoad();
  }

  #canvas: HTMLCanvasElement;
  #ctx: CanvasRenderingContext2D;
  #window: HTMLDivElement;
  #title: HTMLTitleElement;

  backgroundColour: string;
  callbacks: EngineCallbacks;

  width: number;
  height: number;

  get mouseX() {
    return Input.mouseX;
  }

  get mouseY() {
    return Input.mouseY;
  }

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

    Input.init();

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

      if (Engine.currentScene) {
        Engine.currentScene.update();
      }

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

    const objects = Engine.currentScene ? Engine.currentScene.objects : Engine.objects;

    Engine.#sortSet(objects).forEach((object) => {
      object.draw(this.#ctx);
    });
  }

  #findAllObjects(tag: string = '') {
    return Array.from(Engine.objects).filter((obj) => obj.tag === tag);
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

  static #sortSet(objects: Set<GameObject> = Engine.objects) {
    const arr: GameObject[] = Array.from(objects);

    arr.sort((a, b) => (parseInt(a.zIndex, 10) > parseInt(b.zIndex, 10) ? 1 : -1));

    return new Set<GameObject>(arr);
  }

  static registerObject(object: GameObject) {
    if (object instanceof Sprite) {
      const sprite = object;
      if (Engine.currentScene) {
        Engine.currentScene.add(sprite);
      } else {
        this.objects.add(sprite);
      }

      setInterval(() => {
        sprite.currentFrame += 1;
      }, 100);
    } else {
      if (Engine.currentScene) {
        Engine.currentScene.add(object);
      } else {
        this.objects.add(object);
      }
    }
  }

  static destroyObject(object: GameObject) {
    if (Engine.currentScene) {
      Engine.currentScene.remove(object);
    } else {
      this.objects.delete(object);
    }
  }

  static destroyAll() {
    if (Engine.currentScene) {
      Engine.currentScene.clear();
    } else {
      this.objects.clear();
    }
  }
}
