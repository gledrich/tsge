import GameObject from './GameObject';
import TagComponent from './TagComponent';
import TransformComponent from './TransformComponent';
import EventBusComponent from './EventBusComponent';
import Component from './Component';
import Engine from './Engine';

class MockGameObject extends GameObject {}
class MockComponent extends Component {}

abstract class BaseComponent extends Component {
  abstract value: string;
}

class DerivedComponent extends BaseComponent {
  value = 'derived';
}

class AnotherDerivedComponent extends BaseComponent {
  value = 'another';
}

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

  it('retrieves a component by its base class', () => {
    const obj = new MockGameObject('test', 0);
    const derived = new DerivedComponent();
    obj.addComponent(derived);

    const retrieved = obj.getComponent(BaseComponent);
    expect(retrieved).toBe(derived);
  });

  it('overwrites base class index when a newer component of same family is added', () => {
    const obj = new MockGameObject('test', 0);
    const d1 = new DerivedComponent();
    const d2 = new AnotherDerivedComponent();
    
    obj.addComponent(d1);
    obj.addComponent(d2);

    expect(obj.getComponent(DerivedComponent)).toBe(d1);
    expect(obj.getComponent(AnotherDerivedComponent)).toBe(d2);
    expect(obj.getComponent(BaseComponent)).toBe(d2); // Overwritten
  });

  it('removes all indexed keys when a component is removed', () => {
    const obj = new MockGameObject('test', 0);
    const derived = new DerivedComponent();
    obj.addComponent(derived);

    expect(obj.getComponent(DerivedComponent)).toBe(derived);
    expect(obj.getComponent(BaseComponent)).toBe(derived);

    obj.removeComponent(DerivedComponent);

    expect(obj.getComponent(DerivedComponent)).toBeUndefined();
    expect(obj.getComponent(BaseComponent)).toBeUndefined();
  });

  it('handles removing non-existent component gracefully', () => {
    const obj = new MockGameObject('test', 0);
    // Should not throw
    obj.removeComponent(MockComponent);
    expect(obj.hasComponent(MockComponent)).toBe(false);
  });

  it('stops listening for events with off()', () => {
    const obj = new MockGameObject('test', 0);
    const callback = jest.fn();
    
    // Test off and emit when no EventBus exists yet (branches)
    obj.off('test-event', callback);
    obj.emit('test-event');
    
    // Now create it and test off
    obj.on('test-event', callback);
    // Call on again to cover the "bus already exists" branch in on()
    obj.on('test-event', callback);
    
    obj.off('test-event', callback);
    obj.emit('test-event');
    
    expect(callback).not.toHaveBeenCalled();
  });

  it('registers and destroys itself via Engine', () => {
    const obj = new MockGameObject('test', 0);
    
    obj.registerSelf();
    expect(Engine.objects.has(obj)).toBe(true);
    
    obj.destroySelf();
    expect(Engine.objects.has(obj)).toBe(false);
  });
});
