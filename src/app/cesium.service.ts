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

    plotPoints(div: string){
        this.viewer = new Cesium.Viewer(div);
        this.viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(-75.166493, 39.9060534),
            billboard: {
                image: this.backendServerURL + '/uploads/' + 'LucienRash.jpg',
                height: 100,
                width: 100
            },
            label: {
                text: 'Jon Lucien - Rashida',
                font: '14pt monospace',
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                outlineWidth: 2,
                verticalOrigin: Cesium.VerticalOrigin.TOP,
                pixelOffset: new Cesium.Cartesian2(0, 64),
            },
        });
    }

    displayRecord(div: string,  record: Record, conflictedLocation: ILocation,
        finalLocation: ILocation, name: string){
        this.viewer = new Cesium.Viewer(div);

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
}
