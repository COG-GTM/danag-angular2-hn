import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import fetch from 'unfetch';
import { catchError, map, tap } from 'rxjs/operators';

import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';
import { OfflineStoryStoreService } from './offline-story-store.service';

// wrap fetch in observable so we can keep it chill
@Injectable()
export class HackerNewsAPIService {
  baseUrl: string;

  constructor(private _offlineStoryStore: OfflineStoryStoreService) {
    this.baseUrl = 'https://node-hnapi.herokuapp.com';
  }

  request<T>(url: string, options?): Observable<T> {
    return lazyFetch<T>(url, options);
  }

  fetchFeed(feedType: string, page: number): Observable<Story[]> {
    return this.request<Story[]>(`${this.baseUrl}/${feedType}?page=${page}`);
  }

  fetchItemContent(id: number): Observable<Story> {
    return this.request<Story>(`${this.baseUrl}/item/${id}`).pipe(
      map((story: Story) => {
        if (story.type === 'poll') {
          let numberOfPollOptions = story.poll.length;
          story.poll_votes_count = 0;
          for (let i = 1; i <= numberOfPollOptions; i++) {
            this.fetchPollContent(story.id + i).subscribe(pollResults => {
              story.poll[i - 1] = pollResults;
              story.poll_votes_count += pollResults.points;
            });
          }
        }
        return story;
      }),
      tap((story: Story) => this._offlineStoryStore.save(story)),
      catchError(err => {
        const entry = this._offlineStoryStore.get(id);
        return entry ? of(entry.story) : throwError(err);
      })
    );
  }

  fetchPollContent(id: number): Observable<PollResult> {
    return this.request<PollResult>(`${this.baseUrl}/item/${id}`);
  }

  fetchUser(id: string): Observable<User> {
    return this.request<User>(`${this.baseUrl}/user/${id}`);
  }
}

function lazyFetch<T>(url, options?) {
  return new Observable<T>(fetchObserver => {
    let cancelToken = false;
    fetch(url, options)
      .then(res => {
        if (!cancelToken) {
          return res.json()
            .then(data => {
              fetchObserver.next(data);
              fetchObserver.complete();
            });
        }
      }).catch(err => fetchObserver.error(err));
    return () => {
      cancelToken = true;
    };
  });
}

