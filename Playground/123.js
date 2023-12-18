import Text from '../built/Text.js';
import Vector2 from '../built/Vector2.js';
import {
  engine
} from './index.js';

const text = new Text({
  tag: 'exampleTag',
  colour: 'white',
  backgroundColour: '#43aa8b',
  fontSize: 50,
  zIndex: 10,
  text: 'Hello World',
  height: 100,
  width: 400,
  register: true,
});
text.position = new Vector2(
  engine.width / 2 - text.width / 2,
  engine.height / 2 - text.height / 2
);

