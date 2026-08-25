import { TestBed } from '@angular/core/testing';

import { ReadStoriesService } from './read-stories.service';

const STORAGE_KEY = 'readStories';

describe('ReadStoriesService', () => {
  let store: { [key: string]: string };

  beforeEach(() => {
    store = {};
    spyOn(localStorage, 'getItem').and.callFake((key: string) =>
      store.hasOwnProperty(key) ? store[key] : null
    );
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      store[key] = value;
    });
    TestBed.configureTestingModule({});
  });

  function newService(): ReadStoriesService {
    return new ReadStoriesService();
  }

  it('is provided in root', () => {
    expect(TestBed.inject(ReadStoriesService)).toBeTruthy();
  });

  it('reports a marked story as read', () => {
    const service = newService();
    expect(service.isRead(1)).toBe(false);

    service.markAsRead(1);

    expect(service.isRead(1)).toBe(true);
  });

  it('restores read stories from storage in a new instance', () => {
    newService().markAsRead(42);

    expect(newService().isRead(42)).toBe(true);
  });

  it('stores no duplicate when a story is marked twice', () => {
    const service = newService();

    service.markAsRead(7);
    service.markAsRead(7);

    expect(JSON.parse(store[STORAGE_KEY])).toEqual([7]);
  });

  it('keeps only the most recently recorded ids once the cap is exceeded', () => {
    const service = newService();
    for (let id = 1; id <= 1002; id++) {
      service.markAsRead(id);
    }

    const stored: number[] = JSON.parse(store[STORAGE_KEY]);
    expect(stored.length).toBe(1000);
    expect(stored[0]).toBe(3);
    expect(stored[stored.length - 1]).toBe(1002);
    expect(service.isRead(1)).toBe(false);
    expect(service.isRead(2)).toBe(false);
    expect(service.isRead(1002)).toBe(true);
  });

  it('treats a corrupt stored value as no read stories', () => {
    store[STORAGE_KEY] = 'not json';

    expect(newService().isRead(1)).toBe(false);
  });

  it('treats a non-array stored value as no read stories', () => {
    store[STORAGE_KEY] = JSON.stringify({ 1: true });

    expect(newService().isRead(1)).toBe(false);
  });

  it('works when storage access throws', () => {
    (localStorage.getItem as jasmine.Spy).and.throwError('denied');
    (localStorage.setItem as jasmine.Spy).and.throwError('denied');

    const service = newService();

    expect(() => service.markAsRead(5)).not.toThrow();
    expect(service.isRead(5)).toBe(true);
  });
});
