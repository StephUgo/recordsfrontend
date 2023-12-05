import { Injectable } from '@angular/core';
declare let Cesium: any;
// import * as Cesium from '../assets/js/Cesium.js';

// eslint-disable-next-line max-len
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjZWUyZTI1ZS1kODhhLTRhNTktYjE0MC03ODQzZjUzNWJiOTUiLCJpZCI6MzY5MjUsImlhdCI6MTYwNDM1MjY4Nn0.cowogaiztzNxPl9oAXEPh45yo5SWD4if2Bz9fo54YEo';

@Injectable({
    providedIn: 'root'
})
export class CesiumService {
    constructor() { }
    private viewer: any;plotPoints(div: string){
        this.viewer = new Cesium.Viewer(div);
        this.viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(-75.59777, 40.03883),
            point: {
                color: Cesium.Color.RED,
                pixelSize: 16,
            },
        });
        this.viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(-80.5, 35.14),
            point: {
                color: Cesium.Color.BLUE,
                pixelSize: 16,
            },
        });
        this.viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(-80.12, 25.46),
            point: {
                color: Cesium.Color.YELLOW,
                pixelSize: 16,
            },
        });
    }
}
