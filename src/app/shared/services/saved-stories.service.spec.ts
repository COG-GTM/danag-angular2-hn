import { TestBed } from '@angular/core/testing';

import { Story } from '../models/story';
import { SavedStoriesService, SAVED_STORIES_KEY, SAVED_STORIES_LIMIT } from './saved-stories.service';

function story(id: number): Story {
  return { id, title: `Story ${id}`, url: `https://example.com/${id}` } as Story;
}

function service(): SavedStoriesService {
  return TestBed.get(SavedStoriesService);
}

describe('SavedStoriesService', () => {
  beforeEach(() => {
    localStorage.removeItem(SAVED_STORIES_KEY);
    TestBed.configureTestingModule({ providers: [SavedStoriesService] });
  });

  afterEach(() => localStorage.removeItem(SAVED_STORIES_KEY));

  it('starts empty on a clean store', () => {
    expect(service().stories).toEqual([]);
  });

  it('ignores unparseable stored data', () => {
    localStorage.setItem(SAVED_STORIES_KEY, 'not json');
    expect(service().stories).toEqual([]);
  });

  it('ignores stored data that is not a list', () => {
    localStorage.setItem(SAVED_STORIES_KEY, JSON.stringify({ id: 1 }));
    expect(service().stories).toEqual([]);
  });

  it('saves a story and reports it saved', () => {
    const saved = service();
    saved.toggle(story(1));
    expect(saved.isSaved(1)).toBe(true);
    expect(saved.stories.length).toBe(1);
  });

  it('unsaves a story that is already saved', () => {
    const saved = service();
    saved.toggle(story(1));
    saved.toggle(story(1));
    expect(saved.isSaved(1)).toBe(false);
    expect(saved.stories).toEqual([]);
  });

  it('lists most recently saved first', () => {
    const saved = service();
    saved.toggle(story(1));
    saved.toggle(story(2));
    expect(saved.stories.map(s => s.id)).toEqual([2, 1]);
  });

  it('persists across a reload', () => {
    service().toggle(story(7));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [SavedStoriesService] });
    expect(service().isSaved(7)).toBe(true);
  });

  it('survives a storage write failure', () => {
    spyOn(localStorage, 'setItem').and.throwError('QuotaExceededError');
    const saved = service();
    expect(() => saved.toggle(story(3))).not.toThrow();
    expect(saved.isSaved(3)).toBe(true);
  });

  it('evicts the oldest story at the cap', () => {
    const saved = service();
    for (let id = 1; id <= SAVED_STORIES_LIMIT; id++) {
      saved.toggle(story(id));
    }

    const evicted = saved.toggle(story(SAVED_STORIES_LIMIT + 1));

    expect(evicted.id).toBe(1);
    expect(saved.stories.length).toBe(SAVED_STORIES_LIMIT);
    expect(saved.isSaved(1)).toBe(false);
    expect(saved.isSaved(SAVED_STORIES_LIMIT + 1)).toBe(true);
  });

  it('returns no eviction below the cap', () => {
    expect(service().toggle(story(1))).toBeNull();
  });

  it('truncates stored data above the cap on load', () => {
    const overflowing = [];
    for (let id = 1; id <= SAVED_STORIES_LIMIT + 50; id++) {
      overflowing.push(story(id));
    }
    localStorage.setItem(SAVED_STORIES_KEY, JSON.stringify(overflowing));

    expect(service().stories.length).toBe(SAVED_STORIES_LIMIT);
  });
});
