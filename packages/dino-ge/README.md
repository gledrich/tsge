# dino-ge

A lightweight, performant 2D game engine built from the ground up in TypeScript. `dino-ge` provides a robust, developer-friendly framework for building commercial-quality 2D web games.

## Features

-   **Composition-based Architecture:** Flexible `GameObject` system for managing game entities.
-   **Built-in Physics:** Integrated 2D physics with support for AABB collision detection.
-   **Rendering System:** High-performance canvas-based rendering for sprites, tilemaps, and primitives.
-   **Input Management:** Easy-to-use handling for keyboard and mouse events.
-   **Asset Loading:** Efficient resource management and preloading for textures and images.
-   **Camera System:** Dynamic camera with support for zooming and following.
-   **TypeScript Native:** Full type safety and modern ES module support.

## Installation

```bash
npm install dino-ge
```

## Quick Start

```typescript
import { Engine, Scene, Sprite, Vector2, Loader } from 'dino-ge';

const engine = new Engine({
  onLoad: async () => {
    // Load assets
    Loader.queueImage('player', 'assets/player.png');
    await Loader.loadAll();
    
    // Create and set scene
    const scene = new MyGameScene();
    Engine.currentScene = scene;
  },
  update: () => {
    // Global update logic
  }
}, {
  title: 'My Dino Game',
  backgroundColour: '#264653'
});

class MyGameScene extends Scene {
  onLoad() {
    const player = new Sprite({
      tag: 'player',
      img: 'player',
      rows: 1,
      cols: 4,
      position: new Vector2(400, 300),
      zIndex: 10
    });
    player.play();
  }
}
```

## Documentation

Full API documentation and guides are available at [https://gledrich.github.io/dino-ge/index.html](https://gledrich.github.io/dino-ge/index.html).

## License

Dino GE is released under the MIT License.
