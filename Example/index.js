import Engine from '../built/Engine.js';
import Rectangle from '../built/Rectangle.js';
import Vector2 from '../built/Vector2.js';
import Text from '../built/Text.js';
import Sprite from '../built/Sprite.js';
import Scene from '../built/Scene.js';
import Circle from '../built/Circle.js';

class MenuScene extends Scene {
  constructor(game, onStart) {
    super();
    this.game = game;
    this.onStart = onStart;
  }

  onLoad() {
    this.game.cursor = 'pointer';

    new Text({
      tag: 'title',
      text: 'Dino Survival',
      fontSize: 60,
      colour: 'white',
      position: new Vector2(window.innerWidth / 2 - 250, 150),
      width: 500,
      zIndex: 10
    });

    new Text({
      tag: 'startBtn',
      text: 'Click to Start',
      fontSize: 30,
      colour: '#43aa8b',
      backgroundColour: 'white',
      position: new Vector2(window.innerWidth / 2 - 100, 350),
      width: 200,
      height: 60,
      zIndex: 10,
      onClick: () => this.onStart()
    });
  }
}

class PlayScene extends Scene {
  constructor(game, dinoImg, onGameOver) {
    super();
    this.game = game;
    this.dinoImg = dinoImg;
    this.onGameOver = onGameOver;
    this.stars = [];
    this.meteors = [];
    this.startTime = Date.now();
    this.score = 0;
  }

  onLoad() {
    this.game.cursor = 'none';

    const worldWidth = 2000;
    const worldHeight = 2000;

    // Drifting Stars
    for (let i = 0; i < 200; i++) {
      const star = new Rectangle({
        position: new Vector2(
          Math.random() * worldWidth,
          Math.random() * worldHeight
        ),
        width: 2,
        height: 2,
        colour: 'rgba(255, 255, 255, 0.4)',
        zIndex: 0
      });
      star.speed = 0.5 + Math.random() * 1;
      this.stars.push(star);
    }

    this.player = new Sprite({
      img: this.dinoImg,
      rows: 1,
      cols: 24,
      position: new Vector2(worldWidth / 2, worldHeight / 2),
      startCol: 4,
      endCol: 10,
      tag: 'player',
      zIndex: 5
    });
    this.player.play();

    this.scoreText = new Text({
      tag: 'score',
      text: 'Time: 0s',
      fontSize: 24,
      colour: 'white',
      position: new Vector2(20, 20),
      width: 150,
      zIndex: 10
    });
  }

  update() {
    // Player follow mouse (velocity-based)
    const targetX = this.game.mouseX - this.player.width / 2;
    const targetY = this.game.mouseY - this.player.height / 2;

    // Dampened movement (multiplied by 5 instead of 10)
    this.player.velocity.x = (targetX - this.player.position.x) * 5;
    this.player.velocity.y = (targetY - this.player.position.y) * 5;

    // Camera follows player
    Engine.camera.follow(this.player, window.innerWidth, window.innerHeight);

    // Keep UI fixed by moving it with camera
    this.scoreText.position.x = Engine.camera.position.x + 20;
    this.scoreText.position.y = Engine.camera.position.y + 20;

    // Flip dino based on mouse
    this.player.flip =
      this.game.mouseX < this.player.position.x + this.player.width / 2;

    // Star drift
    this.stars.forEach((star) => {
      star.position.y += star.speed;
      if (star.position.y > 2000) star.position.y = 0;
    });

    // Spawn Meteors (Circles)
    if (Math.random() < 0.02) {
      const radius = 15 + Math.random() * 20;
      const meteor = new Circle({
        position: new Vector2(Math.random() * 2000, Engine.camera.position.y - 100),
        radius: radius,
        colour: '#F94144',
        zIndex: 4,
        tag: 'meteor'
      });
      // Set initial velocity (Lowered)
      meteor.velocity.y = 100 + Math.random() * 200;
      // Add small gravity (Lowered)
      meteor.acceleration.y = 50;
      this.meteors.push(meteor);
    }

    // Update Meteors & Collision
    this.meteors = this.meteors.filter((meteor) => {
      if (this.player.hasCollided(meteor)) {
        this.onGameOver(this.score);
        return false;
      }

      if (
        meteor.position.y >
        Engine.camera.position.y + window.innerHeight + 100
      ) {
        meteor.destroySelf();
        return false;
      }
      return true;
    });

    this.score = Math.floor((Date.now() - this.startTime) / 1000);
    this.scoreText.text = `Time: ${this.score}s`;
  }
}

class GameOverScene extends Scene {
  constructor(game, score, onRestart) {
    super();
    this.game = game;
    this.score = score;
    this.onRestart = onRestart;
  }

  onLoad() {
    this.game.cursor = 'pointer';

    new Text({
      tag: 'gameOver',
      text: 'GAME OVER',
      fontSize: 60,
      colour: '#F94144',
      position: new Vector2(window.innerWidth / 2 - 200, 150),
      width: 400,
      zIndex: 10
    });

    new Text({
      tag: 'finalScore',
      text: `You survived ${this.score} seconds!`,
      fontSize: 30,
      colour: 'white',
      position: new Vector2(window.innerWidth / 2 - 200, 250),
      width: 400,
      zIndex: 10
    });

    new Text({
      tag: 'restartBtn',
      text: 'Try Again',
      fontSize: 25,
      colour: 'white',
      backgroundColour: '#577590',
      position: new Vector2(window.innerWidth / 2 - 100, 400),
      width: 200,
      height: 50,
      zIndex: 10,
      onClick: () => this.onRestart()
    });
  }
}

class DinoSurvival {
  constructor() {
    this.dinoImg = new Image();
    this.dinoImg.src = './sprites/DinoSprites - doux.png';

    this.game = new Engine(
      { onLoad: () => this.showMenu(), update: () => {} },
      { title: 'Dino Survival', backgroundColour: '#264653' }
    );
  }

  showMenu() {
    Engine.currentScene = new MenuScene(this.game, () => this.startGame());
  }

  startGame() {
    Engine.currentScene = new PlayScene(this.game, this.dinoImg, (score) =>
      this.showGameOver(score)
    );
  }

  showGameOver(score) {
    Engine.currentScene = new GameOverScene(this.game, score, () =>
      this.showMenu()
    );
  }
}

// When not using the Playground
// window.onload = () => {
//   new DinoSurvival();
// };

// When using Playground
new DinoSurvival();
