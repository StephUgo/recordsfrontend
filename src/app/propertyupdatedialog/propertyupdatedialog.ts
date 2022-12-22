import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder } from '@angular/forms';
import { RecordUtils } from '../recordutils';


@Component({
    selector: 'app-propertyupdatedialog',
    templateUrl: './propertyupdatedialog.html',
    styleUrls: ['./propertyupdatedialog.css']
})
export class PropertyUpdateDialogComponent {

    propertyNameList: ReadonlyArray<string>;
    form: FormGroup;

    constructor(private fb: FormBuilder, public dialogRef: MatDialogRef<PropertyUpdateDialogComponent>, private recordUtils: RecordUtils) {

        this.propertyNameList = Object.assign([], this.recordUtils.getProperties().map((currentObject) => currentObject.label));

        // Init the form group with a formbuilder, we take the initial data from the record
        // selected in the record list (nb : we dont edit the id of course...)
        this.form = this.fb.group({
            propertyname: [this.propertyNameList[0], []],
            propertyvalue: ['', []]
        });
    }

    close() {
        this.dialogRef.close();
    }

    save() {
        const result = {
            'property': this.recordUtils.getPropertyFromPropertyLabel(this.form.value.propertyname),
            'value': this.form.value.propertyvalue.trim()
        };

        this.dialogRef.close(result);
    }
}
