# Documentation

# Engine

```js
new Engine({
  onLoad: myOnLoadFunc(), // called once on startup
  update: myUpdateFunc(), // called 1 FPS
});
```

Returns an instance of the Game Engine.

## Methods

```
setTimeout(timeoutFn, time): Promise
```

Waits for the given time(ms) before running the function.

```
countdown(milliseconds, fn, onEnded): Void
```

Runs the given function every second until `milliseconds` has elapsed. `onEnded` is then called.

```
registerObject(object): Void
```

Registers the given Game Object to the Engine.

```
destroyObject(object): Void
```

Deletes the Game Object from the Engine.

```
destroyAll(): Void
```

Deletes all Game Objects.

## Properties

`backgroundColor: String` - the colour of the window background

`callbacks: Object` - an object containing references to the given callbacks

```js
{
  onLoad, 
  update
}
```

`width: Number` - the width of the Engine window

`height: Number` - the height of the Engine window

`cursor: String` - sets the type of mouse cursor to use

`mouseX: Number` - the `x` position of the mouse

`mouseY: Number` - the `y` position of the mouse

`fps: Number` - the current Frames Per Second
