import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { SavedComponent } from './saved.component';
import { ItemComponent } from '../feeds/item/item.component';
import { PipesModule } from '../shared/pipes/pipes.module';
import { Story } from '../shared/models/story';
import { SavedStoriesService, SAVED_STORIES_KEY } from '../shared/services/saved-stories.service';

function makeStory(id: number): Story {
  const story = new Story();
  story.id = id;
  story.title = 'Story ' + id;
  story.url = 'https://example.com/' + id;
  story.type = 'story';
  return story;
}

describe('SavedComponent', () => {
  let fixture: ComponentFixture<SavedComponent>;
  let savedStories: SavedStoriesService;

  function items(): NodeListOf<Element> {
    return fixture.nativeElement.querySelectorAll('item');
  }

  beforeEach(() => {
    localStorage.removeItem(SAVED_STORIES_KEY);
    TestBed.configureTestingModule({
      declarations: [SavedComponent, ItemComponent],
      imports: [RouterTestingModule, PipesModule]
    });

    savedStories = TestBed.inject(SavedStoriesService);
  });

  afterEach(() => {
    localStorage.removeItem(SAVED_STORIES_KEY);
  });

  function render() {
    fixture = TestBed.createComponent(SavedComponent);
    fixture.detectChanges();
  }

  it('renders one item per saved story, most recently saved first', () => {
    savedStories.toggle(makeStory(1));
    savedStories.toggle(makeStory(2));

    render();

    expect(items().length).toBe(2);
    expect(items()[0].textContent).toContain('Story 2');
  });

  it('shows the empty state when nothing is saved', () => {
    render();

    expect(items().length).toBe(0);
    expect(fixture.nativeElement.querySelector('.empty-state').textContent).toContain('not saved any stories');
  });

  it('drops a row when a story is unsaved', () => {
    savedStories.toggle(makeStory(1));
    savedStories.toggle(makeStory(2));
    render();

    savedStories.remove(2);
    fixture.detectChanges();

    expect(items().length).toBe(1);
    expect(items()[0].textContent).toContain('Story 1');
  });

  it('shows the empty state after the last story is unsaved', () => {
    savedStories.toggle(makeStory(1));
    render();

    savedStories.remove(1);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.empty-state')).toBeTruthy();
  });
});
