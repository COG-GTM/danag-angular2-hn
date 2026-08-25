import { Injectable } from '@angular/core';

import { Story } from '../models/story';

export interface OfflineStoryEntry {
  story: Story;
  savedAt: number;
}

interface OfflineStoryMap {
  [id: string]: OfflineStoryEntry;
}

export const OFFLINE_STORIES_KEY = 'offlineStories';
export const MAX_OFFLINE_STORIES = 50;

@Injectable({
  providedIn: 'root'
})
export class OfflineStoryStoreService {
  get(id: number): OfflineStoryEntry {
    const stories = this.read();
    return stories[id] || null;
  }

  save(story: Story): void {
    if (!story || story.id === undefined || story.id === null) {
      return;
    }

    const stories = this.read();
    stories[story.id] = { story, savedAt: Date.now() };

    const trimmed = this.evictOldest(stories, MAX_OFFLINE_STORIES);
    if (!this.write(trimmed)) {
      this.write(this.evictOldest(trimmed, this.count(trimmed) - 1));
    }
  }

  private read(): OfflineStoryMap {
    try {
      const raw = localStorage.getItem(OFFLINE_STORIES_KEY);
      if (!raw) {
        return {};
      }
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (err) {
      return {};
    }
  }

  private write(stories: OfflineStoryMap): boolean {
    try {
      localStorage.setItem(OFFLINE_STORIES_KEY, JSON.stringify(stories));
      return true;
    } catch (err) {
      return false;
    }
  }

  private evictOldest(stories: OfflineStoryMap, limit: number): OfflineStoryMap {
    const ids = Object.keys(stories);
    if (limit < 0 || ids.length <= limit) {
      return stories;
    }

    const kept = ids
      .sort((a, b) => stories[b].savedAt - stories[a].savedAt)
      .slice(0, limit);

    return kept.reduce((map: OfflineStoryMap, id: string) => {
      map[id] = stories[id];
      return map;
    }, {});
  }

  private count(stories: OfflineStoryMap): number {
    return Object.keys(stories).length;
  }
}
