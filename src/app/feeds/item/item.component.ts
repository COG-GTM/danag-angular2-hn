import { Component, Input, OnInit } from '@angular/core';
import { Story } from '../../shared/models/story';

import { SettingsService } from '../../shared/services/settings.service';
import { SavedStoriesService } from '../../shared/services/saved-stories.service';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {
  @Input() item: Story;
  settings: Settings;

  constructor(private _settingsService: SettingsService, private _savedStories: SavedStoriesService) {
    this.settings = this._settingsService.settings;
  }

  ngOnInit() {}

  get hasUrl(): boolean {
    return !!this.item.url && this.item.url.indexOf('http') === 0;
  }

  get isSaved(): boolean {
    return this._savedStories.isSaved(this.item.id);
  }

  toggleSaved(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this._savedStories.toggle(this.item);
  }

}
