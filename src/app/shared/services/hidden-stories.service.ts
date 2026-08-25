import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

const STORAGE_KEY = 'hiddenStories';

@Injectable({
  providedIn: 'root'
})
export class HiddenStoriesService {
  private hiddenIds: Set<number> = this.readFromStorage();
  private hiddenIds$ = new BehaviorSubject<Set<number>>(this.hiddenIds);

  get changes(): Observable<Set<number>> {
    return this.hiddenIds$.asObservable();
  }

  get count(): number {
    return this.hiddenIds.size;
  }

  isHidden(id: number): boolean {
    return this.hiddenIds.has(id);
  }

  hide(id: number) {
    if (this.hiddenIds.has(id)) {
      return;
    }
    this.hiddenIds.add(id);
    this.persist();
  }

  unhide(id: number) {
    if (!this.hiddenIds.delete(id)) {
      return;
    }
    this.persist();
  }

  clear() {
    if (this.hiddenIds.size === 0) {
      return;
    }
    this.hiddenIds.clear();
    this.persist();
  }

  private persist() {
    this.hiddenIds$.next(this.hiddenIds);
    try {
      if (this.hiddenIds.size === 0) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(this.hiddenIds)));
      }
    } catch (e) {
      // Storage may be unavailable (private mode, quota); dismissals stay in memory.
    }
  }

  private readFromStorage(): Set<number> {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(stored)) {
        return new Set<number>(stored.filter(id => typeof id === 'number'));
      }
    } catch (e) {
      // Unreadable or malformed data is treated as no dismissals.
    }
    return new Set<number>();
  }
}
