import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Record } from './model/record';
declare let Cesium: any;

export interface ILocation {
    lat: number;
    lon: number;
}


@Injectable({
    providedIn: 'root'
})
export class CesiumService {
    constructor() { }

    backendServerURL = environment.backendURL + ':' + environment.backendPort;
    private viewer: any;

    /**
     * Initialize a Cesium viewer on the Div element which is identified by the parameter.
     *
     * @param div - Id of the Div element for which the viewer has to be created.
     */
    initViewer(div: string) {
        this.viewer = new Cesium.Viewer(div);
    }

    /**
     * Reset the current viewer to undefined.
     */
    resetViewer() {
        this.viewer = undefined;
    }

    /**
     * Display a record cover image in the associated viewer
     *
     * @param record - The record for which the image is displayed.
     * @param originalLocation - Original location of the record.
     * @param finalLocation - Final (deconflicted) location of the record.
     * @param name Associated name.
     */
    displayRecord(record: Record, conflictedLocation: ILocation, finalLocation: ILocation, name: string){
        this.viewer.entities.add({
            id: record._id !== null ? record._id : 'null',
            position: Cesium.Cartesian3.fromDegrees(finalLocation.lon, finalLocation.lat),
            name: name,
            billboard: {
                image: this.backendServerURL + '/uploads/' + record.ImageFileName,
                height: 150,
                width: 150
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
                width : 2,
                material: new Cesium.PolylineOutlineMaterialProperty({
                    color: Cesium.Color.RED,
                })
            }
        });
    }
}
