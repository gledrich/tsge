import Engine from "../built/Engine.js";

window.onload = () => {
  new DemoGame();
}

class DemoGame {
  constructor() {
    new Engine({ width: '100%', height: '100%'});
  }
}
