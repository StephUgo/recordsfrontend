import { ILocation, CesiumService } from '../cesium.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AppSharedStateService } from '../app.sharedstateservice';
import { Record } from '../model/record';
import { environment } from '../../environments/environment';

interface IConflictedLocation {
    conflictedLocation: ILocation;
    coverDispatchingLevel: number;
    orientationIndex: number;
}

@Component({
    selector: 'app-mapcomponent',
    templateUrl: './mapcomponent.component.html',
    styleUrl: './mapcomponent.component.css'
})
export class MapComponent implements OnInit, OnDestroy {

    backendServerURL = environment.backendURL + ':' + environment.backendPort;
    show = true;
    bigSize = false;

    // Data (i.e. records)
    records: Array<Record> = []; // The last searched records
    selectedRecords = new Array<Record>(); // The selected records

    // Map objects & subscribers
    private scalefactors: { [id: string]: number } = {};
    private locationLabels: Array<string> = [];

    // Deconflictions data
    private finalSelectedLocations: Array<ILocation> = [];
    private originalSelectedLocations: Array<ILocation> = [];
    private conflicts: { [id: string]: IConflictedLocation } = {};

    // Subscriptions
    private recordSubscription: Subscription | null = null;
    private routeSubscription: Subscription | null = null;

    constructor(private cesium: CesiumService, private route: ActivatedRoute, private appStateService: AppSharedStateService,) { }

    ngOnInit() {
        // Subscriptions to useful observables

        // Current records
        this.recordSubscription  = this.appStateService.setRecords$.subscribe(
            records => {
                this.records = records;
            });
        this.records = this.appStateService.records.value;
        // Forms activation
        this.appStateService.setActiveForm$.subscribe(
            isFormActive => {
                this.bigSize = !isFormActive;
            });
        this.appStateService.setActiveSearchForm$.subscribe(
            isFormActive => {
                this.bigSize = !isFormActive;
            });
        this.appStateService.setActiveUploadForm$.subscribe(
            isFormActive => {
                this.bigSize = !isFormActive;
            });
        this.appStateService.setActiveStudioForm$.subscribe(
            isFormActive => {
                this.bigSize = !isFormActive;
            });
        // Size computation depending on activated forms
        this.bigSize = (!this.appStateService.activeUploadForm.value && !this.appStateService.activeForm.value &&
            !this.appStateService.activeSearchForm.value && !this.appStateService.activeStudioForm.value ) ? true : false;

        // Router subscription
        this.routeSubscription = this.route.paramMap.subscribe(params => {
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
                    this.processSelectedRecords();
                }
            }
        });

        // Ask Cesium service to initialize the viewer
        this.cesium.initViewer('cesium');
    }

    ngOnDestroy() {
        // Ask Cesium service to reset the viewer
        this.cesium.resetViewer();
        // Unsubscribe from observables
        if (this.recordSubscription !== null) {
            this.recordSubscription.unsubscribe();
        }
        if (this.routeSubscription !== null) {
            this.routeSubscription.unsubscribe();
        }
        this.appStateService.setActiveForm$.subscribe();
        this.appStateService.setActiveSearchForm$.subscribe();
        this.appStateService.setActiveUploadForm$.subscribe();
        this.appStateService.setActiveStudioForm$.subscribe();
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
                            if (image.width !== 0 && foundRecord.ImageFileName !== undefined) {
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
        let locationIndex = 0;
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
                                // Updates the original location to the final one so as to deconflict the display
                                const finalLocation = this.deconflictLocation(originalLocation, conflictedLocation);
                                if (finalLocation !== null) {
                                    this.finalSelectedLocations.push(finalLocation);
                                    this.cesium.displayRecord(record, conflictedLocation, finalLocation,'', locationIndex);
                                    // Ensure that the final and the conflicted locations are different
                                    // in order to display a line between them
                                    if (finalLocation.lat !== conflictedLocation.lat || finalLocation.lon !== conflictedLocation.lon) {
                                        this.cesium.displayLine(record, conflictedLocation, finalLocation);
                                    }
                                }
                            } else {
                                this.finalSelectedLocations.push(originalLocation);
                                this.locationLabels.push(location.name);
                                this.cesium.displayRecord(record, originalLocation, originalLocation, location.name, locationIndex);

                            }
                            this.originalSelectedLocations.push(originalLocation);
                            locationIndex++;
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

}
