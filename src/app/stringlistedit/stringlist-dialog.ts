import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Record } from '../model/record';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';

export enum StringListDialogFlavor {
    Keywords = 0,
    AdditionalPics = 1,
    Samples = 2
}

export interface StringListDialogData {
    selectedRecord: Record;
    isAddOnly: boolean;
    dialogFlavor: StringListDialogFlavor;
}

@Component({
    selector: 'app-stringlist-dialog',
    styleUrls: ['stringlist-dialog.css'],
    templateUrl: 'stringlist-dialog.html',
})
export class StringListDialogComponent {
    displayedColumns: string[] = ['index', 'value', 'deleteAction'];

    values: string[] = [];
    fromRecord: Record;
    form: UntypedFormGroup;
    isAddOnlyDialog = false;
    dialogFlavor = StringListDialogFlavor.Keywords;

    constructor(private fb: UntypedFormBuilder, public dialogRef: MatDialogRef<StringListDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        this.fromRecord = data.selectedRecord;
        this.isAddOnlyDialog = data.isAddOnly;
        if (data.dialogFlavor !== undefined && data.dialogFlavor !== null) {
            this.dialogFlavor = data.dialogFlavor;
        }

        switch (this.dialogFlavor) {
            case StringListDialogFlavor.Keywords:
                this.values = Object.assign([], this.fromRecord.keywords);
                break;
            case StringListDialogFlavor.AdditionalPics:
                this.values = Object.assign([], this.fromRecord.additionalPics);
                break;
            case StringListDialogFlavor.Samples:
                this.values = Object.assign([], this.fromRecord.audioSamples);
                break;
        }

        this.form = this.fb.group({
            newValue: ['', []]
        });
    }

    onNoClick(): void {
        this.dialogRef.close();
    }


    delete(index: number) {
        console.log('Delete value with index ' + index);
        const updatedValues: string[] = [];
        for (let i = 0; i < this.values.length; i++) {
            if (i !== index) {
                updatedValues.push(this.values[i]);
            }
        }
        this.values = updatedValues;
    }

    add() {
        if (this.form.value.newValue !== null) {
            const value = this.form.value.newValue as string;
            if (value.length > 0) {
                const newValues = Object.assign([], this.values);
                if (value.indexOf('\\')) { // Management of separator for multiple new values
                    const valuesToBeAdded = value.split('\\');
                    for (let index = 0; index < valuesToBeAdded.length; index++) {
                        const element = valuesToBeAdded[index];
                        valuesToBeAdded[index] = this.stringValueProcessing(element);
                    }
                    Array.prototype.push.apply(newValues, valuesToBeAdded);
                } else {
                    // Add new values
                    newValues.push(this.stringValueProcessing(value));
                }
                this.values = newValues;
            }
        }
    }

    /**
   * String Value Processing :
   * - Management of <iframe> HTML code for 'samples' dialog flavor
   * example: <iframe width="376" height="282" src="https://www.youtube.com/embed/H2ENrW65T8k"
   * title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write;
   * encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
   * @param sourceCode
   */
    private stringValueProcessing(sourceCode: string): string {
        if (this.dialogFlavor === StringListDialogFlavor.Samples) {
            const trimmedSourceCode = sourceCode.trim();
            if (trimmedSourceCode.startsWith('<iframe')) {
                const sourceURLIndex = trimmedSourceCode.indexOf('src="');
                if (sourceURLIndex > 0) {
                    return trimmedSourceCode.substring(sourceURLIndex + 5, trimmedSourceCode.indexOf('"', sourceURLIndex + 5));
                } else {
                    console.error('No source URL found in iframe!');
                    return 'Error: No source URL found in iframe!';
                }
            } else {
                return trimmedSourceCode;
            }
        } else {
            return sourceCode;
        }
    }

    close() {
        this.dialogRef.close();
    }

    save() {
        switch (this.dialogFlavor) {
            case StringListDialogFlavor.Keywords:
                this.fromRecord.keywords = this.values;
                break;
            case StringListDialogFlavor.AdditionalPics:
                this.fromRecord.additionalPics = this.values;
                break;
            case StringListDialogFlavor.Samples:
                this.fromRecord.audioSamples = this.values;
                break;
        }

        this.dialogRef.close(this.fromRecord);
    }

    getElementLabel() {
        switch (this.dialogFlavor) {
            case StringListDialogFlavor.Keywords:
                return 'keyword';
            case StringListDialogFlavor.AdditionalPics:
                return 'additional picture';
            case StringListDialogFlavor.Samples:
                return 'audio sample';
        }
    }

    capitalize(s: string) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }
}
