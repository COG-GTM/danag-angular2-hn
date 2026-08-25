import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SettingsComponent } from './settings/settings.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { OfflineIndicatorComponent } from './offline-indicator/offline-indicator.component';

@NgModule({
  imports: [CommonModule, RouterModule],
  declarations: [HeaderComponent, FooterComponent, SettingsComponent, OfflineIndicatorComponent],
  exports: [HeaderComponent, FooterComponent, OfflineIndicatorComponent]
})
export class CoreModule { }
