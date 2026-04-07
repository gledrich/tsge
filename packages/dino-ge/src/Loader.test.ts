import ResourceLoader from './Loader';

describe('ResourceLoader', () => {
  beforeEach(() => {
    // Clear private static state between tests
    // Accessing private members via cast for test cleanup
    (ResourceLoader as any).assets.clear();
    (ResourceLoader as any).loadingQueue.clear();
    (ResourceLoader as any).totalToLoad = 0;
    (ResourceLoader as any).loadedCount = 0;
    jest.clearAllMocks();
  });

  it('queues images correctly', () => {
    ResourceLoader.queueImage('test', 'test.png');
    expect((ResourceLoader as any).totalToLoad).toBe(1);
    expect((ResourceLoader as any).loadingQueue.size).toBe(1);
  });

  it('prevents duplicate queuing of the same tag', () => {
    ResourceLoader.queueImage('test', 'test.png');
    ResourceLoader.queueImage('test', 'other.png');
    expect((ResourceLoader as any).totalToLoad).toBe(1);
  });

  it('loads queued assets and triggers callback', async () => {
    // Mock Image and its onload behavior
    const mockImageInstance = {
      set src(val: string) {
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 0);
      },
      onload: null as any
    };
    
    const originalImage = global.Image;
    global.Image = jest.fn(() => mockImageInstance) as any;

    ResourceLoader.queueImage('dino', 'dino.png');
    
    const onProgress = jest.fn();
    await ResourceLoader.loadAll(onProgress);

    expect(onProgress).toHaveBeenCalledWith(100);
    expect(ResourceLoader.getImage('dino')).toBeDefined();

    global.Image = originalImage;
  });

  it('throws error if asset not found', () => {
    expect(() => ResourceLoader.getImage('missing')).toThrow();
  });
});
