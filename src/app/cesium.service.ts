import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
declare let Cesium: any;
// import * as Cesium from '../assets/js/Cesium.js';

// eslint-disable-next-line max-len
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjZWUyZTI1ZS1kODhhLTRhNTktYjE0MC03ODQzZjUzNWJiOTUiLCJpZCI6MzY5MjUsImlhdCI6MTYwNDM1MjY4Nn0.cowogaiztzNxPl9oAXEPh45yo5SWD4if2Bz9fo54YEo';

@Injectable({
    providedIn: 'root'
})
export class CesiumService {
    constructor() { }

    backendServerURL = environment.backendURL + ':' + environment.backendPort;

    private viewer: any;plotPoints(div: string){
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
}
