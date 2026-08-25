import { TestBed } from '@angular/core/testing';

import { HiddenStoriesService } from './hidden-stories.service';

const STORAGE_KEY = 'hiddenStories';

describe('HiddenStoriesService', () => {
  let service: HiddenStoriesService;

  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    TestBed.configureTestingModule({});
    service = TestBed.inject(HiddenStoriesService);
  });

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  it('hides, unhides and clears stories', () => {
    service.hide(1);
    service.hide(2);
    expect(service.isHidden(1)).toBe(true);
    expect(service.count).toBe(2);

    service.unhide(1);
    expect(service.isHidden(1)).toBe(false);
    expect(service.count).toBe(1);

    service.clear();
    expect(service.count).toBe(0);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('emits the hidden set on every mutation', () => {
    const sizes: number[] = [];
    service.changes.subscribe(hidden => sizes.push(hidden.size));

    service.hide(1);
    service.hide(1);
    service.unhide(1);

    expect(sizes).toEqual([0, 1, 0]);
  });

  it('persists dismissals across instances', () => {
    service.hide(42);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual([42]);

    const reloaded = new HiddenStoriesService();
    expect(reloaded.isHidden(42)).toBe(true);
  });

  it('treats malformed stored data as no dismissals', () => {
    localStorage.setItem(STORAGE_KEY, 'not json');
    expect(new HiddenStoriesService().count).toBe(0);

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: 1 }));
    expect(new HiddenStoriesService().count).toBe(0);

    localStorage.setItem(STORAGE_KEY, JSON.stringify([1, 'two', 3]));
    const partial = new HiddenStoriesService();
    expect(partial.count).toBe(2);
    expect(partial.isHidden(3)).toBe(true);
  });

  it('keeps working when storage throws', () => {
    spyOn(localStorage, 'setItem').and.throwError('QuotaExceededError');

    expect(() => service.hide(7)).not.toThrow();
    expect(service.isHidden(7)).toBe(true);
  });
});
