import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { HomePage } from './home/home.page'; // Make sure path is correct

const routes: Routes = [
  {
    path: '',
    component: HomePage, // Use it directly
  },
  {
    path: 'offline-mode',
    loadChildren: () => import('./offline-mode/offline-mode.module').then( m => m.OfflineModePageModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
