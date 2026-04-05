import Engine from './Engine.js';
import GameObject from './GameObject.js';
import Vector2 from './Vector2.js';
import Input from './Input.js';

/** Horizontal alignment options for text. */
export type HorizontalAlign = 'left' | 'right' | 'center' | 'start' | 'end';
/** Vertical alignment options for text. */
export type VerticalAlign =
  | 'top'
  | 'hanging'
  | 'middle'
  | 'alphabetic'
  | 'ideographic'
  | 'bottom';

/**
 * Configuration for creating a Text object.
 */
export interface TextProperties {
  /** Unique tag for identification. */
  tag: string;
  /** Fill colour of the text. */
  colour: string;
  /** Optional background box colour. */
  backgroundColour: string;
  /** Font size in pixels. */
  fontSize: string;
  /** Font family (e.g., 'Arial', 'Helvetica'). */
  font: string;
  /** The text content to display. */
  text: string;
  /** Horizontal alignment relative to the position. */
  horizontalAlign: HorizontalAlign;
  /** Vertical alignment relative to the position. */
  verticalAlign: VerticalAlign;
  /** Anchor position for the text. */
  position: Vector2;
  /** Optional width for background box. */
  width: number;
  /** Optional height for background box. */
  height: number;
  /** Render order. */
  zIndex: number;
  /** Whether to register with the engine immediately. */
  register: boolean;
  /** Callback for click events. */
  onClick: () => void;
}

const defaultProps = {
  tag: 'text',
  colour: 'black',
  fontSize: '25', // px
  font: 'Helvetica',
  text: '',
  horizontalAlign: 'center',
  verticalAlign: 'middle',
  position: new Vector2(0, 0),
  zIndex: 0,
  register: true,
  onClick: () => {},
};

/**
 * Represents text that can be drawn to the screen and interact with input.
 */
export default class Text extends GameObject {
  #onMouseClick;
  /** Text fill colour. */
  colour: string;
  /** Background box colour. */
  backgroundColour: string = '';
  /** Font size in pixels. */
  fontSize: number;
  /** Compiled font string (e.g., '25px Helvetica'). */
  font: string;
  /** The text content. */
  text: string;
  /** Number of characters in the text. */
  length: number;
  /** Horizontal alignment. */
  horizontalAlign: HorizontalAlign;
  /** Vertical alignment. */
  verticalAlign: VerticalAlign;
  /** Anchor position. */
  position: Vector2;
  /** Width of the background box or interaction area. */
  width: number;
  /** Height of the background box or interaction area. */
  height: number;
  /** Whether the object should be registered. */
  register: boolean;
  /** Whether the object is currently registered. */
  registered: boolean = false;

  /** Callback for click events. */
  onClick: () => void = () => {};

  constructor(props: TextProperties) {
    super(props.tag || defaultProps.tag, props.zIndex || defaultProps.zIndex);

    const defaultedProps = {
      ...defaultProps,
      ...props,
    };

    this.colour = defaultedProps.colour;
    this.fontSize = parseInt(defaultedProps.fontSize, 10);
    this.font = `${this.fontSize}px ${defaultedProps.font}`;
    this.text = defaultedProps.text;
    this.length = defaultedProps.text.length;
    this.position = defaultedProps.position;
    this.horizontalAlign = defaultedProps.horizontalAlign;
    this.verticalAlign = defaultedProps.verticalAlign;
    this.width = defaultedProps.width || this.fontSize * this.length;
    this.height = defaultedProps.height || this.fontSize * 2;
    this.#onMouseClick = this.#mouseClick.bind(this);
    
    if (defaultedProps.backgroundColour) {
      this.backgroundColour = defaultedProps.backgroundColour;
    }

    if (defaultedProps.onClick) {
      this.onClick = defaultedProps.onClick;
    }

    if (defaultedProps.register) {
      this.registerSelf();
    }
  }

  /** Draws the text and its optional background onto the context. */
  draw(ctx: CanvasRenderingContext2D) {
    if (!this.visible) return;
    if (this.backgroundColour) {
      ctx.fillStyle = this.backgroundColour;
      ctx.fillRect(
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );
    }

    ctx.font = this.font;
    ctx.fillStyle = this.colour;
    ctx.textAlign = this.horizontalAlign;
    ctx.textBaseline = this.verticalAlign;
    ctx.fillText(
      this.text,
      this.position.x + this.width / 2,
      this.position.y + this.height / 2
    );
  }

  /** Registers the text object with the engine for rendering and interaction. */
  registerSelf() {
    if (!this.registered) {
      Input.addClickListener(this.#onMouseClick);
      Engine.registerObject(this);
      this.registered = true;
    }
  }

  /** Removes the text object from the engine. */
  destroySelf() {
    if (this.registered) {
      Input.removeClickListener(this.#onMouseClick);
      Engine.destroyObject(this);
      this.registered = false;
    }
  }

  #mouseClick(pos: Vector2) {
    if (
      pos.x > this.position.x &&
      pos.x < this.position.x + this.width &&
      pos.y > this.position.y &&
      pos.y < this.position.y + this.height
    ) {
      if (this.onClick) {
        this.onClick();
      }
    }
  }
}
