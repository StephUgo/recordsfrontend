import { Component, OnInit } from '@angular/core';
import { CesiumService } from '../cesium.service';

@Component({
    selector: 'app-mapcomponent',
    standalone: true,
    imports: [],
    templateUrl: './mapcomponent.component.html',
    styleUrl: './mapcomponent.component.css'
})
export class MapComponent implements OnInit {
    constructor(private cesium: CesiumService) { } ngOnInit(): void {
        this.cesium.plotPoints('cesium');
    }
}
