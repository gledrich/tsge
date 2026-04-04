import Canvas from './Canvas.js';
import GameObject from './GameObject.js';
import Sprite from './Sprite.js';
import Input from './Input.js';
import Scene from './Scene.js';
import Camera from './Camera.js';

export interface EngineOpts {
  width: string;
  height: string;
  title: string;
  backgroundColour: string;
}

export interface EngineCallbacks {
  onLoad: () => void;
  update: () => void;
  fixedUpdate?: () => void;
}

class ObjectSet extends Set<GameObject> {
  findAll: (tag: string) => GameObject[];
}

export default class Engine {
  public static objects = new ObjectSet();
  public static paused = false;
  public static debug = false;
  public static camera = new Camera();
  private static _currentScene: Scene;

  public static get currentScene(): Scene {
    return this._currentScene;
  }

  public static set currentScene(scene: Scene) {
    this._currentScene = scene;
    this.camera.reset();
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
  #accumulator: number = 0;
  #fixedDelta: number = 1 / 60;

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

    setTimeout(() => this.callbacks.onLoad(), 0);
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

      // Fixed update loop
      this.#accumulator += this.#secondsPassed;
      while (this.#accumulator >= this.#fixedDelta) {
        this.#fixedUpdate();
        this.#accumulator -= this.#fixedDelta;
      }

      if (Engine.currentScene) {
        Engine.currentScene.update();
      }

      this.callbacks.update();
      this.#draw();
    }

    window.requestAnimationFrame(this.#update.bind(this));
  }

  #fixedUpdate() {
    const objects = Engine.currentScene ? Engine.currentScene.objects : Engine.objects;

    objects.forEach((object) => {
      // Apply acceleration to velocity
      object.velocity.x += object.acceleration.x * this.#fixedDelta;
      object.velocity.y += object.acceleration.y * this.#fixedDelta;

      // Apply velocity to position
      object.position.x += object.velocity.x * this.#fixedDelta;
      object.position.y += object.velocity.y * this.#fixedDelta;
    });

    if (this.callbacks.fixedUpdate) {
      this.callbacks.fixedUpdate();
    }
  }

  #setBackground() {
    this.#ctx.fillStyle = this.backgroundColour;
    this.#ctx.fillRect(0, 0, this.#canvas.width, this.#canvas.height);
  }

  #draw() {
    this.#setBackground();

    const objects = Engine.currentScene ? Engine.currentScene.objects : Engine.objects;

    this.#ctx.save();
    
    // Apply camera transform
    this.#ctx.scale(Engine.camera.zoom, Engine.camera.zoom);
    this.#ctx.translate(-Engine.camera.position.x, -Engine.camera.position.y);

    Engine.#sortSet(objects).forEach((object) => {
      object.draw(this.#ctx);
    });

    if (Engine.debug) {
      this.#drawDebug(objects);
    }

    this.#ctx.restore();
  }

  #drawDebug(objects: Set<GameObject>) {
    this.#ctx.strokeStyle = 'red';
    this.#ctx.lineWidth = 1;
    this.#ctx.font = '12px monospace';
    this.#ctx.fillStyle = 'red';

    objects.forEach((obj) => {
      // Draw hitbox
      this.#ctx.strokeRect(obj.position.x, obj.position.y, obj.width, obj.height);
      // Draw tag
      this.#ctx.fillText(obj.tag || 'obj', obj.position.x, obj.position.y - 5);
    });

    // Draw Stats Overlay (Top Right)
    this.#ctx.save();
    this.#ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform for UI
    
    const overlayWidth = 150;
    const overlayHeight = 80;
    const padding = 10;
    const x = this.#canvas.width - overlayWidth - padding;
    const y = padding;

    this.#ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.#ctx.fillRect(x, y, overlayWidth, overlayHeight);
    
    this.#ctx.fillStyle = 'white';
    this.#ctx.textAlign = 'center';
    this.#ctx.textBaseline = 'middle';
    
    const centerX = x + overlayWidth / 2;
    this.#ctx.fillText(`FPS: ${this.fps}`, centerX, y + 15);
    this.#ctx.fillText(`Objects: ${objects.size}`, centerX, y + 35);
    this.#ctx.fillText(`Mouse X: ${Math.round(this.mouseX)}`, centerX, y + 55);
    this.#ctx.fillText(`Mouse Y: ${Math.round(this.mouseY)}`, centerX, y + 70);
    this.#ctx.restore();
  }

  #findAllObjects(tag: string = '') {
    return Array.from(Engine.objects).filter((obj) => obj.tag === tag);
  }

  async setTimeout(timeoutFn: () => void, time: number) {
    await new Promise((resolve) => {
      setTimeout(resolve, time);
    });
    timeoutFn();
  }

  countdown(milliseconds: number, fn: () => void, onEnded: () => void) {
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
