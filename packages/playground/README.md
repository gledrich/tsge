# dino-ge-playground

Interactive, live-editing playground and inspector for the [dino-ge](https://www.npmjs.com/package/dino-ge) game engine.

![Dino GE Playground Preview](https://raw.githubusercontent.com/gledrich/dino-ge/main/packages/playground/assets/preview.png)

⚠️ **This project is in alpha** ⚠️

## Installation

```bash
npm install -g dino-ge-playground
```

## Usage

Run the playground in any directory where you'd like to develop game scripts:

```bash
dino-ge-playground
```

Once running, access the editor and inspector at `http://localhost:3000`.

### Features

- **Monaco Code Editor:** Modify your game logic in real-time with an integrated Monaco editor (the engine behind VS Code).
  ![Monaco Editor](https://raw.githubusercontent.com/gledrich/dino-ge/main/packages/playground/assets/editor.png)
- **Property Inspector:** Toggle the UI to inspect and adjust game object properties in real-time.
  ![Property Inspector](https://raw.githubusercontent.com/gledrich/dino-ge/main/packages/playground/assets/inspector.png)
- **Debug Mode:** Visualize collision boxes, velocity vectors, and engine state.
- **Hot Refresh:** Quickly apply changes to your code (`Ctrl + Enter` or click the refresh icon).
- **Play/Pause Controls:** Easily manage the engine loop state during development.
- **Auto-Formatting:** Integrated Prettier support for clean, consistent code.

### Script Storage

The playground automatically creates and manages a `scripts/` directory in the folder where the command is executed. All your JavaScript game scripts are stored here.

## License

MIT
