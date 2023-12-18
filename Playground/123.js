import Engine from '../built/Engine.js';
import Text from '../built/Text.js'; 
import Vector2 from '../built/Vector2.js';

const engine = new Engine(
  {
    onLoad: () => {
      console.log('loaded');
    },
    update: () => {
      console.log('updated');
    },
  },
  {
    title: 'Playground',
    backgroundColour: '#A7DCCC',
    width: 1512,
    height: 560,
  }
)

engine.callbacks.onLoad();

const text = new Text({
  tag: 'completedText',
  colour: 'white',
  backgroundColour: '#43aa8b',
  fontSize: 50,
  zIndex: 10,
  text: 'Completed',
  height: 300,
  width: 500,
  register: true,
});
text.position = new Vector2(
  window.innerWidth / 2 - text.width / 2,
  window.innerHeight / 2 - text.height / 2
);
    