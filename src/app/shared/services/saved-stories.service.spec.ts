import { TestBed } from '@angular/core/testing';

import { SavedStoriesService, SAVED_STORIES_KEY, SAVED_STORIES_LIMIT } from './saved-stories.service';
import { Story } from '../models/story';

function makeStory(id: number): Story {
  const story = new Story();
  story.id = id;
  story.title = 'Story ' + id;
  story.url = 'https://example.com/' + id;
  return story;
}

function makeService(): SavedStoriesService {
  return TestBed.inject(SavedStoriesService);
}

describe('SavedStoriesService', () => {
  beforeEach(() => {
    localStorage.removeItem(SAVED_STORIES_KEY);
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    localStorage.removeItem(SAVED_STORIES_KEY);
  });

  it('saves a story and reports it as saved', () => {
    const service = makeService();

    const result = service.toggle(makeStory(1));

    expect(result.saved).toBe(true);
    expect(result.evicted).toBeUndefined();
    expect(service.isSaved(1)).toBe(true);
  });

  it('returns to the previous contents when a story is toggled twice', () => {
    const service = makeService();
    service.toggle(makeStory(1));

    service.toggle(makeStory(2));
    const result = service.toggle(makeStory(2));

    expect(result.saved).toBe(false);
    expect(service.isSaved(2)).toBe(false);
    expect(service.saved.map(story => story.id)).toEqual([1]);
  });

  it('keeps the most recently saved story first', () => {
    const service = makeService();

    service.toggle(makeStory(1));
    service.toggle(makeStory(2));

    expect(service.saved.map(story => story.id)).toEqual([2, 1]);
  });

  it('publishes the current list to subscribers', () => {
    const service = makeService();
    let published: Story[];
    service.saved$.subscribe(stories => (published = stories));

    service.toggle(makeStory(1));

    expect(published.map(story => story.id)).toEqual([1]);
  });

  it('restores saved stories written by an earlier instance', () => {
    makeService().toggle(makeStory(1));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});

    expect(makeService().isSaved(1)).toBe(true);
  });

  it('drops removed stories from storage', () => {
    const service = makeService();
    service.toggle(makeStory(1));

    service.remove(1);

    expect(JSON.parse(localStorage.getItem(SAVED_STORIES_KEY))).toEqual([]);
  });

  it('starts empty when the stored data is malformed JSON', () => {
    localStorage.setItem(SAVED_STORIES_KEY, '{not json');

    expect(makeService().saved).toEqual([]);
  });

  it('starts empty when the stored data is not an array', () => {
    localStorage.setItem(SAVED_STORIES_KEY, '{"id":1}');

    expect(makeService().saved).toEqual([]);
  });

  it('keeps working when a write throws', () => {
    const service = makeService();
    spyOn(localStorage, 'setItem').and.throwError('QuotaExceededError');

    expect(() => service.toggle(makeStory(1))).not.toThrow();
    expect(service.isSaved(1)).toBe(true);
  });

  it('evicts the oldest story when saving at the cap', () => {
    const service = makeService();
    for (let id = 1; id <= SAVED_STORIES_LIMIT; id++) {
      service.toggle(makeStory(id));
    }

    const result = service.toggle(makeStory(999));

    expect(result.evicted.id).toBe(1);
    expect(service.saved.length).toBe(SAVED_STORIES_LIMIT);
    expect(service.isSaved(1)).toBe(false);
    expect(service.isSaved(999)).toBe(true);
  });

  it('does not evict below the cap', () => {
    const service = makeService();
    service.toggle(makeStory(1));

    expect(service.toggle(makeStory(2)).evicted).toBeUndefined();
  });

  it('persists the eviction', () => {
    const service = makeService();
    for (let id = 1; id <= SAVED_STORIES_LIMIT; id++) {
      service.toggle(makeStory(id));
    }
    service.toggle(makeStory(999));

    const stored: Story[] = JSON.parse(localStorage.getItem(SAVED_STORIES_KEY));

    expect(stored.length).toBe(SAVED_STORIES_LIMIT);
    expect(stored.some(story => story.id === 1)).toBe(false);
    expect(stored[0].id).toBe(999);
  });

  it('truncates a stored list that exceeds the cap', () => {
    const oversized = [];
    for (let id = 1; id <= SAVED_STORIES_LIMIT + 50; id++) {
      oversized.push(makeStory(id));
    }
    localStorage.setItem(SAVED_STORIES_KEY, JSON.stringify(oversized));

    const service = makeService();

    expect(service.saved.length).toBe(SAVED_STORIES_LIMIT);
    expect(service.saved[0].id).toBe(1);
    expect(service.isSaved(SAVED_STORIES_LIMIT + 1)).toBe(false);
  });
});
