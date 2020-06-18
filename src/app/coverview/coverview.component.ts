import { Component, Inject } from '@angular/core';
import { CoverViewOverlayRef } from './coverview.overlayref';
import { COVER_VIEW_DIALOG_DATA } from './coverview.injectiontoken';
import { environment } from '../../environments/environment';
import { Record } from '../model/record';

@Component({
  templateUrl: './coverview.component.html',
  styleUrls: ['./coverview.component.css']
})
export class CoverViewOverlayComponent {

  backendServerURL = environment.backendURL + ':' + environment.backendPort;
  currentImage: string | undefined;
  private currentIndex = 0;

  constructor(
    public dialogRef: CoverViewOverlayRef,
    @Inject(COVER_VIEW_DIALOG_DATA) public record: Record
  ) {
    if ((record !== undefined) && (record !== null)) {
      this.currentImage = record.ImageFileName;
    }
  }

  nextImage() {
    if (this.currentImage === this.record.ImageFileName) {
      if ((this.record.additionalPics !== undefined) && (this.record.additionalPics !== null) && (this.record.additionalPics.length > 0)) {
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
}
