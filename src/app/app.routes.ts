import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { MapComponent } from './features/map/map';
import { LogbookComponent } from './features/logbook/logbook';
import { RankingComponent } from './features/ranking/ranking.component';
import { RiverManagementComponent } from './pages/river-management.component';
import { BaitManagementComponent } from './pages/bait-management.component';
import { FishManagementComponent } from './pages/fish-management.component';
import { FishingSpotManagementComponent } from './pages/fishing-spot-management.component';
import { CatchRecordFormComponent } from './pages/catch-record-form.component';
import { EquipmentManagementComponent } from './pages/equipment-management.component';
import { CatalogComponent } from './features/catalog/catalog.component';
import { FishingRegulationManagementComponent } from './pages/fishing-regulation-management.component';
import { RiverSpeciesManagementComponent } from './pages/river-species-management.component';
import { AuthComponent } from './pages/auth.component';

export const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: AuthComponent },
  { path: 'mapa', component: MapComponent, canActivate: [authGuard] },
  { path: 'diario', component: LogbookComponent, canActivate: [authGuard] },
  { path: 'diario/novo', component: CatchRecordFormComponent, canActivate: [authGuard] },
  { path: 'ranking', component: RankingComponent, canActivate: [authGuard] },
  { path: 'especies', component: CatalogComponent, canActivate: [authGuard] },
  { path: 'regulations', component: FishingRegulationManagementComponent, canActivate: [authGuard] },
  { path: 'rivers', component: RiverManagementComponent, canActivate: [authGuard] },
  { path: 'baits', component: BaitManagementComponent, canActivate: [authGuard] },
  { path: 'fishes', component: FishManagementComponent, canActivate: [authGuard] },
  { path: 'fishing-spots', component: FishingSpotManagementComponent, canActivate: [authGuard] },
  { path: 'equipments', component: EquipmentManagementComponent, canActivate: [authGuard] },
  { path: 'river-species', component: RiverSpeciesManagementComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' }
];
