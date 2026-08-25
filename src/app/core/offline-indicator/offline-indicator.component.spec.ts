import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { OfflineIndicatorComponent } from './offline-indicator.component';
import { ConnectivityService } from '../../shared/services/connectivity.service';

describe('OfflineIndicatorComponent', () => {
  let fixture: ComponentFixture<OfflineIndicatorComponent>;
  let isOnline$: BehaviorSubject<boolean>;

  beforeEach(() => {
    isOnline$ = new BehaviorSubject<boolean>(true);
    TestBed.configureTestingModule({
      declarations: [OfflineIndicatorComponent],
      providers: [{ provide: ConnectivityService, useValue: { isOnline$ } }]
    });
    fixture = TestBed.createComponent(OfflineIndicatorComponent);
    fixture.detectChanges();
  });

  function indicator(): HTMLElement {
    return fixture.nativeElement.querySelector('.offline-indicator');
  }

  it('shows nothing while online', () => {
    expect(indicator()).toBeNull();
  });

  it('shows the offline message when the connection drops', () => {
    isOnline$.next(false);
    fixture.detectChanges();

    expect(indicator().textContent).toContain('offline');
  });

  it('hides the message again when the connection returns', () => {
    isOnline$.next(false);
    fixture.detectChanges();
    isOnline$.next(true);
    fixture.detectChanges();

    expect(indicator()).toBeNull();
  });
});
