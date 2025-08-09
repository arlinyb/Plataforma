import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

//ux


//Component 
import { ReportsComponent } from './reports.component';

import { AsideNavreportsComponent } from './ux/aside-nav-reports/aside-nav-reports.component';

//routing



//import { LayoutModule } from '../../theme/layouts/layout.module';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {
        "path": "",
        "component": ReportsComponent,
        "children": [
            {
                "path": "",
                "component": ReportsComponent
            }
        ]
    }
];



@NgModule({
    imports: [
        CommonModule,

        RouterModule.forChild(routes),// LayoutModule
    ],
    declarations: [
        ReportsComponent,

        AsideNavreportsComponent],
    exports: [
        RouterModule,
        ReportsComponent
    ],
})
export class ReportsModule { }
