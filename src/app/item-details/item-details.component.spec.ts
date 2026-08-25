import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { OFFLINE_STORIES_KEY, OfflineStoryStoreService } from '../shared/services/offline-story-store.service';
import { PipesModule } from '../shared/pipes/pipes.module';
import { Story } from '../shared/models/story';

function storyWithId(id: number): Story {
  const story = new Story();
  story.id = id;
  story.title = `Story ${id}`;
  story.url = 'https://example.com';
  story.comments = [];
  return story;
}

describe('ItemDetailsComponent', () => {
  let fixture: ComponentFixture<ItemDetailsComponent>;
  let component: ItemDetailsComponent;
  let api: jasmine.SpyObj<HackerNewsAPIService>;
  let store: OfflineStoryStoreService;

  beforeEach(() => {
    localStorage.removeItem(OFFLINE_STORIES_KEY);
    api = jasmine.createSpyObj('HackerNewsAPIService', ['fetchItemContent']);

    TestBed.configureTestingModule({
      imports: [CommonModule, PipesModule],
      declarations: [ItemDetailsComponent],
      providers: [
        { provide: HackerNewsAPIService, useValue: api },
        SettingsService,
        OfflineStoryStoreService,
        { provide: ActivatedRoute, useValue: { params: of({ id: '7' }) } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(ItemDetailsComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(OfflineStoryStoreService);
  });

  afterEach(() => {
    localStorage.removeItem(OFFLINE_STORIES_KEY);
  });

  it('shows no saved-copy notice for a freshly loaded story', () => {
    api.fetchItemContent.and.callFake((id: number) => {
      const story = storyWithId(id);
      store.save(story);
      return of(story);
    });

    fixture.detectChanges();

    expect(component.savedCopyAt).toBeNull();
    expect(fixture.nativeElement.querySelector('.saved-copy-notice')).toBeNull();
  });

  it('shows a saved-copy notice when the story came from storage', () => {
    store.save(storyWithId(7));
    api.fetchItemContent.and.returnValue(of(store.get(7).story));

    fixture.detectChanges();

    expect(component.savedCopyAt.getTime()).toBe(store.get(7).savedAt);
    const notice = fixture.nativeElement.querySelector('.saved-copy-notice');
    expect(notice.textContent).toContain('showing the copy saved');
  });

  it('shows the load error when nothing was saved', () => {
    api.fetchItemContent.and.returnValue(throwError(new Error('offline')));

    fixture.detectChanges();

    expect(component.errorMessage).toBe('Could not load item comments.');
  });
});
