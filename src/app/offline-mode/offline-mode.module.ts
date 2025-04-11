import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OfflineModePageRoutingModule } from './offline-mode-routing.module';

// Import the standalone component
import { OfflineModePage } from './offline-mode.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OfflineModePageRoutingModule,
    OfflineModePage  // Import it here
  ],
})
export class OfflineModePageModule {}
