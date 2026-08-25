import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { HiddenStoriesService } from '../../shared/services/hidden-stories.service';
import { Story } from '../../shared/models/story';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})

export class FeedComponent implements OnInit, OnDestroy {
  typeSub: Subscription;
  pageSub: Subscription;
  hiddenSub: Subscription;
  items: Story[];
  displayedItems: Story[];
  feedType: string;
  pageNum: number;
  listStart: number;
  errorMessage = '';
  undoStoryId: number = null;

  constructor(
    private _hackerNewsAPIService: HackerNewsAPIService,
    private _hiddenStoriesService: HiddenStoriesService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.typeSub = this.route
      .data
      .subscribe(data => {
        this.feedType = (data as any).feedType;
      });

    this.pageSub = this.route.params.subscribe(params => {
      this.pageNum = params['page'] ? +params['page'] : 1;
      this.undoStoryId = null;
      this._hackerNewsAPIService.fetchFeed(this.feedType, this.pageNum)
        .subscribe(
          items => {
            this.items = items;
            this.updateDisplayedItems();
          },
          error => this.errorMessage = 'Could not load ' + this.feedType + ' stories.',
          () => {
            this.listStart = ((this.pageNum - 1) * 30) + 1;
            window.scrollTo(0, 0);
          }
        );
    });

    this.hiddenSub = this._hiddenStoriesService.changes.subscribe(() => this.updateDisplayedItems());
  }

  ngOnDestroy() {
    this.typeSub.unsubscribe();
    this.pageSub.unsubscribe();
    this.hiddenSub.unsubscribe();
  }

  hideStory(story: Story) {
    this.undoStoryId = story.id;
    this._hiddenStoriesService.hide(story.id);
  }

  undoHide(story: Story) {
    this.undoStoryId = null;
    this._hiddenStoriesService.unhide(story.id);
  }

  isAwaitingUndo(story: Story): boolean {
    return this.undoStoryId === story.id;
  }

  private updateDisplayedItems() {
    if (!this.items) {
      return;
    }
    this.displayedItems = this.items.filter(
      item => !this._hiddenStoriesService.isHidden(item.id) || this.isAwaitingUndo(item)
    );
  }
}
