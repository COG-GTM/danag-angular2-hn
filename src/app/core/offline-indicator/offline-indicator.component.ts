import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { ConnectivityService } from '../../shared/services/connectivity.service';

@Component({
  selector: 'app-offline-indicator',
  templateUrl: './offline-indicator.component.html',
  styleUrls: ['./offline-indicator.component.scss']
})
export class OfflineIndicatorComponent implements OnInit, OnDestroy {
  isOffline = false;

  private sub: Subscription;

  constructor(private connectivityService: ConnectivityService) { }

  ngOnInit() {
    this.sub = this.connectivityService.isOnline$.subscribe(isOnline => this.isOffline = !isOnline);
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
