import { Component, OnInit } from '@angular/core';
import { Helpers } from '../../../../../helpers';

declare let mLayout: any;
@Component({
    selector: 'app-aside-nav-configurations',
    templateUrl: './aside-nav-configurations.component.html',
    styleUrls: ["../../../../layouts/aside-nav/aside-nav.component.css"]
})
export class AsideNavConfigurationsComponent implements OnInit {

    constructor() { }

    ngOnInit() {
        mLayout.initAside();
    }

}
