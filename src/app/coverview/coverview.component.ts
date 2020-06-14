import { Component, Inject } from '@angular/core';
import { CoverViewOverlayRef } from './coverview.overlayref';
import { COVER_VIEW_DIALOG_DATA } from './coverview.injectiontoken';
import { environment } from 'src/environments/environment';

@Component({
  templateUrl: './coverview.component.html',
  styleUrls: ['./coverview.component.css']
})
export class CoverViewOverlayComponent {

  backendServerURL = environment.backendURL + ':' + environment.backendPort;

  constructor(
    public dialogRef: CoverViewOverlayRef,
    @Inject(COVER_VIEW_DIALOG_DATA) public record: any
  ) { }
}
