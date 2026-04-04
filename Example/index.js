import Engine from '../built/Engine.js';
import Rectangle from '../built/Rectangle.js';
import Vector2 from '../built/Vector2.js';
import Text from '../built/Text.js';
import Sprite from '../built/Sprite.js';
import Scene from '../built/Scene.js';
import Circle from '../built/Circle.js';
import Physics from '../built/Physics.js';
import ResourceLoader from '../built/Loader.js';
import Input from '../built/Input.js';

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
  constructor(game, onGameOver) {
    super();
    this.game = game;
    this.onGameOver = onGameOver;
    this.starsFar = [];
    this.starsMid = [];
    this.starsNear = [];
    this.meteors = [];
    this.fireballs = [];
    this.startTime = Date.now();
    this.lastShotTime = 0;
    this.shotCooldown = 250; // ms
    this.score = 0;
  }

  onLoad() {
    this.game.cursor = 'none';

    const worldWidth = 2000;
    const worldHeight = 2000;

    // Distant Stars (Static-ish, very faint)
    for (let i = 0; i < 200; i++) {
      this.starsFar.push(new Rectangle({
        position: new Vector2(Math.random() * worldWidth, Math.random() * worldHeight),
        width: 1, height: 1, colour: 'rgba(255, 255, 255, 0.1)', zIndex: 0
      }));
    }

    // Mid Stars (Moderate speed)
    for (let i = 0; i < 100; i++) {
      const star = new Rectangle({
        position: new Vector2(Math.random() * worldWidth, Math.random() * worldHeight),
        width: 2, height: 2, colour: 'rgba(255, 255, 255, 0.4)', zIndex: 1
      });
      star.speed = 0.5 + Math.random() * 1;
      this.starsMid.push(star);
    }

    // Near Stars (Very fast, large, bright)
    for (let i = 0; i < 40; i++) {
      const star = new Rectangle({
        position: new Vector2(Math.random() * worldWidth, Math.random() * worldHeight),
        width: 3, height: 3, colour: 'rgba(255, 255, 255, 0.9)', zIndex: 2
      });
      star.speed = 3 + Math.random() * 4;
      this.starsNear.push(star);
    }

    this.player = new Sprite({
      img: 'dino',
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
      position: new Vector2(window.innerWidth / 2 - 75, 20),
      width: 150,
      zIndex: 10
    });
  }

  update() {
    // Determine target velocity from keyboard
    const moveSpeed = 250;
    let targetVX = 0;
    let targetVY = 0;

    if (Input.isKeyDown('w') || Input.isKeyDown('arrowup')) targetVY = -moveSpeed;
    else if (Input.isKeyDown('s') || Input.isKeyDown('arrowdown')) targetVY = moveSpeed;
    
    if (Input.isKeyDown('a') || Input.isKeyDown('arrowleft')) targetVX = -moveSpeed;
    else if (Input.isKeyDown('d') || Input.isKeyDown('arrowright')) targetVX = moveSpeed;
    
    // Basic normalization if moving diagonally
    if (targetVX !== 0 && targetVY !== 0) {
      targetVX *= 0.707;
      targetVY *= 0.707;
    }
    
    this.player.velocity.x = targetVX;
    this.player.velocity.y = targetVY;
    
    if (targetVX < 0) {
      this.player.flip = true;
    } else if (targetVX > 0) {
      this.player.flip = false;
    }

    // Shooting System
    const canShoot = Date.now() - this.lastShotTime > this.shotCooldown;
    const isShooting = Input.isKeyDown(' ') || Input.isKeyDown('mouse0');

    if (canShoot && isShooting) {
      const fireball = new Circle({
        position: new Vector2(
          this.player.position.x + this.player.width / 2 - 5,
          this.player.position.y
        ),
        radius: 5,
        colour: '#FFB703',
        zIndex: 6,
        tag: 'fireball'
      });
      fireball.velocity.y = -600; // Fast upwards
      this.fireballs.push(fireball);
      this.lastShotTime = Date.now();
    }

    // Cleanup off-screen fireballs
    this.fireballs = this.fireballs.filter((fb) => {
      if (fb.position.y < Engine.camera.position.y - 50) {
        fb.destroySelf();
        return false;
      }
      return true;
    });

    // Camera follows player
    Engine.camera.follow(this.player, window.innerWidth, window.innerHeight);

    // Keep UI fixed by moving it with camera
    this.scoreText.position.x = Engine.camera.position.x + window.innerWidth / 2 - 75;
    this.scoreText.position.y = Engine.camera.position.y + 20;

    // Star drift (Parallax)
    this.starsMid.forEach((star) => {
      star.position.y += star.speed;
      if (star.position.y > 2000) star.position.y = 0;
    });
    this.starsNear.forEach((star) => {
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
      // Set initial velocity
      meteor.velocity.y = 100 + Math.random() * 200;
      // Add small gravity
      meteor.acceleration.y = 50;
      this.meteors.push(meteor);
    }

    // Update Meteors & Collision
    this.meteors = this.meteors.filter((meteor) => {
      if (Physics.checkCollision(this.player, meteor)) {
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
    this.game = new Engine(
      { 
        onLoad: async () => {
          ResourceLoader.queueImage('dino', './sprites/DinoSprites - doux.png');
          await ResourceLoader.loadAll((percent) => {
            console.log(`Loading: ${Math.round(percent)}%`);
          });
          this.showMenu();
        }, 
        update: () => {} 
      },
      { title: 'Dino Survival', backgroundColour: '#264653' }
    );
  }

  showMenu() {
    Engine.currentScene = new MenuScene(this.game, () => this.startGame());
  }

  startGame() {
    Engine.currentScene = new PlayScene(this.game, (score) =>
      this.showGameOver(score)
    );
  }

  showGameOver(score) {
    Engine.currentScene = new GameOverScene(this.game, score, () =>
      this.showMenu()
    );
  }
}

// When using Playground
new DinoSurvival();
