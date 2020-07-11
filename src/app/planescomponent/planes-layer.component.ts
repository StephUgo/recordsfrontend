import { Component, OnInit, Injectable, ViewEncapsulation } from '@angular/core';
import { Observable, from, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { AcNotification, ActionType } from 'angular-cesium';
import { ActivatedRoute } from '@angular/router';
import { AppSharedStateService } from '../app.sharedstateservice';
import { Record } from '../model/record';

@Component({
  selector: 'app-plane-layer',
  templateUrl: 'planes-layer.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class PlaneLayerComponent implements OnInit {
  planes$: Observable<AcNotification> | undefined;
  showTracks = true;
  records: Array<Record> = []; // The last searched records
  record: Record | null = null; // The selected record
  subscription: Subscription; // Subscription used to get all the previous fields from the AppSharedStateService observables.
  recordMapObjects$: Observable<AcNotification> | undefined;

  constructor(private route: ActivatedRoute, private appStateService: AppSharedStateService, private planesService: PlanesService) {
    this.subscription = this.appStateService.setRecords$.subscribe(
      records => {
        console.log('Details notification : records = ' + records);
        this.records = records;
      });
    this.records = this.appStateService.records.value;
  }

  ngOnInit() {
    this.planes$ = this.planesService.getPlanes().pipe(map((plane: any) => {
      return ({
        id: plane.id,
        actionType: ActionType.ADD_UPDATE,
        entity: plane,
      });
    })
    );

    this.route.paramMap.subscribe(params => {
      if (params !== null) {
        const recordId = params.get('recordId');
        if (recordId !== null) {
          const foundRecord = this.records.find(record => record._id === recordId);
          if (foundRecord !== undefined) {
            this.record = foundRecord;
            this.parseKeywords();
          }
        } else {
          this.record = null;
        }
      }
    });
  }

  getColor(plane: any) {
    if (plane.name.startsWith('Boeing')) {
      return Cesium.Color.Green;
    } else {
      return Cesium.Color.White;
    }
  }


  parseKeywords() {
    if (this.record !== null) {
      const keywords = this.record.keywords;
      if (keywords !== undefined) {
        for (let index = 0; index < keywords.length; index++) {
          const keyword = keywords[index];
          if (keyword.startsWith('Recorded @{')) {
            const stringLocation = keyword.substring(keyword.indexOf('{'));
            const location = JSON.parse(stringLocation);
            const notif = new Array<AcNotification>();
            notif.push({
              id: this.record._id !== null ? this.record._id : 'null',
              actionType: ActionType.ADD_UPDATE,
              entity: {
                id: this.record._id !== null ? this.record._id : 'null',
                position: Cesium.Cartesian3.fromDegrees( location.lat, location.lon),
                name: this.record.Title,
                scale: 0.2,
                image: 'http://localhost:3000/uploads/' + this.record.ImageFileName
              }
            });
            this.recordMapObjects$ = from(notif);
          }
        }
      }
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
