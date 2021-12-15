import Engine from '../built/Engine.js';
import Line from '../built/Line.js';

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

    console.log(game);
    game.callbacks.onLoad();
  }

  onLoad() {
    const line = new Line({
      tag: 'line',
      width: 1,
      zIndex: '0',
      p1: { x: 0, y: 0 },
      p2: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    });
  }
}
