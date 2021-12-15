import Vector2 from './Vector2.js';
import Sprite from './Sprite.js';
import GameObject from './GameObject.js';

const checkCollision = (bigger, smaller) => {
  if (
    // top left corner
    (smaller.position.x > bigger.position.x
      && smaller.position.x < bigger.position.x + bigger.width
      && smaller.position.y > bigger.position.y
      && smaller.position.y < bigger.position.y + bigger.height)
    // top right corner
    || (
      smaller.position.x + smaller.width > bigger.position.x
      && smaller.position.x + smaller.width < bigger.position.x + bigger.width
      && smaller.position.y > bigger.position.y
      && smaller.position.y < bigger.position.y + bigger.height
    )
    // bottom left corner
    || (
      smaller.position.x > bigger.position.x
      && smaller.position.x < bigger.position.x + bigger.width
      && smaller.position.y + smaller.height > bigger.position.y
      && smaller.position.y + smaller.height < bigger.position.y + bigger.height
    )
    // bottom right corner
    || (
      smaller.position.x + smaller.width > bigger.position.x
      && smaller.position.x + smaller.width < bigger.position.x + bigger.width
      && smaller.position.y + smaller.height > bigger.position.y
      && smaller.position.y + smaller.height < bigger.position.y + bigger.height
    )
  ) {
    return true;
  }

  return false;
};

interface RectProps {
  tag: string;
  position: Vector2;
  width: number;
  height: number;
  colour: string;
  zIndex: string;
}

const defaultProps = {
  tag: 'rect', colour: 'black', zIndex: '0',
}

export default class Rectangle extends GameObject {
  position: Vector2;
  width: number;
  height: number;
  colour: string;

  constructor(props: RectProps) {
    super(props.tag || defaultProps.tag, props.zIndex || defaultProps.zIndex);
    
    const defaultedProps = {
      ...defaultProps,
      ...props
    }

    if (!(defaultedProps.position instanceof Vector2)) {
      throw new Error('"position" must be a Vector2!');
    }

    if (!defaultedProps.width || !defaultedProps.height) {
      throw new Error('You must provide a width and height for Rectangle');
    }

    this.tag = defaultedProps.tag;
    this.position = defaultedProps.position;
    this.width = defaultedProps.width;
    this.height = defaultedProps.height;
    this.colour = defaultedProps.colour;
    this.zIndex = defaultedProps.zIndex;

    this.registerSelf();
  }

  hasCollided(obj: GameObject) {
    if (obj instanceof Rectangle) {
      let bigger;
      let smaller;

      if (this.width > obj.width || this.height > obj.height) {
        bigger = this;
        smaller = obj;
      } else {
        bigger = obj;
        smaller = this;
      }

      return checkCollision(bigger, smaller);
    }

    if (obj instanceof Sprite) {
      let bigger;
      let smaller;

      
      if (this.width > obj.frameWidth || this.height > obj.frameHeight) {
        bigger = this;
        smaller = obj;
        smaller.width = obj.frameWidth * 3;
        smaller.height = obj.frameHeight * 3;
      } else {
        smaller = this;
        bigger = obj;
        bigger.width = obj.frameWidth * 3;
        bigger.height = obj.frameHeight * 3;
      }

      return checkCollision(bigger, smaller);
    }

    return false;
  }
}
