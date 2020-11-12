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

interface IConflictedLocation {
  conflictedLocation: ILocation;
  coverDispatchingLevel: number;
  orientationIndex: number;
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
  private scalefactors: { [id: string]: number; } = {};
  private finalSelectedLocations: Array<ILocation> = [];
  private originalSelectedLocations: Array<ILocation> = [];
  private locationLabels: Array<string> = [];
  private coverNotificationCounter = 0;
  private conflicts: { [id: string]: IConflictedLocation; } = {};

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
    this.appStateService.setActiveUploadForm$.subscribe(
      isFormActive => {
        this.bigSize = !isFormActive;
      });
    this.bigSize = !this.appStateService.activeUploadForm.value;
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
          this.finalSelectedLocations = [];
          this.originalSelectedLocations = [];
          this.locationLabels = [];
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
              if (image.width !== 0 && foundRecord.ImageFileName  !== undefined) {
                this.scalefactors[foundRecord.ImageFileName] = 200 / image.width;
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
              const conflictedLocation = this.getConflictedLocation(originalLocation);
              if (conflictedLocation !== null) {
                const finalLocation = this.deconflictLocation(originalLocation, conflictedLocation);
                if (finalLocation !== null) {
                  this.finalSelectedLocations.push(finalLocation);
                  this.sendNotifications(record, conflictedLocation, finalLocation, location.name);
                }
              } else {
                this.finalSelectedLocations.push(originalLocation);
                this.sendNotifications(record, originalLocation, originalLocation, location.name);
              }
              this.originalSelectedLocations.push(originalLocation);
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

  private deconflictLocation(checkedLocation: ILocation, conflictedLocation: ILocation): ILocation | null {

    let conflict = this.conflicts[JSON.stringify(conflictedLocation)];

    if (conflict === null || conflict === undefined) {
      conflict = {
        conflictedLocation: conflictedLocation,
        coverDispatchingLevel: 1,
        orientationIndex: 0
      };
      this.conflicts[JSON.stringify(conflictedLocation)] = conflict;
    }

    const sumOfElementsInCurrentLevel = 8 * conflict.coverDispatchingLevel * (conflict.coverDispatchingLevel + 1) / 2;

    if (conflict.orientationIndex >= sumOfElementsInCurrentLevel) {
      conflict.coverDispatchingLevel++;
    }

    const sumOfElementsInInferiorLevel = 8 * conflict.coverDispatchingLevel * (conflict.coverDispatchingLevel - 1) / 2;
    const indexInLevel = conflict.orientationIndex - sumOfElementsInInferiorLevel;

    // Il faut savoir sur quels cotés du carré (à 8n éléments ou n == coverDispatchingLevel) on se situe :
    //    haut : indexInLevel (>7n ou < n)
    //    droite : indexInLevel (>n ou < 3n)
    //    bas : indexInLevel (>3n ou < 5n)
    //    gauche : indexInLevel (>5n ou < 7n)
    if ((indexInLevel <= conflict.coverDispatchingLevel) || (indexInLevel > 7 * conflict.coverDispatchingLevel)) {
      this.updatePositionInUpperSide(indexInLevel, checkedLocation, conflict);
    } else if ((indexInLevel > conflict.coverDispatchingLevel) && (indexInLevel <= 3 * conflict.coverDispatchingLevel)) {
      this.updatePositionInRightSide(indexInLevel, checkedLocation, conflict);
    } else if ((indexInLevel > 3 * conflict.coverDispatchingLevel) && (indexInLevel <= 5 * conflict.coverDispatchingLevel)) {
      this.updatePositionInLowerSide(indexInLevel, checkedLocation, conflict);
    } else if ((indexInLevel > 5 * conflict.coverDispatchingLevel) && (indexInLevel <= 7 * conflict.coverDispatchingLevel)) {
      this.updatePositionInLeftSide(indexInLevel, checkedLocation, conflict);
    }
    conflict.orientationIndex++;

    return checkedLocation;
  }


  private getConflictedLocation(obj: any): ILocation | null {
    if (!this.isLocation(obj)) {
      return null;
    }
    const checkedLocation = obj as ILocation;

    for (let index = 0; index < this.originalSelectedLocations.length; index++) {
      const originalLocation = this.originalSelectedLocations[index];
      const latDelta = checkedLocation.lat - originalLocation.lat;
      const lonDelta = checkedLocation.lon - originalLocation.lon;
      if ((Math.abs(latDelta) < 0.0005) && (Math.abs(lonDelta) < 0.0005)) {
        return originalLocation;
      }
    }
    return null;
  }

  private updatePositionInUpperSide(indexInLevel: number, checkedLocation: ILocation, conflict: IConflictedLocation) {
    checkedLocation.lat += conflict.coverDispatchingLevel * 0.002;

    if (indexInLevel <= conflict.coverDispatchingLevel) {
      checkedLocation.lon += indexInLevel * 0.002;
    } else {
      checkedLocation.lon -= (8 * conflict.coverDispatchingLevel - indexInLevel) * 0.002;
    }
  }

  private updatePositionInRightSide(indexInLevel: number, checkedLocation: ILocation, conflict: IConflictedLocation) {
    checkedLocation.lon += conflict.coverDispatchingLevel * 0.002;

    if (indexInLevel < 2 * conflict.coverDispatchingLevel) {
      checkedLocation.lat += (2 * conflict.coverDispatchingLevel - indexInLevel) * 0.002;
    } else {
      checkedLocation.lat -= (indexInLevel - 2 * conflict.coverDispatchingLevel) * 0.002;
    }
  }

  private updatePositionInLowerSide(indexInLevel: number, checkedLocation: ILocation, conflict: IConflictedLocation) {
    checkedLocation.lat -= conflict.coverDispatchingLevel * 0.002;

    if (indexInLevel <= 4 * conflict.coverDispatchingLevel) {
      checkedLocation.lon += (4 * conflict.coverDispatchingLevel - indexInLevel) * 0.002;
    } else {
      checkedLocation.lon -= (indexInLevel - 4 * conflict.coverDispatchingLevel) * 0.002;
    }
  }

  private updatePositionInLeftSide(indexInLevel: number, checkedLocation: ILocation, conflict: IConflictedLocation) {
    checkedLocation.lon -= conflict.coverDispatchingLevel * 0.002;

    if (indexInLevel < 6 * conflict.coverDispatchingLevel) {
      checkedLocation.lat -= (6 * conflict.coverDispatchingLevel - indexInLevel) * 0.002;
    } else {
      checkedLocation.lat += (indexInLevel - 6 * conflict.coverDispatchingLevel) * 0.002;
    }
  }

  private isLocation(obj: any): obj is ILocation {
    return typeof obj.lat === 'number' && typeof obj.lon === 'number';
  }

  private sendNotifications(record: Record, originalLocation: ILocation, finalLocation: ILocation, name: string) {
    let notif: AcNotification;
    const notificationID = (this.coverNotificationCounter++).toString();
    const scalefactor = (record.ImageFileName !== undefined && this.scalefactors[record.ImageFileName] !== undefined) ?
      this.scalefactors[record.ImageFileName] : 0.5;
    if (this.locationLabels.includes(name)) {
      notif = {
        id: notificationID,
        actionType: ActionType.ADD_UPDATE,
        entity: {
          id: record._id !== null ? record._id : 'null',
          position: Cesium.Cartesian3.fromDegrees(finalLocation.lon, finalLocation.lat),
          name: '',
          scaleByDistance: new Cesium.NearFarScalar(4e2, scalefactor * 1.3 , 1.0e4, scalefactor / 1.2),
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
          scaleByDistance: new Cesium.NearFarScalar(4e2, scalefactor * 1.3, 1.0e4, scalefactor / 1.2),
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
