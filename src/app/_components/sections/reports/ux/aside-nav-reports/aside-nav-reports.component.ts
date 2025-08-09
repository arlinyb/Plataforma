import { Component, OnInit } from '@angular/core';
import { Helpers } from '../../../../../helpers';

declare let mLayout: any;
@Component({
    selector: 'app-aside-nav-reports',
    templateUrl: './aside-nav-reports.component.html',
    styleUrls: ["../../../sections.component.css"]
})
export class AsideNavreportsComponent implements OnInit {

    constructor() { }

    ngOnInit() {
        mLayout.initAside();
    }

}
