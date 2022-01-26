import { Component, Inject } from '@angular/core';
import { CoverViewOverlayRef } from './coverview.overlayref';
import { COVER_VIEW_DIALOG_DATA } from './coverview.injectiontoken';
import { environment } from '../../environments/environment';
import { Record, hasAdditionalPictures } from '../model/record';

@Component({
    templateUrl: './coverview.component.html',
    styleUrls: ['./coverview.component.css']
})
export class CoverViewOverlayComponent {

    backendServerURL = environment.backendURL + ':' + environment.backendPort;
    currentImage: string | undefined;
    private currentIndex = 0;
    hasAdditionalPictures = false;

    constructor(
        public dialogRef: CoverViewOverlayRef,
        @Inject(COVER_VIEW_DIALOG_DATA) public record: Record
    ) {
        if ((record !== undefined) && (record !== null)) {
            this.currentImage = record.ImageFileName;
            this.hasAdditionalPictures = hasAdditionalPictures(record);
        }
    }

    nextImage() {
        if (this.currentImage === this.record.ImageFileName) {
            if (this.record.additionalPics !== undefined && this.hasAdditionalPictures) {
                this.currentImage = this.record.additionalPics[this.currentIndex];
            }
        } else {
            if (this.record.additionalPics !== undefined) {
                if (this.currentIndex + 1 < this.record.additionalPics.length) {
                    this.currentIndex++;
                    this.currentImage = this.record.additionalPics[this.currentIndex];
                } else {
                    this.currentImage = this.record.ImageFileName;
                    this.currentIndex = 0;
                }
            }
        }
    }

    prevImage() {
        if (this.currentImage === this.record.ImageFileName) {
            if (this.record.additionalPics !== undefined && this.hasAdditionalPictures) {
                this.currentIndex = this.record.additionalPics.length - 1;
                this.currentImage = this.record.additionalPics[this.currentIndex];
            }
        } else {
            if (this.record.additionalPics !== undefined) {
                if (this.currentIndex - 1 >= 0) {
                    this.currentIndex--;
                    this.currentImage = this.record.additionalPics[this.currentIndex];
                } else {
                    this.currentImage = this.record.ImageFileName;
                    this.currentIndex = 0;
                }
            }
        }
    }

    setImage(i: number) {
        if (i === 0) {
            this.currentImage = this.record.ImageFileName;
            this.currentIndex = 0;
        } else if ((this.record.additionalPics !== undefined && this.hasAdditionalPictures)
      && (i - 1 >= 0) && (i - 1 < this.record.additionalPics.length)) {
            this.currentIndex = i - 1;
            this.currentImage = this.record.additionalPics[this.currentIndex];
        }
    }
}

