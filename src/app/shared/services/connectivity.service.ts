import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConnectivityService implements OnDestroy {
  isOnline$ = new BehaviorSubject<boolean>(navigator.onLine);

  private onOnline = () => this.isOnline$.next(true);
  private onOffline = () => this.isOnline$.next(false);

  constructor() {
    window.addEventListener('online', this.onOnline);
    window.addEventListener('offline', this.onOffline);
  }

  get isOnline(): boolean {
    return this.isOnline$.value;
  }

  ngOnDestroy() {
    window.removeEventListener('online', this.onOnline);
    window.removeEventListener('offline', this.onOffline);
  }
}
