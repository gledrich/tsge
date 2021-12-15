import Engine from './Engine.js';
import GameObject from './GameObject.js';
import Vector2 from './Vector2.js';

type HorizontalAlign = 'left' | 'right' | 'center' | 'start' | 'end';
type VerticalAlign =
  | 'top'
  | 'hanging'
  | 'middle'
  | 'alphabetic'
  | 'ideographic'
  | 'bottom';

interface TextProperties {
  tag: string;
  colour: string;
  backgroundColour: string;
  fontSize: string;
  font: string;
  text: string;
  horizontalAlign: HorizontalAlign;
  verticalAlign: VerticalAlign;
  position: Vector2;
  width: number;
  height: number;
  zIndex: string;
  register: boolean;
  onClick: Function;
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
  zIndex: '0',
  register: true,
  onClick: () => {},
};

export default class Text extends GameObject {
  #onMouseClick;
  tag: string;
  colour: string;
  backgroundColour: string;
  fontSize: number;
  font: string;
  text: string;
  length: number;
  horizontalAlign: HorizontalAlign;
  verticalAlign: VerticalAlign;
  position: Vector2;
  width: number;
  height: number;
  zIndex: string;
  register: boolean;
  registered: boolean;

  onClick: Function;

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
      document.addEventListener('click', this.#onMouseClick);
    }

    if (defaultedProps.register) {
      this.registerSelf();
    }
  }

  registerSelf() {
    if (!this.registered) {
      document.addEventListener('click', this.#onMouseClick);
      Engine.registerObject(this);
      this.registered = true;
    }
  }

  destroySelf() {
    if (this.registered) {
      document.removeEventListener('click', this.#onMouseClick);
      Engine.destroyObject(this);
      this.registered = false;
    }
  }

  #mouseClick(event: MouseEvent) {
    if (
      event.x > this.position.x &&
      event.x < this.position.x + this.width &&
      event.y > this.position.y &&
      event.y < this.position.y + this.height
    ) {
      if (this.onClick) {
        this.onClick();
      }
    }
  }
}
