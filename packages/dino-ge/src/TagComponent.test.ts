import TagComponent from './TagComponent';

describe('TagComponent', () => {
  it('initialises with default values', () => {
    const component = new TagComponent();
    expect(component.tag).toBe('obj');
    expect(component.zIndex).toBe(0);
  });

  it('initialises with provided values', () => {
    const component = new TagComponent('player', 10);
    expect(component.tag).toBe('player');
    expect(component.zIndex).toBe(10);
  });
});
