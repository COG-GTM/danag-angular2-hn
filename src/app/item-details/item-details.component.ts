import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs/Subscription';

import { HackerNewsAPIService } from '../shared/services/hackernews-api.service';
import { SettingsService } from '../shared/services/settings.service';
import { OfflineStoryStoreService } from '../shared/services/offline-story-store.service';

import { Story } from '../shared/models/story';
import { Settings } from '../shared/models/settings';

@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.component.html',
  styleUrls: ['./item-details.component.scss']
})
export class ItemDetailsComponent implements OnInit {
  sub: Subscription;
  item: Story;
  errorMessage = '';
  settings: Settings;
  savedCopyAt: Date = null;

  constructor(
    private _hackerNewsAPIService: HackerNewsAPIService,
    private _settingsService: SettingsService,
    private _offlineStoryStore: OfflineStoryStoreService,
    private route: ActivatedRoute,
    private _location: Location
  ) {
    this.settings = this._settingsService.settings;
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      let itemID = +params['id'];
      const savedBefore = this._offlineStoryStore.get(itemID);
      this._hackerNewsAPIService.fetchItemContent(itemID).subscribe(item => {
        this.item = item;
        const savedAfter = this._offlineStoryStore.get(itemID);
        const isSavedCopy = savedBefore && savedAfter && savedAfter.savedAt === savedBefore.savedAt;
        this.savedCopyAt = isSavedCopy ? new Date(savedAfter.savedAt) : null;
      }, error => this.errorMessage = 'Could not load item comments.');
    });
    window.scrollTo(0, 0);
  }

  goBack() {
    this._location.back();
  }

  get hasUrl(): boolean {
    return this.item.url.indexOf('http') === 0;
  }

}
