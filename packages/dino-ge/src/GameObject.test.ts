import GameObject from './GameObject';
import TagComponent from './TagComponent';
import TransformComponent from './TransformComponent';
import EventBusComponent from './EventBusComponent';
import Component from './Component';

class MockGameObject extends GameObject {}
class MockComponent extends Component {}

describe('GameObject', () => {
  it('initialises with required default components', () => {
    const obj = new MockGameObject('player', 10);
    expect(obj.hasComponent(TagComponent)).toBe(true);
    expect(obj.hasComponent(TransformComponent)).toBe(true);
    // EventBus should not be there yet (lazy loaded)
    expect(obj.hasComponent(EventBusComponent)).toBe(false);
  });

  it('handles component management correctly', () => {
    const obj = new MockGameObject('test', 0);
    const component = new MockComponent();
    
    obj.addComponent(component);
    expect(obj.hasComponent(MockComponent)).toBe(true);
    expect(obj.getComponent(MockComponent)).toBe(component);
    expect(component.gameObject).toBe(obj);
    
    obj.removeComponent(MockComponent);
    expect(obj.hasComponent(MockComponent)).toBe(false);
  });

  it('lazy loads EventBusComponent when using events', () => {
    const obj = new MockGameObject('test', 0);
    const callback = jest.fn();
    
    obj.on('test-event', callback);
    expect(obj.hasComponent(EventBusComponent)).toBe(true);
    
    obj.emit('test-event', { data: 123 });
    expect(callback).toHaveBeenCalled();
  });

  it('provides direct access to core components', () => {
    const obj = new MockGameObject('player', 10);
    expect(obj.metadata).toBeInstanceOf(TagComponent);
    expect(obj.transform).toBeInstanceOf(TransformComponent);
    expect(obj.metadata.tag).toBe('player');
    expect(obj.metadata.zIndex).toBe(10);
  });

  it('manages parent-child relationships via transform', () => {
    const parent = new MockGameObject('parent', 0);
    const child = new MockGameObject('child', 0);
    
    parent.transform.addChild(child.transform);
    expect(child.transform.parent).toBe(parent.transform);
    expect(parent.transform.children.has(child.transform)).toBe(true);
    
    parent.transform.removeChild(child.transform);
    expect(child.transform.parent).toBeUndefined();
    expect(parent.transform.children.has(child.transform)).toBe(false);
  });
});
