# Rectangle

```js
new Rectangle({
  tag: 'some-tag',
  position: new Vector2(x, y),
  width: 100,
  height: 100,
  colour: 'black',
});
```

Registers itself to the Game Engine and returns an instance of a Rectangle.

## Methods

```
hasCollided(obj): Boolean
```

Returns a boolean indicating whether the given Object is currently colliding with the instance of the Rectangle.

## Properties

`tag: String` - an identifier for the Game Object (can reference multiple objects)

`position: Object` - an object containing the `x` and `y` position of the rectangle

```js
{ x, y }
```

`width: Number` - the width of the Rectangle

`height: Number` - the height of the Rectangle

`colour: String` - the Rectangle fill colour

`zIndex: String` - the zIndex of the Rectangle

