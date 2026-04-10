import Engine from '/built/Engine.js';
import Rectangle from '/built/Rectangle.js';
import Vector2 from '/built/Vector2.js';
import Text from '/built/Text.js';
import Sprite from '/built/Sprite.js';
import Scene from '/built/Scene.js';
import Circle from '/built/Circle.js';
import Physics from '/built/Physics.js';
import ResourceLoader from '/built/Loader.js';
import Input from '/built/Input.js';
import Tilemap from '/built/Tilemap.js';
import PhysicsComponent from '/built/PhysicsComponent.js';
import TransformComponent from '/built/TransformComponent.js';
import VisibilityComponent from '/built/VisibilityComponent.js';
import Group from '/built/Group.js';

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
  static WORLD_WIDTH = 2000;
  static WORLD_HEIGHT = 2000;

  constructor(game, onGameOver) {
    super();
    this.game = game;
    this.onGameOver = onGameOver;
    this.starsFar = [];
    this.starsMid = [];
    this.starsNear = [];
    this.meteors = [];
    this.fireballs = [];
    this.particles = [];
    this.startTime = Date.now();
    this.lastShotTime = 0;
    this.shotCooldown = 250; // ms
    this.score = 0;
    this.lives = 3;
    this.isInvulnerable = false;
    this.invulnerabilityDuration = 1500; // 1.5s
    this.lastHitTime = 0;
    this.shakeIntensity = 0;
    this.shakeDecay = 0.9;
    this.highScore = parseInt(localStorage.getItem('dinoHighScore') || '0', 10);
  }

  onLoad() {
    this.game.cursor = 'none';

    // Generate a programmatic Grid Tile for the Tilemap
    const c = document.createElement('canvas');
    c.width = 100;
    c.height = 100;
    const ctx = c.getContext('2d');
    ctx.strokeStyle = 'rgba(67, 170, 139, 0.15)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 100, 100);
    const gridImg = new Image();
    gridImg.src = c.toDataURL();

    // 20x20 grid of tile index 0
    const mapData = Array(20)
      .fill(0)
      .map(() => Array(20).fill(0));

    new Tilemap({
      tag: 'grid',
      tileset: gridImg,
      data: mapData,
      tileSize: 100,
      tilesetCols: 1,
      position: new Vector2(0, 0),
      zIndex: -1 // Behind everything
    });

    // Group Stars for a cleaner Scene Explorer
    this.starsContainer = new Group('stars-root', 0);

    const farStarsLayer = new Group('stars-far', 0);
    const midStarsLayer = new Group('stars-mid', 1);
    const nearStarsLayer = new Group('stars-near', 2);

    this.starsContainer.transform.addChild(farStarsLayer.transform);
    this.starsContainer.transform.addChild(midStarsLayer.transform);
    this.starsContainer.transform.addChild(nearStarsLayer.transform);

    // Distant Stars (Static-ish, very faint)
    for (let i = 0; i < 200; i++) {
      const star = new Rectangle({
        position: new Vector2(
          Math.random() * PlayScene.WORLD_WIDTH,
          Math.random() * PlayScene.WORLD_HEIGHT
        ),
        width: 1,
        height: 1,
        colour: 'rgba(255, 255, 255, 0.1)',
        zIndex: 0
      });
      farStarsLayer.transform.addChild(star.transform);
      this.starsFar.push(star);
    }

    // Mid Stars (Moderate speed)
    for (let i = 0; i < 100; i++) {
      const star = new Rectangle({
        position: new Vector2(
          Math.random() * PlayScene.WORLD_WIDTH,
          Math.random() * PlayScene.WORLD_HEIGHT
        ),
        width: 2,
        height: 2,
        colour: 'rgba(255, 255, 255, 0.4)',
        zIndex: 1
      });
      star.speed = 0.5 + Math.random() * 1;
      midStarsLayer.transform.addChild(star.transform);
      this.starsMid.push(star);
    }

    // Near Stars (Very fast, large, bright)
    for (let i = 0; i < 40; i++) {
      const star = new Rectangle({
        position: new Vector2(
          Math.random() * PlayScene.WORLD_WIDTH,
          Math.random() * PlayScene.WORLD_HEIGHT
        ),
        width: 3,
        height: 3,
        colour: 'rgba(255, 255, 255, 0.9)',
        zIndex: 2
      });
      star.speed = 3 + Math.random() * 4;
      nearStarsLayer.transform.addChild(star.transform);
      this.starsNear.push(star);
    }

    this.player = new Sprite({
      img: 'dino',
      rows: 1,
      cols: 24,
      position: new Vector2(
        PlayScene.WORLD_WIDTH / 2,
        PlayScene.WORLD_HEIGHT / 2
      ),
      startCol: 4,
      endCol: 10,
      tag: 'player',
      zIndex: 5,
      scale: 3
    });
    this.player.addComponent(new VisibilityComponent());
    this.player.addComponent(new PhysicsComponent());
    this.player.play();

    // Scene Graph Parenting
    // Create a name tag for the dino
    this.nameTag = new Text({
      tag: 'name-tag',
      text: 'Dino',
      fontSize: 12,
      colour: 'white',
      position: new Vector2(-5, 20), // Compensated for parent scale: 3
      width: 100,
      zIndex: 6
    });
    this.nameTag.transform.scale = new Vector2(0.333, 0.333); // Keep size absolute
    this.player.transform.addChild(this.nameTag.transform);

    // Group UI elements under a container
    this.uiContainer = new Group('ui-root', 10);

    this.scoreText = new Text({
      tag: 'score',
      text: 'Score: 0',
      fontSize: 24,
      colour: 'white',
      position: new Vector2(window.innerWidth / 2 - 75, 20),
      width: 150,
      zIndex: 10
    });

    this.livesText = new Text({
      tag: 'lives',
      text: 'Lives: 3',
      fontSize: 24,
      colour: '#F94144',
      position: new Vector2(20, 60),
      width: 100,
      zIndex: 10
    });

    this.uiContainer.transform.addChild(this.scoreText.transform);
    this.uiContainer.transform.addChild(this.livesText.transform);
  }

  update() {
    // Determine target velocity from keyboard
    const moveSpeed = 200; // Reduced from 250/400
    let targetVX = 0;
    let targetVY = 0;

    if (Input.isKeyDown('w') || Input.isKeyDown('arrowup'))
      targetVY = -moveSpeed;
    else if (Input.isKeyDown('s') || Input.isKeyDown('arrowdown'))
      targetVY = moveSpeed;

    if (Input.isKeyDown('a') || Input.isKeyDown('arrowleft'))
      targetVX = -moveSpeed;
    else if (Input.isKeyDown('d') || Input.isKeyDown('arrowright'))
      targetVX = moveSpeed;

    // Basic normalization if moving diagonally
    if (targetVX !== 0 && targetVY !== 0) {
      targetVX *= 0.707;
      targetVY *= 0.707;
    }

    const playerPhysics = this.player.getComponent(PhysicsComponent);
    playerPhysics.velocity.x = targetVX;
    playerPhysics.velocity.y = targetVY;

    const playerTransform = this.player.getComponent(TransformComponent);

    // Bounds Checking
    if (playerTransform.position.x < 0) playerTransform.position.x = 0;
    if (
      playerTransform.position.x >
      PlayScene.WORLD_WIDTH - this.player.bounds.width
    )
      playerTransform.position.x =
        PlayScene.WORLD_WIDTH - this.player.bounds.width;
    if (playerTransform.position.y < 0) playerTransform.position.y = 0;
    if (
      playerTransform.position.y >
      PlayScene.WORLD_HEIGHT - this.player.bounds.height
    )
      playerTransform.position.y =
        PlayScene.WORLD_HEIGHT - this.player.bounds.height;

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
          this.player.transform.position.x + this.player.bounds.width / 2 - 5,
          this.player.transform.position.y
        ),
        radius: 5,
        colour: '#FFB703',
        zIndex: 6,
        tag: 'fireball'
      });
      fireball.addComponent(new PhysicsComponent());
      fireball.getComponent(PhysicsComponent).velocity.y = -600; // Fast upwards
      this.fireballs.push(fireball);
      this.lastShotTime = Date.now();
    }

    // Cleanup off-screen fireballs
    this.fireballs = this.fireballs.filter((fb) => {
      if (fb.transform.position.y < Engine.camera.position.y - 50) {
        fb.destroySelf();
        return false;
      }
      return true;
    });

    // Fireball Collision with Meteors
    this.fireballs = this.fireballs.filter((fb) => {
      let hit = false;
      this.meteors = this.meteors.filter((m) => {
        if (Physics.checkCollision(fb, m)) {
          console.log(`Meteor destroyed! Score +10. Total: ${this.score + 10}`);
          this.spawnExplosion(m.transform.position, m.radius, m.colour);
          m.destroySelf();
          this.score += 10;
          this.shakeIntensity = Math.max(this.shakeIntensity, 5); // Small shake on destroy
          hit = true;
          return false;
        }
        return true;
      });

      if (hit) {
        fb.destroySelf();
        return false;
      }
      return true;
    });

    // Update and Cleanup Particles
    this.particles = this.particles.filter((p) => {
      p.life -= 0.02;
      if (p.life <= 0) {
        p.destroySelf();
        return false;
      }
      return true;
    });

    // Camera follows player
    Engine.camera.follow(this.player, window.innerWidth, window.innerHeight);

    // Apply Screen Shake
    if (this.shakeIntensity > 0.1) {
      Engine.camera.position.x += (Math.random() - 0.5) * this.shakeIntensity;
      Engine.camera.position.y += (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeIntensity *= this.shakeDecay;
    } else {
      this.shakeIntensity = 0;
    }

    // Update Invulnerability
    if (this.isInvulnerable) {
      const visibility = this.player.getComponent(VisibilityComponent);
      if (visibility) {
        // Flicker effect
        visibility.visible = Math.floor(Date.now() / 100) % 2 === 0;

        if (Date.now() - this.lastHitTime > this.invulnerabilityDuration) {
          this.isInvulnerable = false;
          visibility.visible = true;
        }
      }
    }

    // Keep UI fixed by moving the container with camera
    this.uiContainer.transform.position.x = Engine.camera.position.x;
    this.uiContainer.transform.position.y = Engine.camera.position.y;

    // Star drift (Parallax)
    this.starsMid.forEach((star) => {
      star.transform.position.y += star.speed;
      if (star.transform.position.y > PlayScene.WORLD_HEIGHT)
        star.transform.position.y = 0;
    });
    this.starsNear.forEach((star) => {
      star.transform.position.y += star.speed;
      if (star.transform.position.y > PlayScene.WORLD_HEIGHT)
        star.transform.position.y = 0;
    });

    // Spawn Meteors (Spawn within camera view)
    if (Math.random() < 0.05) {
      // Increased spawn rate
      const radius = 15 + Math.random() * 20;
      const spawnX =
        Engine.camera.position.x + Math.random() * window.innerWidth;

      const meteor = new Circle({
        position: new Vector2(spawnX, Engine.camera.position.y - 100),
        radius: radius,
        colour: '#F94144',
        zIndex: 4,
        tag: 'meteor'
      });
      // Set initial velocity
      meteor.addComponent(new PhysicsComponent());
      const meteorPhys = meteor.getComponent(PhysicsComponent);
      meteorPhys.velocity.y = 100 + Math.random() * 200;
      // Add small gravity
      meteorPhys.acceleration.y = 50;
      this.meteors.push(meteor);
    }

    // Update Meteors & Collision
    this.meteors = this.meteors.filter((meteor) => {
      if (!this.isInvulnerable && Physics.checkCollision(this.player, meteor)) {
        this.lives -= 1;
        console.log(`Player hit! Lives remaining: ${this.lives}`);
        this.livesText.text = `Lives: ${this.lives}`;
        this.shakeIntensity = 20; // Big shake on hit

        if (this.lives <= 0) {
          const finalScore =
            this.score + Math.floor((Date.now() - this.startTime) / 1000);
          console.log(`Game Over! Final Score: ${finalScore}`);
          if (finalScore > this.highScore) {
            console.log(`New High Score: ${finalScore}!`);
            localStorage.setItem('dinoHighScore', finalScore.toString());
          }
          this.onGameOver(finalScore);
          return false;
        } else {
          this.isInvulnerable = true;
          this.lastHitTime = Date.now();
          this.spawnExplosion(this.player.transform.position, 20, '#F94144'); // Mini explosion on hit
          return false; // Destroy the meteor that hit us
        }
      }

      if (
        meteor.transform.position.y >
        Engine.camera.position.y + window.innerHeight + 100
      ) {
        meteor.destroySelf();
        return false;
      }
      return true;
    });

    const timeScore = Math.floor((Date.now() - this.startTime) / 1000);
    this.scoreText.text = `Score: ${this.score + timeScore}`;
  }

  spawnExplosion(pos, radius, colour) {
    const particleCount = 8;
    for (let i = 0; i < particleCount; i++) {
      const p = new Circle({
        position: new Vector2(pos.x + radius, pos.y + radius),
        radius: 2 + Math.random() * 3,
        colour: colour,
        zIndex: 3,
        tag: 'particle'
      });
      p.addComponent(new PhysicsComponent());
      const pPhys = p.getComponent(PhysicsComponent);
      pPhys.velocity.x = (Math.random() - 0.5) * 400;
      pPhys.velocity.y = (Math.random() - 0.5) * 400;
      p.life = 1.0; // Life starts at 1.0 and fades
      this.particles.push(p);
    }
  }
}

class GameOverScene extends Scene {
  constructor(game, score, onRestart) {
    super();
    this.game = game;
    this.score = score;
    this.onRestart = onRestart;
    this.highScore = parseInt(localStorage.getItem('dinoHighScore') || '0', 10);
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
      text: `Score: ${this.score}`,
      fontSize: 30,
      colour: 'white',
      position: new Vector2(window.innerWidth / 2 - 200, 230),
      width: 400,
      zIndex: 10
    });

    new Text({
      tag: 'highScore',
      text: `Best: ${this.highScore}`,
      fontSize: 24,
      colour: '#FFB703',
      position: new Vector2(window.innerWidth / 2 - 200, 280),
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

          // Use Event Bus for Game State management
          Engine.on('GAME_OVER', (e) => this.showGameOver(e.detail));
          Engine.on('START_GAME', () => this.startGame());
          Engine.on('SHOW_MENU', () => this.showMenu());

          this.showMenu();
        },
        update: () => {}
      },
      { title: 'Dino Survival', backgroundColour: '#264653' }
    );
  }

  showMenu() {
    Engine.currentScene = new MenuScene(this.game, () =>
      Engine.emit('START_GAME')
    );
  }

  startGame() {
    Engine.currentScene = new PlayScene(this.game, (score) =>
      Engine.emit('GAME_OVER', score)
    );
  }

  showGameOver(score) {
    Engine.currentScene = new GameOverScene(this.game, score, () =>
      Engine.emit('SHOW_MENU')
    );
  }
}

// When using Playground
new DinoSurvival();
