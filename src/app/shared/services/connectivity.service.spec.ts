import { ConnectivityService } from './connectivity.service';

describe('ConnectivityService', () => {
  let service: ConnectivityService;

  function setNavigatorOnLine(value: boolean) {
    spyOnProperty(navigator, 'onLine', 'get').and.returnValue(value);
  }

  afterEach(() => {
    if (service) {
      service.ngOnDestroy();
      service = null;
    }
  });

  it('seeds its state from navigator.onLine', () => {
    setNavigatorOnLine(false);
    service = new ConnectivityService();

    expect(service.isOnline).toBe(false);
  });

  it('emits false when the browser goes offline', () => {
    setNavigatorOnLine(true);
    service = new ConnectivityService();
    const emitted: boolean[] = [];
    service.isOnline$.subscribe(isOnline => emitted.push(isOnline));

    window.dispatchEvent(new Event('offline'));

    expect(emitted).toEqual([true, false]);
    expect(service.isOnline).toBe(false);
  });

  it('emits true when the browser comes back online', () => {
    setNavigatorOnLine(false);
    service = new ConnectivityService();

    window.dispatchEvent(new Event('online'));

    expect(service.isOnline).toBe(true);
  });

  it('stops listening once destroyed', () => {
    setNavigatorOnLine(true);
    service = new ConnectivityService();
    service.ngOnDestroy();

    window.dispatchEvent(new Event('offline'));

    expect(service.isOnline).toBe(true);
    service = null;
  });
});
