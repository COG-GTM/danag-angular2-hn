import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import fetch from 'unfetch';
import {map } from 'rxjs/operators';

import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

// wrap fetch in observable so we can keep it chill
@Injectable()
export class HackerNewsAPIService {
  baseUrl: string;
  userBaseUrl: string;

  constructor() {
    this.baseUrl = 'https://node-hnapi.herokuapp.com';
    this.userBaseUrl = 'https://api.hnpwa.com/v0';
  }

  fetchFeed(feedType: string, page: number): Observable<Story[]> {
    return lazyFetch(`${this.baseUrl}/${feedType}?page=${page}`);
  }

  fetchItemContent(id: number): Observable<Story> {
    return lazyFetch(`${this.baseUrl}/item/${id}`).pipe(map((story: Story) => {
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
    }));
  }

  fetchPollContent(id: number): Observable<PollResult> {
    return lazyFetch(`${this.baseUrl}/item/${id}`);
  }

  fetchUser(id: string): Observable<User> {
    return lazyFetch<User>(`${this.userBaseUrl}/user/${id}.json`).pipe(map(user => {
      if (!user) {
        throw new Error(`User ${id} not found`);
      }
      return user;
    }));
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

