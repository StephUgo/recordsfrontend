import { Component, OnInit,  ViewEncapsulation } from '@angular/core';
import { Observable, from, Subscription } from 'rxjs';
import { AcNotification, ActionType } from 'angular-cesium';
import { ActivatedRoute } from '@angular/router';
import { AppSharedStateService } from '../app.sharedstateservice';
import { Record } from '../model/record';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-map-layer',
  templateUrl: 'map.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class MapLayerComponent implements OnInit {
  backendServerURL = environment.backendURL + ':' + environment.backendPort;
  showTracks = true;
  records: Array<Record> = []; // The last searched records
  record: Record | null = null; // The selected record
  subscription: Subscription; // Subscription used to get all the previous fields from the AppSharedStateService observables.
  recordMapObjects$: Observable<AcNotification> | undefined;

  constructor(private route: ActivatedRoute, private appStateService: AppSharedStateService) {
    this.subscription = this.appStateService.setRecords$.subscribe(
      records => {
        console.log('Details notification : records = ' + records);
        this.records = records;
      });
    this.records = this.appStateService.records.value;
  }

  ngOnInit() {
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
                position: Cesium.Cartesian3.fromDegrees(location.lon, location.lat),
                name: location.name,
                scale: 0.2,
                image: this.backendServerURL + '/uploads/' + this.record.ImageFileName,
                label : {
                  text : location.name,
                  pixelOffset : new Cesium.Cartesian2(0, 70)
                }
              }
            });
            this.recordMapObjects$ = from(notif);
          }
        }
      }
    }
  }
}
