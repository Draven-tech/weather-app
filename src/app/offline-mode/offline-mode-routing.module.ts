import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OfflineModePage } from './offline-mode.page';

const routes: Routes = [
  {
    path: '',
    component: OfflineModePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OfflineModePageRoutingModule {}
