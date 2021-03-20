import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router'; // CLI imports router
import { RecordslistComponent } from './recordslist/recordslist.component';
import { PageNotFoundComponent } from './pagenotfound.component';
import { RecordDetailsComponent } from './details/recorddetails.component';
import { MapLayerComponent } from './mapcomponent/map.component';
import { StudiolistComponent } from './studiolist/studiolist.component';

const routes: Routes = [
    { path: 'list', component: RecordslistComponent },
    { path: 'record/:recordId', component: RecordDetailsComponent },
    { path: 'map/:recordsId', component: MapLayerComponent },
    { path: 'studios', component: StudiolistComponent },
    { path: '',   redirectTo: '/list', pathMatch: 'full' }, // redirect to `first-component`
    { path: '**', component: PageNotFoundComponent },  // Wildcard route for a 404 page
    ];

// configures NgModule imports and exports
@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
