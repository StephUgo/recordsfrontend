import { Injectable, NgZone } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Record } from './model/record';
import { Router } from '@angular/router';
declare let Cesium: any;

export interface ILocation {
    lat: number;
    lon: number;
}


@Injectable({
    providedIn: 'root'
})
export class CesiumService {
    constructor(private router: Router, private ngZone: NgZone) { }

    backendServerURL = environment.backendURL + ':' + environment.backendPort;
    private viewer: any;
    private handler: any;

    /**
     * Initialize a Cesium viewer on the Div element which is identified by the parameter.
     *
     * @param div - Id of the Div element for which the viewer has to be created.
     */
    initViewer(div: string) {
        this.viewer = new Cesium.Viewer(div);

        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);

        this.handler.setInputAction((click: any) => {
            const pickedObject = this.viewer.scene.pick(click.position);

            if (pickedObject!==undefined && pickedObject.id !== undefined) {
                let id = JSON.stringify(pickedObject.id.id);
                id = id.replaceAll('"','');
                if (id.includes('_')){
                    id = id.split('_')[0];
                }
                this.ngZone.run(() => this.router.navigateByUrl('/record/' + id));
            }
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    }

    /**
     * Reset the current viewer to undefined.
     */
    resetViewer() {
        this.viewer = undefined;
        this.handler = undefined;
    }

    /**
     * Display a record cover image in the associated viewer
     *
     * @param record - The record for which the image is displayed.
     * @param originalLocation - Original location of the record.
     * @param finalLocation - Final (deconflicted) location of the record.
     * @param name Associated name.
     * @param locationIndex: Index of the location (if the recording was made in several studios)
     */
    displayRecord(record: Record, conflictedLocation: ILocation, finalLocation: ILocation, name: string, locationIndex: number,
        scaleFactor: number){
        let entityID = 'null';
        if (record._id !== null) {
            entityID = record._id;
            if (locationIndex > 0) {
                entityID = entityID + '_' + locationIndex;
            }
        }
        this.viewer.entities.add({
            id: entityID,
            position: Cesium.Cartesian3.fromDegrees(finalLocation.lon, finalLocation.lat),
            name: name,
            billboard: {
                image: this.backendServerURL + '/uploads/' + record.ImageFileName,
                scaleByDistance: new Cesium.NearFarScalar(4e2, scaleFactor * 1.3, 1.0e4, scaleFactor / 1.2)
            },
            label: {
                text: name,
                pixelOffset: new Cesium.Cartesian2(0, 130),
                translucencyByDistance: new Cesium.NearFarScalar(5e2, 1.0, 8.0e6, 0.0),
                font: '20px Helvetica'
            }
        });
    }

    /**
     * Display a deconfliction (straight) line in the associated viewer
     *
     * @param record - The record for which the line is created.
     * @param sourceLocation - Source location of the record.
     * @param finalLocation - Final (deconflicted) location of the record.
     */
    displayLine(record: Record, sourceLocation: ILocation, finalLocation: ILocation){
        this.viewer.entities.add({
            polyline : {
                positions: Cesium.Cartesian3.fromDegreesArray([sourceLocation.lon, sourceLocation.lat,
                    finalLocation.lon, finalLocation.lat]),
                width : 4,
                material: new Cesium.PolylineOutlineMaterialProperty({
                    color: Cesium.Color.RED,
                })
            }
        });
    }
}
