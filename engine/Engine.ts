import Canvas from './Canvas.js';
import GameObject from './GameObject.js';
import Input from './Input.js';
import Scene from './Scene.js';
import Camera from './Camera.js';

/**
 * Options for initializing the Engine.
 */
export interface EngineOpts {
  /** Width of the game window (e.g., '800px' or '100%'). */
  width: string;
  /** Height of the game window (e.g., '600px' or '100%'). */
  height: string;
  /** Title of the game, set in the document head. */
  title: string;
  /** Background colour of the canvas. */
  backgroundColour: string;
}

/**
 * Lifecycle and update callbacks for the engine.
 */
export interface EngineCallbacks {
  /** Called once after the engine is initialized. */
  onLoad: () => void;
  /** Called every frame for game logic and rendering. */
  update: () => void;
  /** Optional callback for physics or fixed-step logic. */
  fixedUpdate?: () => void;
}

/**
 * Specialized Set for managing game objects with helper methods.
 */
export class ObjectSet extends Set<GameObject> {
  /**
   * Find all objects with a specific tag.
   * @param tag The tag to search for.
   */
  findAll: (tag: string) => GameObject[];
}

/**
 * The core singleton class that manages the game loop, rendering, and scene state.
 */
export default class Engine {
  /**
   * Global set of game objects if no scene is active.
   */
  public static objects = new ObjectSet();

  /**
   * Whether the game loop is currently paused.
   */
  public static paused = false;

  /**
   * Toggle for visual debug mode (hitboxes and stats).
   */
  public static debug = false;

  /**
   * The currently selected object in debug mode.
   */
  public static selectedObject: GameObject | null = null;

  /**
   * The global camera instance.
   */
  public static camera = new Camera();

  private static _currentScene: Scene;

  /**
   * Gets the currently active scene.
   */
  public static get currentScene(): Scene {
    return this._currentScene;
  }

  /**
   * Sets the active scene, resetting the camera and calling the scene's onLoad.
   */
  public static set currentScene(scene: Scene) {
    this._currentScene = scene;
    this.camera.reset();
    scene.onLoad();
  }

  #canvas: Canvas;
  #ctx: CanvasRenderingContext2D;
  #window: HTMLDivElement;
  #title: HTMLTitleElement;

  /** Current background colour. */
  backgroundColour: string;
  /** Registered engine callbacks. */
  callbacks: EngineCallbacks;

  /** Pixel width of the canvas. */
  width: number;
  /** Pixel height of the canvas. */
  height: number;

  /** Current mouse x position in world space. */
  get mouseX() {
    return Input.mouseX;
  }

  /** Current mouse y position in world space. */
  get mouseY() {
    return Input.mouseY;
  }

  /** Current frames per second. */
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

    this.#canvas = new Canvas();
    this.#ctx = this.#canvas.canvas.getContext('2d');
    this.width = this.#canvas.canvas.width;
    this.height = this.#canvas.canvas.height;

    this.#window = document.createElement('div');
    this.#window.id = 'canvas-container';
    this.#window.style.width = defaultedOpts.width;
    this.#window.style.height = defaultedOpts.height;

    Input.init();

    window.addEventListener('resize', () => {
      this.#canvas.resize();
      this.width = this.#canvas.canvas.width;
      this.height = this.#canvas.canvas.height;
    });

    document.getElementsByTagName('body')[0].appendChild(this.#window);
    this.#window.appendChild(this.#canvas.canvas);

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
    } else {
      // Still allow drawing in paused mode if debug is on or for initial frame
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
    this.#ctx.fillRect(0, 0, this.#canvas.canvas.width, this.#canvas.canvas.height);
  }

  #draw() {
    this.#setBackground();

    const objects = Engine.currentScene ? Engine.currentScene.objects : Engine.objects;
    const bounds = Engine.camera.getViewportBounds(this.width, this.height);

    this.#ctx.save();

    // Apply camera transform
    this.#ctx.scale(Engine.camera.zoom, Engine.camera.zoom);
    this.#ctx.translate(-Engine.camera.position.x, -Engine.camera.position.y);

    Engine.#getSortedArray(objects).forEach((object) => {
      // Frustum Culling
      if (
        object.position.x < bounds.x + bounds.width &&
        object.position.x + object.width > bounds.x &&
        object.position.y < bounds.y + bounds.height &&
        object.position.y + object.height > bounds.y
      ) {
        object.draw(this.#ctx);
      }
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
      this.#ctx.strokeStyle = obj === Engine.selectedObject ? '#00ff00' : 'red';
      this.#ctx.lineWidth = obj === Engine.selectedObject ? 2 : 1;
      this.#ctx.strokeRect(obj.position.x, obj.position.y, obj.width, obj.height);

      // Draw tag
      this.#ctx.fillStyle = this.#ctx.strokeStyle;
      this.#ctx.fillText(obj.tag || 'obj', obj.position.x, obj.position.y - 5);
    });

    // Draw Stats Overlay (Top Right)
    this.#ctx.save();
    this.#ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform for UI

    const overlayWidth = 180;
    const statsHeight = 80;
    const padding = 10;
    const x = this.#canvas.canvas.width - overlayWidth - padding;
    let y = padding;

    // Background for Stats
    this.#ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.#ctx.fillRect(x, y, overlayWidth, statsHeight);

    this.#ctx.fillStyle = 'white';
    this.#ctx.textAlign = 'left';
    this.#ctx.textBaseline = 'top';

    this.#ctx.fillText(`FPS: ${this.fps}`, x + 10, y + 10);
    this.#ctx.fillText(`Objects: ${objects.size}`, x + 10, y + 25);
    this.#ctx.fillText(`Mouse X: ${Math.round(this.mouseX)}`, x + 10, y + 45);
    this.#ctx.fillText(`Mouse Y: ${Math.round(this.mouseY)}`, x + 10, y + 60);

    // Inspector Panel (If object selected)
    if (Engine.selectedObject) {
      y += statsHeight + 10;
      const obj = Engine.selectedObject;
      const properties = [
        ['Tag', obj.tag],
        ['Pos', `${Math.round(obj.position.x)}, ${Math.round(obj.position.y)}`],
        ['Size', `${Math.round(obj.width)}x${Math.round(obj.height)}`],
        ['Vel', `${Math.round(obj.velocity.x)}, ${Math.round(obj.velocity.y)}`],
        ['Acc', `${Math.round(obj.acceleration.x)}, ${Math.round(obj.acceleration.y)}`],
        ['Z-Index', obj.zIndex]
      ];

      const inspectorHeight = 20 + (properties.length * 15);
      this.#ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.#ctx.fillRect(x, y, overlayWidth, inspectorHeight);
      this.#ctx.strokeStyle = '#00ff00';
      this.#ctx.strokeRect(x, y, overlayWidth, inspectorHeight);

      this.#ctx.fillStyle = '#00ff00';
      this.#ctx.fillText('INSPECTOR', x + 10, y + 5);

      this.#ctx.fillStyle = 'white';
      properties.forEach(([key, val], i) => {
        this.#ctx.fillText(`${key}: ${val}`, x + 10, y + 20 + (i * 15));
      });
    }

    this.#ctx.restore();
  }

  #findAllObjects(tag: string = '') {
    return Array.from(Engine.objects).filter((obj) => obj.tag === tag);
  }

  /**
   * Promisified setTimeout.
   * @param timeoutFn The function to run after the timeout.
   * @param time The time in milliseconds to wait.
   */
  async setTimeout(timeoutFn: () => void, time: number) {
    await new Promise((resolve) => {
      setTimeout(resolve, time);
    });
    timeoutFn();
  }

  /**
   * Run a function repeatedly for a duration and then run a final function.
   * @param milliseconds Total duration.
   * @param fn Function to run every second.
   * @param onEnded Final function to run.
   */
  countdown(milliseconds: number, fn: () => void, onEnded: () => void) {
    setTimeout(onEnded, milliseconds);

    for (let i = 1; i <= milliseconds; i += 1) {
      if (i % 1000 === 0) {
        setTimeout(fn, i);
      }
    }
  }

  /** Sets the CSS cursor style for the game canvas. */
  set cursor(value: string) {
    document.getElementById('canvas').style.cursor = value;
  }

  static #getSortedArray(objects: Set<GameObject> = Engine.objects) {
    const arr: GameObject[] = Array.from(objects);
    arr.sort((a, b) => (a.zIndex > b.zIndex ? 1 : -1));
    return arr;
  }

  /**
   * Register a new game object with the active scene or global engine.
   * @param object The object to register.
   */
  static registerObject(object: GameObject) {
    if (Engine.currentScene) {
      Engine.currentScene.add(object);
    } else {
      this.objects.add(object);
    }
  }

  /**
   * Remove a game object from the active scene or global engine.
   * @param object The object to destroy.
   */
  static destroyObject(object: GameObject) {
    if (Engine.currentScene) {
      Engine.currentScene.remove(object);
    } else {
      this.objects.delete(object);
    }
  }

  /** Destroy all objects in the active scene or global engine. */
  static destroyAll() {
    if (Engine.currentScene) {
      Engine.currentScene.clear();
    } else {
      this.objects.clear();
    }
  }
}
