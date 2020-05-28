import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router'; // CLI imports router
import { RecordslistComponent } from './recordslist/recordslist.component';
import { PageNotFoundComponent } from './pagenotfound.component';

const routes: Routes = [
    { path: 'list', component: RecordslistComponent },
    // { path: 'details', component: RecordDetailsComponent },
    { path: '',   redirectTo: '/list', pathMatch: 'full' }, // redirect to `first-component`
    { path: '**', component: PageNotFoundComponent },  // Wildcard route for a 404 page
    ];

// configures NgModule imports and exports
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
