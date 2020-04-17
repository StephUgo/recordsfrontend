import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AngularFontAwesomeModule } from 'angular-font-awesome';


import { AppComponent } from './app.component';
import { RecordsformComponent } from './recordsform/recordsform.component';
import { RecordslistComponent } from './recordslist/recordslist.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RecordDialogModalComponent } from './record-dialog-modal/record-dialog-modal.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [
    AppComponent,
    RecordsformComponent,
    RecordslistComponent,
    RecordDialogModalComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    MatFormFieldModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    AngularFontAwesomeModule
  ],
  entryComponents: [
    RecordDialogModalComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
