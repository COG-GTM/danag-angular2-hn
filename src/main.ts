import { enableProdMode, provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';

import { environment } from './environments/environment';
import { HackerNewsAPIService } from './app/shared/services/hackernews-api.service';
import { SettingsService } from './app/shared/services/settings.service';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        provideZoneChangeDetection(),
        provideRouter(routes),
        provideServiceWorker('ngsw-worker.js', {
            enabled: environment.production,
        }),
        HackerNewsAPIService, SettingsService,
    ]
})
  .catch(err => console.error(err));
