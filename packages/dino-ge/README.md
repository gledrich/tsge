# dino-ge

A lightweight, performant 2D game engine built from the ground up in TypeScript. `dino-ge` provides a robust, developer-friendly framework for building 2D web games. Friend of [dino-ge-playground](https://www.npmjs.com/package/dino-ge-playground).

⚠️ **This project is in alpha** ⚠️

## Features

- **Composition-based ECS:** Built around a flexible Entity Component System for modular game design.
- **Hierarchical Transform System:** Supports complex parent-child relationships with nested position, rotation, and scaling.
- **Pixel-Perfect Sprite Animation:** Efficiently handles spritesheets with automatic frame calculation and smooth playback.
- **Robust 2D Physics:** Impulse-based resolution with support for AABB and Circle collision primitives.
- **Customisable Camera:** Built-in support for following targets, world-to-viewport coordinate mapping, and smooth zooming.
- **Playground Integration:** Seamlessly compatible with the Dino GE Playground for rapid prototyping and live editing.

## Installation

```bash
npm install dino-ge
```

## Quick Start

```typescript
import { Engine, Sprite, Vector2 } from 'dino-ge';

class MyGame {
  constructor() {
    new Engine(
      {
        onLoad: () => this.onLoad(),
        update: () => this.onUpdate()
      },
      {
        title: 'My Game',
        width: '100%',
        height: '100%'
      }
    );
  }

  onLoad() {
    const player = new Sprite({
      tag: 'player',
      img: 'player', // Asset tag from ResourceLoader
      rows: 1,
      cols: 4,
      position: new Vector2(400, 300),
      zIndex: 10,
      scale: 3
    });
    player.play();
  }

  onUpdate() {
    // Game logic here
  }
}
```

## Documentation

Full API documentation and guides are available at [https://gledrich.github.io/dino-ge/index.html](https://gledrich.github.io/dino-ge/index.html).

## License

Dino GE is released under the MIT License.
