import { Component, Inject, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Studio } from '../model/studio';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
    selector: 'app-studio-dialog-modal',
    templateUrl: './studio-dialog-modal.component.html',
    styleUrls: ['./studio-dialog-modal.component.css']
})
export class StudioDialogModalComponent {

    form: FormGroup;
    fromPage: Studio; // The studio to edit coming from the StudioListComponent

    constructor(private fb: FormBuilder, public dialogRef: MatDialogRef<StudioDialogModalComponent>, 
        @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {

        this.fromPage = data.selectedStudio;

        // Init the form group with a formbuilder, we take the initial data from the studio
        // selected in the studio list (nb : we dont edit the id of course...)
        this.form = this.fb.group({
            name: [(this.fromPage.name) ? this.fromPage.name.trim() : '', []],
            address: [(this.fromPage.address) ? this.fromPage.address.trim() : '', []],
            lat: [this.fromPage.lat, []],
            lon: [this.fromPage.lon, []]
        });
    }

    close() {
        this.dialogRef.close();
    }

    save() {
        const editedStudio = new Studio(
            this.form.value.name.trim(),
            this.form.value.address.trim(),
            this.form.value.lat,
            this.form.value.lon
        );
        editedStudio._id = this.fromPage._id;
        this.dialogRef.close(editedStudio);
    }
}
