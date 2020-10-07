import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import { AcNotification, ActionType } from 'angular-cesium';
import { ActivatedRoute } from '@angular/router';
import { AppSharedStateService } from '../app.sharedstateservice';
import { Record } from '../model/record';
import { environment } from 'src/environments/environment';


interface ILocation {
  lat: number;
  lon: number;
}

@Component({
  selector: 'app-map-layer',
  templateUrl: 'map.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class MapLayerComponent implements OnInit {
  backendServerURL = environment.backendURL + ':' + environment.backendPort;
  showTracks = true;
  records: Array<Record> = []; // The last searched records
  selectedRecords = new Array<Record>(); // The selected record
  recordMapObjects$: Observable<AcNotification> = Observable.create((s: any) => this.subscriber = s);
  private subscriber: any;
  private scalefactor = 0.5; // Currently we just have one computed scale factor (to be updated when we will display several locations)
  private selectedLocations: Array<ILocation> = [];
  private locationLabels: Array<string> = [];
  private orientationIndex = 0;

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
        const recordsId = params.get('recordsId');
        this.selectedRecords.length = 0;
        if (recordsId !== undefined && recordsId !== null) {
          const recordsIdArray = recordsId.split(',');
          for (let index = 0; index < recordsIdArray.length; index++) {
            const recordId = recordsIdArray[index];
            const foundRecord = this.records.find(record => record._id === recordId);
            if (foundRecord !== undefined) {
              this.selectedRecords.push(foundRecord);
            }
          }
          this.selectedLocations = [];
          this.locationLabels = [];
          this.orientationIndex = 0;
          this.processSelectedRecords();
        }
      }
    });
  }

  private processSelectedRecords() {
    for (let index = 0; index < this.selectedRecords.length; index++) {
      const foundRecord = this.selectedRecords[index];
      if (foundRecord !== undefined) {
        if (foundRecord.ImageFileName !== undefined) {
          const imageURL = this.backendServerURL + '/uploads/' + foundRecord.ImageFileName;
          const image = {
            url: imageURL,
            context: 'Record cover',
            width: 0
          };
          this.getImageDimension(image).subscribe(
            response => {
              console.log(response);
              if (image.width !== 0) {
                this.scalefactor = 200 / image.width;
              }
              this.parseKeywords(foundRecord);
            }
          );
        }
      }
    }
  }


  parseKeywords(record: Record) {
    if (record !== null) {
      const keywords = record.keywords;
      if (keywords !== undefined) {
        for (let index = 0; index < keywords.length; index++) {
          const keyword = keywords[index];
          if (keyword.startsWith('Recorded @{')) {
            let notif: AcNotification;
            const stringLocation = keyword.substring(keyword.indexOf('{'));
            const location = JSON.parse(stringLocation);
            const checkedLocation = this.processLocation(location);
            if (checkedLocation !== null) {
              this.selectedLocations.push(checkedLocation);
              if (this.locationLabels.includes(location.name)) {
                notif = {
                  id: record._id !== null ? record._id : 'null',
                  actionType: ActionType.ADD_UPDATE,
                  entity: {
                    id: record._id !== null ? record._id : 'null',
                    position: Cesium.Cartesian3.fromDegrees(checkedLocation.lon, checkedLocation.lat),
                    name: '',
                    scaleByDistance: new Cesium.NearFarScalar(1.5e2, this.scalefactor / 1.5, 1.0e4, this.scalefactor),
                    image: this.backendServerURL + '/uploads/' + record.ImageFileName,
                    label: {
                      text: '',
                      pixelOffset: new Cesium.Cartesian2(0, 130),
                      translucencyByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 8.0e6, 0.0),
                      font: '12px Helvetica' // Doesn't work...
                    }
                  }
                };
              } else {
                this.locationLabels.push(location.name);
                notif = {
                  id: record._id !== null ? record._id : 'null',
                  actionType: ActionType.ADD_UPDATE,
                  entity: {
                    id: record._id !== null ? record._id : 'null',
                    position: Cesium.Cartesian3.fromDegrees(checkedLocation.lon, checkedLocation.lat),
                    name: location.name,
                    scaleByDistance: new Cesium.NearFarScalar(1.5e2, this.scalefactor / 1.5, 1.0e4, this.scalefactor),
                    image: this.backendServerURL + '/uploads/' + record.ImageFileName,
                    label: {
                      text: location.name,
                      pixelOffset: new Cesium.Cartesian2(0, 130),
                      translucencyByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 8.0e6, 0.0),
                      font: '12px Helvetica' // Doesn't work...
                    }
                  }
                };
              }
              this.subscriber.next(notif);
            }
          }
        }
      }
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

  private processLocation(obj: any): ILocation|null {
    if (!this.isLocation(obj)) {
      return null;
    }
    const checkedLocation = obj as ILocation;

    // (Very) basic loop to avoid position conflicts
    for (let index = 0; index < this.selectedLocations.length; index++) {
      const alreadySelectedLocation = this.selectedLocations[index];
      const latDelta = checkedLocation.lat - alreadySelectedLocation.lat;
      const lonDelta = checkedLocation.lon - alreadySelectedLocation.lon;
      if ((Math.abs(latDelta) < 0.0005) && (Math.abs(lonDelta) < 0.0005)) {
          if (this.orientationIndex % 8 ===  0) {
            checkedLocation.lat += (Math.floor(this.orientationIndex / 8) + 1) * 0.002;
          }
          if (this.orientationIndex % 8 ===  1) {
            checkedLocation.lat += (Math.floor(this.orientationIndex / 8) + 1) * 0.002;
            checkedLocation.lon += (Math.floor(this.orientationIndex / 8) + 1) * 0.002;
          }
          if (this.orientationIndex % 8 ===  2) {
            checkedLocation.lon += (Math.floor(this.orientationIndex / 8) + 1) * 0.002;
          }
          if (this.orientationIndex % 8 ===  3) {
            checkedLocation.lat -= (Math.floor(this.orientationIndex / 8) + 1) * 0.002;
            checkedLocation.lon += (Math.floor(this.orientationIndex / 8) + 1) * 0.002;
          }
          if (this.orientationIndex % 8 ===  4) {
            checkedLocation.lat -= (Math.floor(this.orientationIndex / 8) + 1) * 0.002;
          }
          if (this.orientationIndex % 8 ===  5) {
            checkedLocation.lat -= (Math.floor(this.orientationIndex / 8) + 1) * 0.002;
            checkedLocation.lon -= (Math.floor(this.orientationIndex / 8) + 1) * 0.002;
          }
          if (this.orientationIndex % 8 ===  6) {
            checkedLocation.lon -= (Math.floor(this.orientationIndex / 8) + 1) * 0.002;
          }
          if (this.orientationIndex % 8 ===  7) {
            checkedLocation.lat += (Math.floor(this.orientationIndex / 8) + 1) * 0.002;
            checkedLocation.lon -= (Math.floor(this.orientationIndex / 8) + 1) * 0.002;
          }
          this.orientationIndex++;
      }
    }
    return checkedLocation;
  }

  private isLocation(obj: any): obj is ILocation {
    return typeof obj.lat === 'number' && typeof obj.lon === 'number';
  }
}
