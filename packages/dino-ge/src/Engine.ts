import Canvas from './Canvas.js';
import GameObject from './GameObject.js';
import Input from './Input.js';
import Scene from './Scene.js';
import Camera from './Camera.js';
import System from './System.js';
import PhysicsSystem from './PhysicsSystem.js';
import RenderingSystem from './RenderingSystem.js';
import PhysicsComponent from './PhysicsComponent.js';

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
  findAll: (tag: string) => GameObject[] = () => [];
}

/**
 * Interface for the shared global state of the Engine.
 */
interface EngineState {
  objects: ObjectSet;
  paused: boolean;
  debug: boolean;
  selectedObject: GameObject | null;
  camera: Camera;
  systems: System[];
  renderingSystem?: RenderingSystem;
  events: EventTarget;
}

/**
 * Shared state for the engine to ensure singletons work across different module loads.
 */
const _globalState: EngineState = (globalThis as unknown as { __DINO_ENGINE_STATE__: EngineState; }).__DINO_ENGINE_STATE__ || {
  objects: new ObjectSet(),
  paused: false,
  debug: false,
  selectedObject: null,
  camera: new Camera(),
  systems: [new PhysicsSystem()],
  events: new EventTarget()
};
(globalThis as unknown as { __DINO_ENGINE_STATE__: EngineState; }).__DINO_ENGINE_STATE__ = _globalState;

/**
 * The core singleton class that manages the game loop, rendering, and scene state.
 */
export default class Engine {
  /**
   * Global set of game objects if no scene is active.
   */
  public static get objects(): ObjectSet { return _globalState.objects; }

  /**
   * Global list of systems that process game objects.
   */
  private static get _systems(): System[] { return _globalState.systems; }

  /**
   * The global rendering system.
   */
  public static get renderingSystem(): RenderingSystem | undefined { return _globalState.renderingSystem; }
  public static set renderingSystem(val: RenderingSystem | undefined) { _globalState.renderingSystem = val; }

  /**
   * Whether the game loop is currently paused.
   */
  public static get paused(): boolean { return _globalState.paused; }
  public static set paused(val: boolean) {
    if (_globalState.paused !== val) {
      _globalState.paused = val;
      this.emit('paused', val);
    }
  }

  /**
   * Toggle for visual debug mode (hitboxes and stats).
   */
  public static get debug(): boolean { return _globalState.debug; }
  public static set debug(val: boolean) {
    if (_globalState.debug !== val) {
      _globalState.debug = val;
      this.emit('debug', val);
    }
  }

  /**
   * Internal event bus for engine events.
   */
  private static get events(): EventTarget { return _globalState.events; }

  /**
   * Listens for an event on the global engine bus.
   * @param type The event type (e.g., 'paused', 'PLAYER_DIED').
   * @param callback The function to run when the event occurs.
   */
  public static on(type: string, callback: (event: CustomEvent) => void) {
    this.events.addEventListener(type, callback as (e: Event) => void);
  }

  /**
   * Stops listening for an event on the global engine bus.
   * @param type The event type.
   * @param callback The function to remove.
   */
  public static off(type: string, callback: (event: CustomEvent) => void) {
    this.events.removeEventListener(type, callback as (e: Event) => void);
  }

  /**
   * Emits a custom event on the global engine bus.
   * @param type The event type.
   * @param detail Optional data to pass with the event.
   */
  public static emit(type: string, detail?: unknown) {
    this.events.dispatchEvent(new CustomEvent(type, { detail }));
  }

  /**
   * The currently selected object in debug mode.
   */
  public static get selectedObject(): GameObject | null { return _globalState.selectedObject; }
  public static set selectedObject(val: GameObject | null) { _globalState.selectedObject = val; }

  /**
   * The global camera instance.
   */
  public static get camera(): Camera { return _globalState.camera; }

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
  #ctx!: CanvasRenderingContext2D;
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
  #secondsPassed: number = 0;
  #accumulator: number = 0;
  #fixedDelta: number = 1 / 60;

  constructor(callbacks: EngineCallbacks, opts: Partial<EngineOpts> = {}) {
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
    this.#ctx = this.#canvas.canvas.getContext('2d')!;
    this.width = this.#canvas.canvas.width;
    this.height = this.#canvas.canvas.height;

    if (Engine.renderingSystem) {
      Engine.renderingSystem.setContext(this.#ctx);
    } else {
      Engine.renderingSystem = new RenderingSystem(this.#ctx);
    }

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

    Engine._systems.forEach((system) => {
      if (system.fixedUpdate) {
        system.fixedUpdate(objects, this.#fixedDelta);
      }
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

    if (Engine.renderingSystem) {
      Engine.renderingSystem.update(objects, 0, Engine.debug);
    }

    if (Engine.debug) {
      this.#drawDebug(objects);
    }
  }
  #drawDebug(objects: Set<GameObject>) {
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
      const properties: [string, string | number][] = [
        ['Pos', `${Math.round(obj.transform.position.x)}, ${Math.round(obj.transform.position.y)}`],
        ['Size', `${Math.round(obj.bounds?.width ?? 0)}x${Math.round(obj.bounds?.height ?? 0)}`]
      ];

      const tagComp = obj.metadata;
      if (tagComp) {
        properties.unshift(['Tag', tagComp.tag]);
        properties.push(['Z-Index', tagComp.zIndex]);
      }

      const physComp = obj.getComponent(PhysicsComponent);
      if (physComp) {
        properties.push(['Vel', `${Math.round(physComp.velocity.x)}, ${Math.round(physComp.velocity.y)}`]);
        properties.push(['Acc', `${Math.round(physComp.acceleration.x)}, ${Math.round(physComp.acceleration.y)}`]);
      }

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
    return Array.from(Engine.objects).filter((obj) => obj.metadata.tag === tag);
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
    const canvas = document.getElementById('canvas');
    if (canvas) canvas.style.cursor = value;
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
