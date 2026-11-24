import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLinkActive, RouterLink } from '@angular/router';
import { map } from 'rxjs/operators';

import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { Story } from '../../shared/models/story';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { ErrorMessageComponent } from '../../shared/components/error-message/error-message.component';
import { ItemComponent } from '../item/item.component';

@Component({
    selector: 'app-feed',
    templateUrl: './feed.component.html',
    styleUrls: ['./feed.component.scss'],
    imports: [LoaderComponent, ErrorMessageComponent, ItemComponent, RouterLinkActive, RouterLink]
})

export class FeedComponent implements OnInit {
  private _hackerNewsAPIService = inject(HackerNewsAPIService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  readonly feedType = toSignal(this.route.data.pipe(map(data => data['feedType'] as string)), { requireSync: true });
  readonly items = signal<Story[] | undefined>(undefined);
  readonly pageNum = signal(1);
  readonly listStart = signal<number | undefined>(undefined);
  readonly errorMessage = signal('');

  ngOnInit() {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const pageNum = params['page'] ? +params['page'] : 1;
      this.pageNum.set(pageNum);
      this._hackerNewsAPIService.fetchFeed(this.feedType(), pageNum)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: items => {
            this.items.set(items);
            this.listStart.set(((pageNum - 1) * 30) + 1);
            window.scrollTo(0, 0);
          },
          error: () => this.errorMessage.set('Could not load ' + this.feedType() + ' stories.')
        });
    });
  }
}
