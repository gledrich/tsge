import GameObject from './GameObject';
import TagComponent from './TagComponent';
import TransformComponent from './TransformComponent';
import EventBusComponent from './EventBusComponent';
import Component from './Component';
import Vector2 from './Vector2';

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

  it('synchronises legacy properties with TagComponent', () => {
    const obj = new MockGameObject('player', 10);
    expect(obj.tag).toBe('player');
    expect(obj.zIndex).toBe(10);
    
    obj.tag = 'enemy';
    obj.zIndex = 5;
    
    const tagComp = obj.getComponent(TagComponent)!;
    expect(tagComp.tag).toBe('enemy');
    expect(tagComp.zIndex).toBe(5);
  });

  it('synchronises transformation properties with TransformComponent', () => {
    const obj = new MockGameObject('test', 0);
    obj.position = new Vector2(10, 20);
    obj.rotation = 1.5;
    obj.scale = new Vector2(2, 2);
    
    const transform = obj.getComponent(TransformComponent)!;
    expect(transform.position.x).toBe(10);
    expect(transform.position.y).toBe(20);
    expect(transform.rotation).toBe(1.5);
    expect(transform.scale.x).toBe(2);
    expect(transform.scale.y).toBe(2);
  });

  it('manages parent-child relationships', () => {
    const parent = new MockGameObject('parent', 0);
    const child = new MockGameObject('child', 0);
    
    parent.addChild(child);
    expect(child.parent).toBe(parent);
    expect(parent.getComponent(TransformComponent)!.children.size).toBe(1);
    
    parent.removeChild(child);
    expect(child.parent).toBeUndefined();
    expect(parent.getComponent(TransformComponent)!.children.size).toBe(0);
  });
});
