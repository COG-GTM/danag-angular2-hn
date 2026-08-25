import { Injectable } from '@angular/core';

const STORAGE_KEY = 'readStories';
const MAX_ENTRIES = 1000;

@Injectable({
  providedIn: 'root'
})
export class ReadStoriesService {
  private readStories: Set<number>;

  constructor() {
    this.readStories = this.load();
  }

  isRead(id: number): boolean {
    return this.readStories.has(id);
  }

  markAsRead(id: number) {
    if (this.readStories.has(id)) {
      return;
    }
    this.readStories.add(id);
    while (this.readStories.size > MAX_ENTRIES) {
      this.readStories.delete(this.readStories.values().next().value);
    }
    this.save();
  }

  private load(): Set<number> {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!Array.isArray(stored)) {
        return new Set<number>();
      }
      return new Set<number>(stored.filter(id => typeof id === 'number'));
    } catch (e) {
      return new Set<number>();
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(this.readStories)));
    } catch (e) {
      // Storage is unavailable or full; the in-memory set still applies for this session.
    }
  }
}
