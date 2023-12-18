import Text from '../built/Text.js';
import Vector2 from '../built/Vector2.js';

const text = new Text({
  tag: 'completedText',
  colour: 'white',
  backgroundColour: '#43aa8b',
  fontSize: 50,
  zIndex: 10,
  text: 'Completed it m8',
  height: 100,
  width: 500,
  register: true,
});

text.position = new Vector2(
  window.innerWidth / 2 - text.width / 2,
  window.innerHeight / 2 - text.height / 2
);


