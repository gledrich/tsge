import Canvas from "./Canvas.js";

export interface EngineOpts {
  width: string;
  height: string;
  title: string;
}

export default class Engine {
  #canvas: Canvas;
  #ctx: CanvasRenderingContext2D;
  #window: HTMLDivElement;
  #title: HTMLTitleElement;

  constructor(opts: EngineOpts = { width: '100%', height: '100%', title: 'Example' }) {
    this.#title = document.createElement('title');
    this.#title.innerHTML = opts.title;
    document.getElementsByTagName('head')[0].appendChild(this.#title);

    this.#canvas = new Canvas();
    this.#ctx = this.#canvas.canvas.getContext('2d');

    this.#window = document.createElement('div');
    this.#window.style.width = opts.width;
    this.#window.style.height = opts.height;

    document.getElementsByTagName('body')[0].appendChild(this.#window);
    this.#window.appendChild(this.#canvas.canvas);
  }
}
