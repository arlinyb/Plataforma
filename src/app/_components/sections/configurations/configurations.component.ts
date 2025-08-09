import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { Helpers } from '../../../helpers';
import { ScriptLoaderService } from '../../../_services/script-loader.service';



@Component({
    selector: 'app-configurations',
    templateUrl: './configurations.component.html',
    styleUrls: ["../sections.component.css"]

})
export class ConfigurationsComponent implements OnInit {

    constructor() { }

    ngOnInit() {

    }

}
