import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { RecordsformComponent } from './recordsform/recordsform.component';
import { SearchFormComponent } from './searchform/searchform.component';
import { UploadFormComponent } from './uploadform/uploadform.component';
import { RecordslistComponent } from './recordslist/recordslist.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RecordDialogModalComponent } from './record-dialog-modal/record-dialog-modal.component';
import { UserDialogComponent } from './users/user-dialog-modal.component';
import { ProfileDialogComponent } from './users/updateprofile-dialog.component';
import { UserComponent } from './users/user.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { NgxPaginationModule } from 'ngx-pagination';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './sec/authinterceptor';
import { KeywordsTableDialogComponent } from './keywords/keywords-dialog';
import { CdkTableModule } from '@angular/cdk/table';
import { CommentsDialogComponent } from './comments/comments-dialog';
import { AppRoutingModule } from './app.routingmodule';
import { RecordDetailsComponent } from './details/recorddetails.component';
import { CoverViewOverlayComponent } from './coverview/coverview.component';
import { StringListDialogComponent } from './stringlistedit/stringlist-dialog';
import { StudiolistComponent } from './studiolist/studiolist.component';
import { StudioformComponent } from './studioform/studioform.component';
import { StudioLinksDialogComponent } from './studiolinksedit/studiolinks-dialog';
import { StudioDialogModalComponent } from './studio-dialog-modal/studio-dialog-modal.component';
import { PropertyUpdateDialogComponent } from './propertyupdatedialog/propertyupdatedialog';
import { MapComponent } from './mapcomponent/mapcomponent.component';

@NgModule({
    declarations: [
        AppComponent,
        CoverViewOverlayComponent,
        RecordsformComponent,
        SearchFormComponent,
        UploadFormComponent,
        RecordslistComponent,
        RecordDetailsComponent,
        RecordDialogModalComponent,
        UserDialogComponent,
        KeywordsTableDialogComponent,
        StringListDialogComponent,
        CommentsDialogComponent,
        UserComponent,
        ProfileDialogComponent,
        StudiolistComponent,
        StudioformComponent,
        StudioLinksDialogComponent,
        StudioDialogModalComponent,
        PropertyUpdateDialogComponent,
        MapComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        HttpClientModule,
        CdkTableModule,
        MatFormFieldModule,
        MatDialogModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatSelectModule,
        ReactiveFormsModule,
        NgxPaginationModule,
        FontAwesomeModule,
        AppRoutingModule
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
