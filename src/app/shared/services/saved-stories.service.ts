import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { Story } from '../models/story';

export const SAVED_STORIES_KEY = 'savedStories';
export const SAVED_STORIES_LIMIT = 200;

export interface ToggleResult {
  saved: boolean;
  evicted?: Story;
}

@Injectable({
  providedIn: 'root'
})
export class SavedStoriesService {
  private savedSubject: BehaviorSubject<Story[]>;

  constructor() {
    this.savedSubject = new BehaviorSubject<Story[]>(this.read());
  }

  get saved$(): Observable<Story[]> {
    return this.savedSubject.asObservable();
  }

  get saved(): Story[] {
    return this.savedSubject.value;
  }

  isSaved(id: number): boolean {
    return this.saved.some(story => story.id === id);
  }

  toggle(story: Story): ToggleResult {
    if (this.isSaved(story.id)) {
      this.remove(story.id);
      return { saved: false };
    }

    let stories = [story, ...this.saved];
    let evicted: Story;

    if (stories.length > SAVED_STORIES_LIMIT) {
      evicted = stories[stories.length - 1];
      stories = stories.slice(0, SAVED_STORIES_LIMIT);
    }

    this.commit(stories);
    return evicted ? { saved: true, evicted } : { saved: true };
  }

  remove(id: number) {
    this.commit(this.saved.filter(story => story.id !== id));
  }

  private commit(stories: Story[]) {
    this.savedSubject.next(stories);
    this.write(stories);
  }

  private read(): Story[] {
    try {
      const stored = JSON.parse(localStorage.getItem(SAVED_STORIES_KEY));
      if (!Array.isArray(stored)) {
        return [];
      }
      return stored.slice(0, SAVED_STORIES_LIMIT);
    } catch (error) {
      return [];
    }
  }

  private write(stories: Story[]) {
    try {
      localStorage.setItem(SAVED_STORIES_KEY, JSON.stringify(stories));
    } catch (error) {
      // Device storage is unavailable or full; the in-memory list stays authoritative.
    }
  }
}
