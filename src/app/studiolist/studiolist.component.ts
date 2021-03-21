import { Component, OnDestroy} from '@angular/core';
import { Studio } from '../model/studio';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '../../environments/environment';
import { AppSharedStateService } from '../app.sharedstateservice';
import { Subscription } from 'rxjs';

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

}
