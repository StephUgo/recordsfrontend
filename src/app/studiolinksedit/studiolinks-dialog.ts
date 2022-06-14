import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Record } from '../model/record';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Studio } from '../model/studio';
import { RecordUtils } from '../recordutils';

export interface StudioLinksDialogData {
    selectedRecord: Record;
    allStudios: Studio[];
    selectedStudios: Studio[];
}

@Component({
    selector: 'app-studiolinks-dialog',
    styleUrls: ['studiolinks-dialog.css'],
    templateUrl: 'studiolinks-dialog.html',
})
export class StudioLinksDialogComponent implements OnInit {

    studios: Studio[] = [];
    fromRecord: Record;
    form: FormGroup;
    selectedStudios: string[] | null = [];

    constructor(private fb: FormBuilder, public dialogRef: MatDialogRef<StudioLinksDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: StudioLinksDialogData, public recordUtils: RecordUtils) {
        this.fromRecord = data.selectedRecord;
        this.studios = data.allStudios;
        const currentStudioNames = this.getStudioNamesFromCurrentRecord();
        this.selectedStudios = currentStudioNames;

        this.form = this.fb.group({
            selectedStudios:  [null]
        });
    }

    ngOnInit() {
        this.form.controls.selectedStudios.setValue(this.selectedStudios);
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    close() {
        this.dialogRef.close();
    }

    save() {
        if (this.form.value.selectedStudios !== undefined) {
            this.processStudios(this.form.value.selectedStudios);
            this.dialogRef.close(this.fromRecord);
        } else {
            this.dialogRef.close();
        }
    }

    private processStudios(selectedStudioNames: string[]) {
        this.recordUtils.clearStudios(this.fromRecord);
        if (selectedStudioNames.length > 0) {
            for (let index = 0; index < selectedStudioNames.length; index++) {
                const studioName = selectedStudioNames[index];
                const selectedStudios = this.studios.filter((s) => s.name === studioName);
                if (selectedStudios.length > 0) {
                    if ((this.fromRecord.keywords === undefined) || (this.fromRecord.keywords === null)) {
                        this.fromRecord.keywords = [];
                    }
                    this.fromRecord.keywords.push('Recorded @' + JSON.stringify(selectedStudios[0]));
                }
            }
        }
    }

    private getStudioNamesFromCurrentRecord(): string[] | null {
        if (this.fromRecord !== undefined && this.fromRecord !== null && this.fromRecord.keywords !== undefined
            && this.fromRecord.keywords !== null) {
            const currentStudiosJSONStrings = this.fromRecord.keywords.filter(
                (s) => s !== null && s.startsWith('Recorded @')).map((s) => s.substring(10));
            if (currentStudiosJSONStrings.length > 0) {
                const currentStudiosNames = currentStudiosJSONStrings.map(s => JSON.parse(s).name);
                if (currentStudiosNames.length > 0) {
                    return currentStudiosNames;
                } else {
                    return null;
                }
            }
        }
        return null;
    }
}
