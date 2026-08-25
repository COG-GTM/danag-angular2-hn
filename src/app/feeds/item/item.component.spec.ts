import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ItemComponent } from './item.component';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { Story } from '../../shared/models/story';
import { SavedStoriesService, SAVED_STORIES_KEY } from '../../shared/services/saved-stories.service';

function makeStory(id: number): Story {
  const story = new Story();
  story.id = id;
  story.title = 'Story ' + id;
  story.url = 'https://example.com/' + id;
  story.type = 'story';
  return story;
}

describe('ItemComponent', () => {
  let fixture: ComponentFixture<ItemComponent>;
  let component: ItemComponent;
  let savedStories: SavedStoriesService;

  function star(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('.save-toggle');
  }

  beforeEach(() => {
    localStorage.removeItem(SAVED_STORIES_KEY);
    TestBed.configureTestingModule({
      declarations: [ItemComponent],
      imports: [RouterTestingModule, PipesModule]
    });

    savedStories = TestBed.inject(SavedStoriesService);
    fixture = TestBed.createComponent(ItemComponent);
    component = fixture.componentInstance;
    component.item = makeStory(1);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem(SAVED_STORIES_KEY);
  });

  it('renders the star unsaved for an unsaved story', () => {
    expect(star().classList).not.toContain('saved');
    expect(star().getAttribute('aria-label')).toBe('Save Story 1');
  });

  it('renders the star saved for an already saved story', () => {
    savedStories.toggle(makeStory(1));
    fixture.detectChanges();

    expect(star().classList).toContain('saved');
    expect(star().getAttribute('aria-label')).toBe('Unsave Story 1');
  });

  it('saves the story once when the star is clicked', () => {
    spyOn(savedStories, 'toggle').and.callThrough();

    star().click();
    fixture.detectChanges();

    expect(savedStories.toggle).toHaveBeenCalledTimes(1);
    expect(star().classList).toContain('saved');
  });

  it('does not activate the surrounding link when the star is clicked', () => {
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    spyOn(event, 'preventDefault');
    spyOn(event, 'stopPropagation');

    star().dispatchEvent(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('shows a notice naming the evicted story when a save evicts', () => {
    spyOn(savedStories, 'toggle').and.returnValue({ saved: true, evicted: makeStory(42) });

    star().click();
    fixture.detectChanges();

    const notice = fixture.nativeElement.querySelector('.eviction-notice');
    expect(notice).toBeTruthy();
    expect(notice.textContent).toContain('Story 42');
  });

  it('shows no notice when nothing is evicted', () => {
    star().click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.eviction-notice')).toBeNull();
  });

  it('dismisses the eviction notice', () => {
    component.evictedTitle = 'Story 42';
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.eviction-notice .dismiss').click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.eviction-notice')).toBeNull();
  });
});
