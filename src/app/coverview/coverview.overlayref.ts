import { OverlayRef } from '@angular/cdk/overlay';

export class CoverViewOverlayRef {

    constructor(private overlayRef: OverlayRef) { }

    close(): void {
        this.overlayRef.dispose();
    }
}
