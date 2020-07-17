import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
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
  recordMapObjects$: Observable<AcNotification> = Observable.create((s: any) => this.subscriber = s);
  private subscriber: any;
  private scalefactor = 0.5; // Currently we just have one computed scale factor (to be updated when we will display several locations)

  constructor(private route: ActivatedRoute, private appStateService: AppSharedStateService) {
    this.appStateService.setRecords$.subscribe(
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
            if (this.record.ImageFileName !== undefined) {
              const imageURL = this.backendServerURL + '/uploads/' + this.record.ImageFileName;
              const image = {
                url: imageURL,
                context: 'Record cover',
                width: 0
              };
              this.getImageDimension(image).subscribe(
                response => {
                  console.log(response);
                  if (image.width !== 0) {
                    this.scalefactor = 220 / image.width;
                  }
                  this.parseKeywords();
                }
              );
            }
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
      const notifs = new Array<AcNotification>();
      if (keywords !== undefined) {
        for (let index = 0; index < keywords.length; index++) {
          const keyword = keywords[index];
          if (keyword.startsWith('Recorded @{')) {
            const stringLocation = keyword.substring(keyword.indexOf('{'));
            const location = JSON.parse(stringLocation);
            notifs.push({
              id: this.record._id !== null ? this.record._id : 'null',
              actionType: ActionType.ADD_UPDATE,
              entity: {
                id: this.record._id !== null ? this.record._id : 'null',
                position: Cesium.Cartesian3.fromDegrees(location.lon, location.lat),
                name: location.name,
                scale: this.scalefactor,
                image: this.backendServerURL + '/uploads/' + this.record.ImageFileName,
                label: {
                  text: location.name,
                  pixelOffset: new Cesium.Cartesian2(0, 130)
                }
              }
            });
          }
        }
      }
      this.subscriber.next(notifs[0]); // To be updated when we will support several locations.
    }
  }

  getImageDimension(image: any): Observable<any> {
    return new Observable(observer => {
      const img = new Image();
      img.onload = function (event) {
        const loadedImage: any = event.currentTarget;
        image.width = loadedImage.width;
        image.height = loadedImage.height;
        observer.next(image);
        observer.complete();
      };
      img.src = image.url;
    });
  }
}
