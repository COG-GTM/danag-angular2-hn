import { Injectable } from '@angular/core';

import { Story } from '../models/story';

export const SAVED_STORIES_KEY = 'savedStories';
export const SAVED_STORIES_LIMIT = 200;

@Injectable({
  providedIn: 'root'
})
export class SavedStoriesService {
  private _stories: Story[] = [];
  private _ids: Set<number> = new Set<number>();

  /** The story dropped by the most recent save that hit the cap, until dismissed. */
  lastEvicted: Story | null = null;

  constructor() {
    this._stories = this.load();
    this.reindex();
  }

  get stories(): Story[] {
    return this._stories;
  }

  isSaved(id: number): boolean {
    return this._ids.has(id);
  }

  /** Saves the story if it is not saved, unsaves it if it is. Returns the story evicted by the cap, if any. */
  toggle(story: Story): Story | null {
    if (!story || story.id === undefined || story.id === null) {
      return null;
    }

    if (this.isSaved(story.id)) {
      this.remove(story.id);
      return null;
    }

    this._stories.unshift(story);
    const evicted = this._stories.length > SAVED_STORIES_LIMIT ? this._stories.pop() : null;
    this.reindex();
    this.persist();
    this.lastEvicted = evicted || null;
    return this.lastEvicted;
  }

  dismissEviction(): void {
    this.lastEvicted = null;
  }

  remove(id: number): void {
    this._stories = this._stories.filter(story => story.id !== id);
    this.reindex();
    this.persist();
  }

  private load(): Story[] {
    let parsed: any;

    try {
      parsed = JSON.parse(localStorage.getItem(SAVED_STORIES_KEY));
    } catch (error) {
      return [];
    }

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(story => story && typeof story.id === 'number' && typeof story.title === 'string')
      .slice(0, SAVED_STORIES_LIMIT);
  }

  private reindex(): void {
    this._ids = new Set<number>(this._stories.map(story => story.id));
  }

  private persist(): void {
    try {
      localStorage.setItem(SAVED_STORIES_KEY, JSON.stringify(this._stories));
    } catch (error) {
      // Quota or private-mode failure: keep the in-memory list for this session.
    }
  }
}
