import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import { ItemComponent } from './item.component';
import { CommentPipe } from '../../shared/pipes/comment.pipe';
import { ReadStoriesService } from '../../shared/services/read-stories.service';
import { Story } from '../../shared/models/story';

class ReadStoriesServiceStub {
  read = new Set<number>();
  isRead(id: number) {
    return this.read.has(id);
  }
  markAsRead(id: number) {
    this.read.add(id);
  }
}

const leftClick = {
  button: 0,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
  preventDefault: () => {}
};

function makeStory(url: string): Story {
  const story = new Story();
  story.id = 1;
  story.title = 'A story';
  story.url = url;
  story.type = 'story';
  story.user = 'someone';
  story.points = 10;
  story.comments_count = 3;
  story.time_ago = 0;
  return story;
}

describe('ItemComponent', () => {
  let fixture: ComponentFixture<ItemComponent>;
  let component: ItemComponent;
  let readStories: ReadStoriesServiceStub;

  beforeEach(() => {
    readStories = new ReadStoriesServiceStub();
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([{ path: '**', children: [] }])],
      declarations: [ItemComponent, CommentPipe],
      providers: [{ provide: ReadStoriesService, useValue: readStories }]
    });
    fixture = TestBed.createComponent(ItemComponent);
    component = fixture.componentInstance;
  });

  function title() {
    return fixture.debugElement.query(By.css('a.title'));
  }

  it('marks an external story read when its title is clicked, keeping the anchor intact', () => {
    component.item = makeStory('https://example.com/story');
    fixture.detectChanges();

    const anchor = title();
    expect(anchor.nativeElement.getAttribute('href')).toBe('https://example.com/story');

    anchor.triggerEventHandler('click', leftClick);

    expect(readStories.isRead(1)).toBe(true);
    expect(anchor.nativeElement.getAttribute('href')).toBe('https://example.com/story');
  });

  it('marks an internal story read when its title is clicked', () => {
    component.item = makeStory('item?id=1');
    fixture.detectChanges();

    title().triggerEventHandler('click', leftClick);

    expect(readStories.isRead(1)).toBe(true);
  });

  it('marks the title read only for stories recorded as read', () => {
    component.item = makeStory('https://example.com/story');
    fixture.detectChanges();

    expect(title().nativeElement.classList).not.toContain('read');

    readStories.markAsRead(1);
    fixture.detectChanges();

    expect(title().nativeElement.classList).toContain('read');
  });

  it('marks the title read after it is clicked, without re-creating the component', () => {
    component.item = makeStory('https://example.com/story');
    fixture.detectChanges();

    title().triggerEventHandler('click', leftClick);
    fixture.detectChanges();

    expect(title().nativeElement.classList).toContain('read');
  });
});
