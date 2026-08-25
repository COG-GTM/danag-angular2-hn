import { Component } from '@angular/core';

import { Story } from '../shared/models/story';
import { SavedStoriesService } from '../shared/services/saved-stories.service';

@Component({
  selector: 'app-saved-stories',
  templateUrl: './saved-stories.component.html',
  styleUrls: ['./saved-stories.component.scss']
})
export class SavedStoriesComponent {
  constructor(private _savedStories: SavedStoriesService) {}

  get stories(): Story[] {
    return this._savedStories.stories;
  }
}
