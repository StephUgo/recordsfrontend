import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
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
  show = true;
  bigSize = false;
  records: Array<Record> = []; // The last searched records
  selectedRecords = new Array<Record>(); // The selected records
  recordMapObjects$: Observable<AcNotification> = new Observable((s: any) => this.subscriber = s);
  polylines$: Observable<AcNotification> = new Observable((s: any) => this.polylineSubscriber = s);
  private subscriber: Subscriber<AcNotification> | null = null;
  private polylineSubscriber: Subscriber<AcNotification> | null = null;
  private scalefactor = 0.5; // Currently we just have one computed scale factor
  private selectedLocations: Array<ILocation> = [];
  private locationLabels: Array<string> = [];
  private orientationIndex = 0;
  private coverDispatchingLevel = 1;
  private coverNotificationCounter = 0;

  constructor(private route: ActivatedRoute, private appStateService: AppSharedStateService) {
    this.appStateService.setRecords$.subscribe(
      records => {
        this.records = records;
      });
    this.records = this.appStateService.records.value;
    this.appStateService.setActiveForm$.subscribe(
      isFormActive => {
        this.bigSize = !isFormActive;
      });
    this.bigSize = !this.appStateService.activeForm.value;
    this.appStateService.setActiveSearchForm$.subscribe(
      isFormActive => {
        this.bigSize = !isFormActive;
      });
    this.bigSize = !this.appStateService.activeSearchForm.value;
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
          this.coverDispatchingLevel = 1;
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
            const stringLocation = keyword.substring(keyword.indexOf('{'));
            const location = JSON.parse(stringLocation);
            const originalLocation = (this.isLocation(location)) ? { lat: location.lat, lon: location.lon } : null;
            if (originalLocation !== null) {
              const finalLocation = this.processOriginalLocation(location);
              if (finalLocation !== null) {
                this.selectedLocations.push(finalLocation);
                this.sendNotifications(record, originalLocation, finalLocation, location.name);
              }
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

  private processOriginalLocation(obj: any): ILocation | null {
    if (!this.isLocation(obj)) {
      return null;
    }
    const checkedLocation = obj as ILocation;

    const sumOfElementsInCurrentLevel = 8 * this.coverDispatchingLevel * (this.coverDispatchingLevel + 1) / 2;

    if (this.orientationIndex >= sumOfElementsInCurrentLevel) {
      this.coverDispatchingLevel++;
    }

    const sumOfElementsInInferiorLevel = 8 * this.coverDispatchingLevel * (this.coverDispatchingLevel - 1) / 2;
    const indexInLevel = this.orientationIndex - sumOfElementsInInferiorLevel;

    // (Funny) loop to avoid position conflicts
    for (let index = 0; index < this.selectedLocations.length; index++) {
      const alreadySelectedLocation = this.selectedLocations[index];
      const latDelta = checkedLocation.lat - alreadySelectedLocation.lat;
      const lonDelta = checkedLocation.lon - alreadySelectedLocation.lon;
      if ((Math.abs(latDelta) < 0.0005) && (Math.abs(lonDelta) < 0.0005)) {

        // Il faut savoir sur quels cotés du carré (à 8n éléments ou n == coverDispatchingLevel) on se situe :
        //    haut : indexInLevel (>7n ou < n)
        //    droite : indexInLevel (>n ou < 3n)
        //    bas : indexInLevel (>3n ou < 5n)
        //    gauche : indexInLevel (>5n ou < 7n)
        if ((indexInLevel <= this.coverDispatchingLevel) || (indexInLevel > 7 * this.coverDispatchingLevel)) {
          this.updatePositionInUpperSide(indexInLevel, checkedLocation);
        } else if ((indexInLevel > this.coverDispatchingLevel) && (indexInLevel <= 3 * this.coverDispatchingLevel)) {
            this.updatePositionInRightSide(indexInLevel, checkedLocation);
        } else if ((indexInLevel > 3 * this.coverDispatchingLevel) && (indexInLevel <= 5 * this.coverDispatchingLevel)) {
          this.updatePositionInLowerSide(indexInLevel, checkedLocation);
        } else if ((indexInLevel > 5 * this.coverDispatchingLevel) && (indexInLevel <= 7 * this.coverDispatchingLevel)) {
          this.updatePositionInLeftSide(indexInLevel, checkedLocation);
        }
        this.orientationIndex++;
      }
    }
    return checkedLocation;
  }

  private updatePositionInUpperSide(indexInLevel: number, checkedLocation: ILocation) {
    checkedLocation.lat += this.coverDispatchingLevel * 0.002;

    if (indexInLevel <= this.coverDispatchingLevel) {
      checkedLocation.lon += indexInLevel * 0.002;
    } else {
      checkedLocation.lon -= (8 * this.coverDispatchingLevel - indexInLevel) * 0.002;
    }
  }

  private updatePositionInRightSide(indexInLevel: number, checkedLocation: ILocation) {
    checkedLocation.lon += this.coverDispatchingLevel * 0.002;

    if (indexInLevel < 2 * this.coverDispatchingLevel) {
      checkedLocation.lat += (2 * this.coverDispatchingLevel - indexInLevel) * 0.002;
    } else {
      checkedLocation.lat -= (indexInLevel - 2 * this.coverDispatchingLevel) * 0.002;
    }
  }

  private updatePositionInLowerSide(indexInLevel: number, checkedLocation: ILocation) {
    checkedLocation.lat -= this.coverDispatchingLevel * 0.002;

    if (indexInLevel <= 4 * this.coverDispatchingLevel) {
      checkedLocation.lon += (4 * this.coverDispatchingLevel - indexInLevel) * 0.002;
    } else {
      checkedLocation.lon -= (indexInLevel - 4 * this.coverDispatchingLevel) * 0.002;
    }
  }

  private updatePositionInLeftSide(indexInLevel: number, checkedLocation: ILocation) {
    checkedLocation.lon -= this.coverDispatchingLevel * 0.002;

    if (indexInLevel < 6 * this.coverDispatchingLevel) {
      checkedLocation.lat -= (6 * this.coverDispatchingLevel - indexInLevel) * 0.002;
    } else {
      checkedLocation.lat += (indexInLevel - 6 * this.coverDispatchingLevel) * 0.002;
    }
  }

  private isLocation(obj: any): obj is ILocation {
    return typeof obj.lat === 'number' && typeof obj.lon === 'number';
  }

  private sendNotifications(record: Record, originalLocation: ILocation, finalLocation: ILocation, name: string) {
    let notif: AcNotification;
    const notificationID = (this.coverNotificationCounter++).toString();
    if (this.locationLabels.includes(name)) {
      notif = {
        id: notificationID,
        actionType: ActionType.ADD_UPDATE,
        entity: {
          id: record._id !== null ? record._id : 'null',
          position: Cesium.Cartesian3.fromDegrees(finalLocation.lon, finalLocation.lat),
          name: '',
          scaleByDistance: new Cesium.NearFarScalar(1.5e2, this.scalefactor / 1.5, 1.0e4, this.scalefactor),
          image: this.backendServerURL + '/uploads/' + record.ImageFileName,
          label: {
            text: '',
            pixelOffset: new Cesium.Cartesian2(0, 130),
            translucencyByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 8.0e6, 0.0),
            font: '20px Helvetica'
          }
        }
      };
    } else {
      this.locationLabels.push(name);
      notif = {
        id: notificationID,
        actionType: ActionType.ADD_UPDATE,
        entity: {
          id: record._id !== null ? record._id : 'null',
          position: Cesium.Cartesian3.fromDegrees(finalLocation.lon, finalLocation.lat),
          name: name,
          scaleByDistance: new Cesium.NearFarScalar(1.5e2, this.scalefactor / 1.5, 1.0e4, this.scalefactor),
          image: this.backendServerURL + '/uploads/' + record.ImageFileName,
          label: {
            text: name,
            pixelOffset: new Cesium.Cartesian2(0, 130),
            translucencyByDistance: new Cesium.NearFarScalar(5e2, 1.0, 8.0e6, 0.0),
            font: '20px Helvetica'
          }
        }
      };
    }
    if (this.subscriber !== null) {
      this.subscriber.next(notif);
      if (finalLocation.lat !== originalLocation.lat || finalLocation.lon !== originalLocation.lon) {
        let lineNotif: AcNotification;
        lineNotif = {
          id: record._id !== null ? record._id : 'null',
          actionType: ActionType.ADD_UPDATE,
          entity: {
            id: record._id !== null ? record._id : 'null',
            material: Cesium.Color.RED.withAlpha(0.5),
            positions: Cesium.Cartesian3.fromDegreesArray([originalLocation.lon, originalLocation.lat,
            finalLocation.lon, finalLocation.lat])
          }
        };
        if (this.polylineSubscriber !== null) {
          this.polylineSubscriber.next(lineNotif);
        }
      }
    }
  }
}
