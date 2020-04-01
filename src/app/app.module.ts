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
import {
  MatFormFieldModule,
  MatDialogModule,
  MatInputModule,
  MatButtonModule,
  MatIconModule,
} from '@angular/material';
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
