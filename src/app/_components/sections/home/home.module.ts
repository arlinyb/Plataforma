import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

import { HomeComponent } from './home.component';

import { AsideNavhomeComponent } from './ux/aside-nav-home/aside-nav-home.component';


import { Routes, RouterModule } from '@angular/router';



// Vendor
import { OwlModule } from 'ngx-owl-carousel';

//pipes
import { ShortNumberModule } from '../../../_pipes/short-number/short-number.module';

import { GroupByPipe } from '../../../_pipes/group-by.pipe';

import { FacebookModule } from 'ngx-facebook';
import { BlockUiPorletModule } from '../../commons/block-ui/block-ui.module';

const routes: Routes = [
    {
        "path": "",
        "component": HomeComponent,
        "children": [
            {
                "path": "",
                "component": HomeComponent
            }
        ]
    }
];


@NgModule({
    imports: [
        CommonModule,
        NgbModule,
        OwlModule,
        ShortNumberModule,
        RouterModule.forChild(routes),
        FacebookModule.forRoot(),
        BlockUiPorletModule
    ],
    declarations: [
        HomeComponent,
        GroupByPipe,
        AsideNavhomeComponent
    ],
    exports: [
        HomeComponent,
        RouterModule
    ]
})
export class HomeModule { } 
