import { Component, Input, OnInit } from '@angular/core';
import { Story } from '../../shared/models/story';

import { SettingsService } from '../../shared/services/settings.service';
import { ReadStoriesService } from '../../shared/services/read-stories.service';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {
  @Input() item: Story;
  settings: Settings;

  constructor(
    private _settingsService: SettingsService,
    private _readStoriesService: ReadStoriesService
  ) {
    this.settings = this._settingsService.settings;
  }

  ngOnInit() {}

  get hasUrl(): boolean {
    return this.item.url.indexOf('http') === 0;
  }

  get isRead(): boolean {
    return this._readStoriesService.isRead(this.item.id);
  }

  markAsRead() {
    this._readStoriesService.markAsRead(this.item.id);
  }

}
