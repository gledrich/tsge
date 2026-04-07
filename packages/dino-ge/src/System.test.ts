import System from './System';
import GameObject from './GameObject';

class MockSystem extends System {
  public override update = jest.fn();
  public override fixedUpdate = jest.fn();
}

class MockGameObject extends GameObject {}

describe('System', () => {
  it('allows implementing update and fixedUpdate', () => {
    const system = new MockSystem();
    const entities = new Set<GameObject>([new MockGameObject('test', 0)]);
    
    system.update!(entities, 0.016, false);
    expect(system.update).toHaveBeenCalledWith(entities, 0.016, false);
    
    system.fixedUpdate!(entities, 0.02);
    expect(system.fixedUpdate).toHaveBeenCalledWith(entities, 0.02);
  });
});
