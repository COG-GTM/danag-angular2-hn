import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { Story } from '../shared/models/story';
import { SavedStoriesService } from '../shared/services/saved-stories.service';

@Component({
  selector: 'app-saved',
  templateUrl: './saved.component.html',
  styleUrls: ['./saved.component.scss']
})
export class SavedComponent implements OnInit, OnDestroy {
  items: Story[] = [];
  private savedSub: Subscription;

  constructor(private _savedStoriesService: SavedStoriesService) { }

  ngOnInit() {
    this.savedSub = this._savedStoriesService.saved$.subscribe(items => this.items = items);
    window.scrollTo(0, 0);
  }

  ngOnDestroy() {
    this.savedSub.unsubscribe();
  }
}
