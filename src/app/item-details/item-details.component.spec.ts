import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { ItemDetailsComponent } from './item-details.component';
import { CommentPipe } from '../shared/pipes/comment.pipe';
import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { ReadStoriesService } from '../shared/services/read-stories.service';

class ReadStoriesServiceStub {
  read = new Set<number>();
  isRead(id: number) {
    return this.read.has(id);
  }
  markAsRead(id: number) {
    this.read.add(id);
  }
}

describe('ItemDetailsComponent', () => {
  let readStories: ReadStoriesServiceStub;

  function setup(fetch: () => any) {
    readStories = new ReadStoriesServiceStub();
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ItemDetailsComponent, CommentPipe],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ReadStoriesService, useValue: readStories },
        { provide: HackerNewsAPIService, useValue: { fetchItemContent: fetch } },
        { provide: ActivatedRoute, useValue: { params: of({ id: '99' }) } }
      ]
    });
    const fixture = TestBed.createComponent(ItemDetailsComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('marks the story read when the route id resolves', () => {
    setup(() => of({ id: 99, title: 'A story', url: 'https://example.com' }));

    expect(readStories.isRead(99)).toBe(true);
  });

  it('marks the story read even when its content fails to load', () => {
    setup(() => throwError('boom'));

    expect(readStories.isRead(99)).toBe(true);
  });
});
