import { Component, OnDestroy } from '@angular/core';
import { Studio } from '../model/studio';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '../../environments/environment';
import { AppSharedStateService } from '../app.sharedstateservice';
import { Subscription } from 'rxjs';
import { ApiService } from '../../api.service';
import { StudioDialogModalComponent } from '../studio-dialog-modal/studio-dialog-modal.component';

@Component({
  selector: 'app-studiolist',
  templateUrl: './studiolist.component.html',
  styleUrls: ['./studiolist.component.css']
})
export class StudiolistComponent implements OnDestroy {

  studios: Array<Studio> | null = null; // The studios to display
  subscription: Subscription; // Subscription used to get all the previous fields from the AppSharedStateService observables.

  backendServerURL = environment.backendURL + ':' + environment.backendPort;

  // Sorting attributes
  key = 'name';
  reverse = false;

  constructor(public dialog: MatDialog,
    private api: ApiService,
    private appStateService: AppSharedStateService) {
    this.subscription = this.appStateService.setStudios$.subscribe(
      studios => {
        this.studios = studios;
      });
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.subscription.unsubscribe();
  }


  /**
   * Handler for column sorting.
   * @param key column name
   */
  onClickSort(key: string) {
    this.key = key;
    this.reverse = !this.reverse;
    if (this.studios !== null) {
      if (this.reverse) {
        this.studios.sort((a, b) => (a.name > b.name ? -1 : 1));
      } else {
        this.studios.sort((a, b) => (a.name > b.name ? 1 : -1));
      }
    }
  }

  /**
   * Update the sort options pair (key + reverse boolean) given the sort options Id
   * @param sortId SorttID
   */
  updateSortOptionsFromSortId(sortId: number) {
    switch (sortId) {
      case 1: {
        this.key = 'name';
        this.reverse = false;
        break;
      }
      case 2: {
        this.key = 'name';
        this.reverse = true;
        break;
      }
    }
  }

  getJSONString(studio: Studio): string {
    return JSON.stringify(studio);
  }

  /**
   * Handler for studio update.
   * @param event DOM event (mouse click event in this case)
   * @param i studio index in the list
   */
  onClickUpdateStudio(event: any, i: number) {
    if (this.studios !== null) {
      // alert('Update studio named : ' + this.studios[i].name);
      if ((this.studios !== null) && (i >= 0) && (i < this.studios.length)) {
        const dialogRef = this.dialog.open(StudioDialogModalComponent, {
          width: '400px',
          height: '600px',
          backdropClass: 'custom-dialog-backdrop-class',
          panelClass: 'custom-dialog-panel-class',
          disableClose: true,
          autoFocus: true,
          data: { selectedStudio: this.studios[i] }
        });

        dialogRef.afterClosed().subscribe(result => {
          console.log('The edit dialog was closed', result);
          // If the dialog send a result (i.e. a studio) we post it to the backend
          if ((this.api !== null) && (typeof result !== typeof undefined) && (this.studios !== null)) {
            this.studios[i] = result;
            console.log(this.studios[i]);
            if (this.studios[i] === null) {
              var errMsg = "Can't update studio with null ID!";
              console.log(errMsg);
              alert(errMsg);
              return;
            }
            if ((this.api !== null) && (this.studios !== null) && (this.studios[i] !== null)) {
              this.api.updateStudio(this.studios[i]).subscribe(saveRes => {
                console.log(saveRes);
                this.api.searchStudios('').subscribe(res => {
                  console.log(res);

                  if (res.studios != null) {
                    this.studios = res.studios;
                  } else {
                    this.studios = res;
                  }
                }, err => {
                  console.log(err);
                });
              }, err => {
                console.log(err);
                alert('Error when updating studio: ' + err);
              });
            }
          }
        });
      }
    } else {
      alert('Studios list not set yet...');
    }
  }
}
