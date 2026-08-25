import { Component, Input, OnInit } from '@angular/core';
import { Story } from '../../shared/models/story';

import { SettingsService } from '../../shared/services/settings.service';
import { SavedStoriesService } from '../../shared/services/saved-stories.service';
import { Settings } from '../../shared/models/settings';

const EVICTION_NOTICE_DURATION = 6000;

@Component({
  selector: 'item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {
  @Input() item: Story;
  settings: Settings;
  evictedTitle: string;

  constructor(
    private _settingsService: SettingsService,
    private _savedStoriesService: SavedStoriesService
  ) {
    this.settings = this._settingsService.settings;
  }

  ngOnInit() {}

  get hasUrl(): boolean {
    return this.item.url.indexOf('http') === 0;
  }

  get isSaved(): boolean {
    return this._savedStoriesService.isSaved(this.item.id);
  }

  get saveLabel(): string {
    return (this.isSaved ? 'Unsave' : 'Save') + ' ' + this.item.title;
  }

  toggleSaved(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    const result = this._savedStoriesService.toggle(this.item);

    if (result.evicted) {
      this.showEvictionNotice(result.evicted.title);
    }
  }

  dismissEvictionNotice() {
    this.evictedTitle = undefined;
  }

  private showEvictionNotice(title: string) {
    this.evictedTitle = title;
    setTimeout(() => {
      if (this.evictedTitle === title) {
        this.dismissEvictionNotice();
      }
    }, EVICTION_NOTICE_DURATION);
  }
}
