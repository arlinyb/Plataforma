import { Component, OnInit } from '@angular/core';
import { Helpers } from '../../../../../helpers';

declare let mLayout: any;
@Component({
    selector: 'app-aside-nav-home',
    templateUrl: './aside-nav-home.component.html',
    styleUrls: ["../../../../layouts/aside-nav/aside-nav.component.css"]
})
export class AsideNavhomeComponent implements OnInit {

    constructor() { }

    ngOnInit() {
        mLayout.initAside();
    }


}
