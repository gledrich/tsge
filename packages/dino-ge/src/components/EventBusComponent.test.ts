import EventBusComponent from './EventBusComponent.js';

describe('EventBusComponent', () => {
  it('registers and triggers event listeners', () => {
    const bus = new EventBusComponent();
    const callback = jest.fn();
    
    bus.on('test', callback);
    bus.emit('test');
    
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('passes data with emitted events', () => {
    const bus = new EventBusComponent();
    const callback = jest.fn();
    const testData = { foo: 'bar' };
    
    bus.on('test', callback);
    bus.emit('test', testData);
    
    const event = callback.mock.calls[0][0] as CustomEvent;
    expect(event.detail).toEqual(testData);
  });

  it('removes event listeners', () => {
    const bus = new EventBusComponent();
    const callback = jest.fn();
    
    bus.on('test', callback);
    bus.off('test', callback);
    bus.emit('test');
    
    expect(callback).not.toHaveBeenCalled();
  });
});
