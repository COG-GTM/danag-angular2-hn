import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { Story } from '../models/story';
import { HackerNewsAPIService } from './hackernews-api.service';
import { OFFLINE_STORIES_KEY, OfflineStoryStoreService } from './offline-story-store.service';

function storyWithId(id: number): Story {
  const story = new Story();
  story.id = id;
  story.title = `Story ${id}`;
  return story;
}

describe('HackerNewsAPIService', () => {
  let service: HackerNewsAPIService;
  let store: OfflineStoryStoreService;

  beforeEach(() => {
    localStorage.removeItem(OFFLINE_STORIES_KEY);
    TestBed.configureTestingModule({
      providers: [HackerNewsAPIService, OfflineStoryStoreService]
    });
    service = TestBed.inject(HackerNewsAPIService);
    store = TestBed.inject(OfflineStoryStoreService);
  });

  afterEach(() => {
    localStorage.removeItem(OFFLINE_STORIES_KEY);
  });

  it('saves a story that loaded successfully', done => {
    spyOn(service, 'request').and.returnValue(of(storyWithId(7)));

    service.fetchItemContent(7).subscribe(story => {
      expect(story.id).toBe(7);
      expect(store.get(7).story.title).toBe('Story 7');
      done();
    });
  });

  it('falls back to the saved copy when the request fails', done => {
    store.save(storyWithId(7));
    spyOn(service, 'request').and.returnValue(throwError(new Error('offline')));

    service.fetchItemContent(7).subscribe(story => {
      expect(story.title).toBe('Story 7');
      done();
    });
  });

  it('propagates the error when no copy was saved', done => {
    spyOn(service, 'request').and.returnValue(throwError(new Error('offline')));

    service.fetchItemContent(7).subscribe(
      () => fail('expected an error'),
      err => {
        expect(err.message).toBe('offline');
        done();
      }
    );
  });
});
