import { Component, OnInit, Injectable, ViewEncapsulation } from '@angular/core';
import { Observable, from} from 'rxjs';
import { map } from 'rxjs/operators';
import { AcNotification, ActionType } from 'angular-cesium';


@Component({
    selector: 'app-plane-layer',
    templateUrl: 'planes-layer.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class PlaneLayerComponent implements OnInit {
    planes$: Observable<AcNotification>|undefined;
    showTracks = true;

    constructor(private planesService: PlanesService) {
    }

    ngOnInit() {
        this.planes$ = this.planesService.getPlanes().pipe( map((plane: any)  => {
            return ({
                id: plane.id,
                actionType: ActionType.ADD_UPDATE,
                entity: plane,
            });
        })
        );
    }

    getColor(plane: any) {
        if (plane.name.startsWith('Boeing')) {
            return Cesium.Color.Green;
        } else {
            return Cesium.Color.White;
        }
    }
}

// Example mock service

@Injectable({
    providedIn: 'root'
  })

  export class PlanesService {
    private planes = [
      {
        id: '1',
        position: Cesium.Cartesian3.fromDegrees(30, 30),
        name: 'Airbus a320',
        scale: 0.1,
        image: 'http://localhost:3000/uploads/DrumSuite.jpg'
      },
      {
        id: '2',
        position: Cesium.Cartesian3.fromDegrees(31, 31),
        name: 'Boeing 777',
        scale: 0.2,
        image: 'http://localhost:3000/uploads/Sabu.jpg'
      }
    ];

    getPlanes() {
      // Or get it from a real updating data source
      return from(this.planes);
    }
}
