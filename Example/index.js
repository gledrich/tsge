import Engine from '../built/Engine.js';
import Line from '../built/Line.js';
import Vector2 from '../built/Vector2.js';
import Text from '../built/Text.js';


window.onload = () => {
  new DemoGame();
};

class DemoGame {
  constructor() {
    const game = new Engine(
      { onLoad: this.onLoad },
      {
        width: '100%',
        height: '100%',
        title: 'Demo Game',
        backgroundColour: '#A7DCCC',
      }
    );

    game.callbacks.onLoad();
  }

  onLoad() {
    const titleText = new Text({
      tag: 'titleText',
      colour: 'white',
      backgroundColour: '#43aa8b',
      fontSize: 50,
      zIndex: 10,
      text: 'Demo Game',
      height: 300,
      width: 500,
    });
    titleText.position = new Vector2(
      window.innerWidth / 2 - titleText.width / 2,
      window.innerHeight / 2 - titleText.height / 2,
    );
  }
}
