import Component from './Component.js';
import GameObject from './GameObject.js';

// Concrete implementation for testing
class MockComponent extends Component {}
class MockGameObject extends GameObject {}

describe('Component', () => {
  it('allows setting and getting gameObject', () => {
    const component = new MockComponent();
    const gameObject = new MockGameObject('test', 0);
    
    component.gameObject = gameObject;
    expect(component.gameObject).toBe(gameObject);
  });
});
