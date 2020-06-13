import { Injectable, InjectionToken, ComponentRef, Injector } from '@angular/core';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { CoverViewOverlayComponent } from './coverview.component';
import { CoverViewOverlayRef } from './coverview.overlayref';
import { Record } from '../model/record';


// Each property can be overridden by the consumer
interface CoverViewOverlayConfig {
    record: Record | null;
    panelClass?: string;
    hasBackdrop?: boolean;
    backdropClass?: string;
}

const DEFAULT_CONFIG: CoverViewOverlayConfig = {
    record: null,
    hasBackdrop: true,
    backdropClass: 'dark-backdrop',
    panelClass: 'tm-file-preview-dialog-panel'
};

export const COVER_VIEW_DIALOG_DATA = new InjectionToken<Record>('FILE_PREVIEW_DIALOG_DATA');

@Injectable({
    providedIn: 'root'
})
export class CoverViewOverlayService {

    // Inject overlay service
    constructor(    private injector: Injector, private overlay: Overlay) { }

    open(config: CoverViewOverlayConfig) {

        // Override default configuration
        const overlayConfig = { ...DEFAULT_CONFIG, ...config };

        // Returns an OverlayRef (which is a PortalHost)
        const overlayRef = this.createOverlay(overlayConfig);

        // Instantiate remote control
        const coverViewOverlayRef = new CoverViewOverlayRef(overlayRef);

        this.attachDialogContainer(overlayRef, overlayConfig, coverViewOverlayRef);

        // Subscribe to a stream that emits when the backdrop was clicked
        overlayRef.backdropClick().subscribe(_ => coverViewOverlayRef.close());

        return coverViewOverlayRef;
    }

    private getOverlayConfig(config: CoverViewOverlayConfig): OverlayConfig {
        const positionStrategy = this.overlay.position()
            .global()
            .centerHorizontally()
            .centerVertically();

        const overlayConfig = new OverlayConfig({
            hasBackdrop: config.hasBackdrop,
            backdropClass: config.backdropClass,
            panelClass: config.panelClass,
            scrollStrategy: this.overlay.scrollStrategies.block(),
            positionStrategy
        });

        return overlayConfig;
    }

    private createOverlay(config: CoverViewOverlayConfig) {
        // Returns an OverlayConfig
        const overlayConfig = this.getOverlayConfig(config);

        // Returns an OverlayRef
        return this.overlay.create(overlayConfig);
    }

    private createInjector(config: CoverViewOverlayConfig, dialogRef: CoverViewOverlayRef): PortalInjector {
        // Instantiate new WeakMap for our custom injection tokens
        const injectionTokens = new WeakMap();

        // Set custom injection tokens
        injectionTokens.set(CoverViewOverlayRef, dialogRef);
        injectionTokens.set(COVER_VIEW_DIALOG_DATA, config.record);

        // Instantiate new PortalInjector
        return new PortalInjector(this.injector, injectionTokens);
    }

    private attachDialogContainer(overlayRef: OverlayRef, config: CoverViewOverlayConfig, dialogRef: CoverViewOverlayRef) {
        const injector = this.createInjector(config, dialogRef);

        const containerPortal = new ComponentPortal(CoverViewOverlayComponent, null, injector);
        const containerRef: ComponentRef<CoverViewOverlayComponent> = overlayRef.attach(containerPortal);

        return containerRef.instance;
    }
}
