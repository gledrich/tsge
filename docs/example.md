# Example

```js
import Engine from '../built/Engine.js';
import Rectangle from '../built/Rectangle.js';
import Vector2 from '../built/Vector2.js';
import Text from '../built/Text.js';
import Sprite from '../built/Sprite.js';

class DemoGame {
  constructor() {
    window.showFPS = this.showFPS.bind(this);
    window.hideFPS = this.hideFPS.bind(this);

    // 0: Load, 1: Play, 2: Restart
    this.gameState = 0;

    this.game = new Engine(
      {
        onLoad: this.onLoad.bind(this),
        update: this.update.bind(this),
      },
      {
        title: 'Demo Game',
        backgroundColour: '#A7DCCC',
      }
    );

    this.game.cursor = 'pointer';

    this.game.callbacks.onLoad();

    this.completedText = new Text({
      tag: 'completedText',
      colour: 'white',
      backgroundColour: '#43aa8b',
      fontSize: 50,
      zIndex: 10,
      text: 'Completed',
      height: 300,
      width: 500,
      register: false,
    });
    this.completedText.position = new Vector2(
      window.innerWidth / 2 - this.completedText.width / 2,
      window.innerHeight / 2 - this.completedText.height / 2
    );

    this.restartText = new Text({
      tag: 'restartText',
      colour: 'white',
      backgroundColour: '#577590',
      fontSize: 30,
      zIndex: 20,
      text: 'Restart',
      register: false,
      onClick: () => {
        this.restart();
      },
    });
    this.restartText.position = new Vector2(
      this.completedText.position.x +
        (this.completedText.width / 2 - this.restartText.width / 2),
      this.completedText.position.y +
        (this.completedText.height - this.restartText.height)
    );
  }

  onLoad() {
    console.log('loaded game');

    this.food = new Set();

    if (this.gameState === 0) {
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
        window.innerHeight / 2 - titleText.height / 2
      );

      const countDownText = new Text({
        tag: 'restartText',
        colour: 'white',
        backgroundColour: '#577590',
        width: 100,
        fontSize: 30,
        zIndex: 20,
        text: '3',
      });
      countDownText.position = new Vector2(
        titleText.position.x + (titleText.width / 2 - countDownText.width / 2),
        titleText.position.y + (titleText.height - countDownText.height)
      );

      this.game.countdown(
        3000,
        () => {
          countDownText.text = `${parseInt(countDownText.text, 10) - 1}`;
        },
        () => {
          countDownText.destroySelf();
        }
      );

      this.game
        // remove start screen
        .setTimeout(titleText.destroySelf.bind(titleText), 3000)
        .then(() => {
          this.gameState = 1;

          for (let i = 0; i < 10; i += 1) {
            const dinoImg = new Image();
            dinoImg.src = './sprites/DinoSprites - doux.png';
            const food = new Sprite({
              img: dinoImg,
              rows: 1,
              cols: 24,
              position: new Vector2(
                Math.floor(Math.random() * (window.innerWidth - 300)),
                Math.floor(i * (window.innerHeight / 10))
              ),
              startCol: 20,
              endCol: 24,
              tag: 'dino',
            });

            food.flipLeft = [true, false][Math.random() * 2 - 1];
            food.flipRight = !!food.flipLeft;

            this.food.add(food);
          }

          // draw player
          this.player = new Rectangle({
            position: new Vector2(
              window.innerWidth / 2,
              window.innerHeight / 2
            ),
            width: 50,
            height: 50,
            colour: '#F94144',
            zIndex: 1,
          });
          this.player.grow = () => {
            const growBy = 10;

            this.player.width += growBy;
            this.player.height += growBy;
          };
        });
    }
  }

  update() {
    if (this.fpsCounter) {
      this.fpsCounter.text = `FPS: ${this.game.fps}`;
    }

    // Check if game is playing
    if (this.gameState === 1) {
      // hide mouse cursor
      this.game.cursor = 'none';

      // center player around mouse pos
      this.player.position = new Vector2(
        this.game.mouseX - this.player.width / 2,
        this.game.mouseY - this.player.height / 2
      );

      // handle food + player collision
      this.food.forEach((pieceOfFood, i) => {
        setTimeout(() => pieceOfFood.play(), Math.random() * 1);

        const speed = 3;

        if (pieceOfFood.flip) {
          pieceOfFood.position.x -= speed;
        } else {
          pieceOfFood.position.x += speed;
        }

        if (
          pieceOfFood.position.x >=
          window.innerWidth - pieceOfFood.frameWidth
        ) {
          pieceOfFood.flip = true;
        }

        if (pieceOfFood.position.x <= 0) {
          pieceOfFood.flip = false;
        }

        if (this.player.hasCollided(pieceOfFood)) {
          if (this.food.size === 1) {
            pieceOfFood.stop();
          } else {
            setTimeout(() => {
              pieceOfFood.stop();
            }, 300);
          }

          this.food.delete(pieceOfFood);
          this.player.grow();
        }
      });

      if (!this.food.size) {
        this.gameState = 2;
      }
    }

    // game ended
    if (!this.food.size && this.gameState === 2) {
      this.player.destroySelf();
      this.game.cursor = 'pointer';

      if (!this.completedText.registered) {
        this.completedText.registerSelf();
      }

      if (!this.restartText.registered) {
        this.restartText.registerSelf();
      }
    }
  }

  restart() {
    this.gameState = 0;
    this.completedText.destroySelf();
    this.restartText.destroySelf();
    this.player.destroySelf();
    this.onLoad();
  }

  showFPS() {
    this.fpsCounter = new Text({
      tag: 'fpsCounterText',
      colour: '#577590',
      zIndex: 10,
      text: 'FPS: 0',
    });
  }

  hideFPS() {
    this.fpsCounter.destroySelf();
  }
}

new DemoGame();
```
