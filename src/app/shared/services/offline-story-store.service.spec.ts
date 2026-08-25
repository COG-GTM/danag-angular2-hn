import { TestBed } from '@angular/core/testing';

import { Story } from '../models/story';
import {
  MAX_OFFLINE_STORIES,
  OFFLINE_STORIES_KEY,
  OfflineStoryStoreService
} from './offline-story-store.service';

function storyWithId(id: number): Story {
  const story = new Story();
  story.id = id;
  story.title = `Story ${id}`;
  return story;
}

describe('OfflineStoryStoreService', () => {
  let service: OfflineStoryStoreService;

  beforeEach(() => {
    localStorage.removeItem(OFFLINE_STORIES_KEY);
    TestBed.configureTestingModule({});
    service = TestBed.inject(OfflineStoryStoreService);
  });

  afterEach(() => {
    localStorage.removeItem(OFFLINE_STORIES_KEY);
  });

  it('round-trips a saved story with the time it was saved', () => {
    const now = 1600000000000;
    spyOn(Date, 'now').and.returnValue(now);

    service.save(storyWithId(1));

    const entry = service.get(1);
    expect(entry.story.title).toBe('Story 1');
    expect(entry.savedAt).toBe(now);
  });

  it('returns null for a story that was never saved', () => {
    expect(service.get(42)).toBeNull();
  });

  it('replaces the saved copy when the same story is saved again', () => {
    let now = 1000;
    spyOn(Date, 'now').and.callFake(() => now);

    service.save(storyWithId(1));
    now = 2000;
    const updated = storyWithId(1);
    updated.title = 'Updated title';
    service.save(updated);

    expect(service.get(1).story.title).toBe('Updated title');
    expect(service.get(1).savedAt).toBe(2000);
  });

  it('keeps only the most recently saved stories up to the limit', () => {
    let now = 1000;
    spyOn(Date, 'now').and.callFake(() => now++);

    for (let id = 1; id <= MAX_OFFLINE_STORIES + 1; id++) {
      service.save(storyWithId(id));
    }

    expect(service.get(1)).toBeNull();
    expect(service.get(2)).not.toBeNull();
    expect(service.get(MAX_OFFLINE_STORIES + 1)).not.toBeNull();
  });

  it('evicts the oldest entry and retries when the first write is rejected', () => {
    let now = 1000;
    spyOn(Date, 'now').and.callFake(() => now++);
    service.save(storyWithId(1));
    service.save(storyWithId(2));

    let calls = 0;
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      calls++;
      if (calls === 1) {
        throw new DOMException('quota', 'QuotaExceededError');
      }
      const parsed = JSON.parse(value);
      expect(parsed['1']).toBeUndefined();
      expect(parsed['3']).toBeDefined();
    });

    service.save(storyWithId(3));

    expect(calls).toBe(2);
  });

  it('treats unreadable storage as no saved content', () => {
    localStorage.setItem(OFFLINE_STORIES_KEY, 'not json');
    expect(service.get(1)).toBeNull();
  });

  it('does not throw when storage rejects every write', () => {
    spyOn(localStorage, 'setItem').and.throwError('storage disabled');
    expect(() => service.save(storyWithId(1))).not.toThrow();
  });

  it('does not throw when reading from storage fails', () => {
    spyOn(localStorage, 'getItem').and.throwError('storage disabled');
    expect(service.get(1)).toBeNull();
  });
});
