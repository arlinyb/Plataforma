import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule,ReactiveFormsModule  } from '@angular/forms';

//ux
import { AsideNavTrendsComponent } from './ux/aside-nav-trends/aside-nav-trends.component';


//Component 
import { TrendsComponent } from './trends.component';

// Subcomponent
import { ListCommentsComponent } from './_subcomponents/list-comments/list-comments.component';
import { ChartsComponent } from './_subcomponents/charts/charts.component';

// Commons
import { DateFilterModule } from './../../../commons/date-filter/date-filter.module';
import { GraphFilterModule } from './../../../commons/xpack/graph-filter/graph-filter.module';


//Service 
import { CommentsService } from '../../../../_services/query-services/comments.service';
//Pipes
import { ShortNumberModule } from '../../../../_pipes/short-number/short-number.module';
import { TimeAgoTimestampModule } from '../../../../_pipes/time-ago-timestamp/time-ago-timestamp.module';

//Modules
import { TagInputModule } from 'ngx-chips';
import { OrderModule } from 'ngx-order-pipe';
import { NgHighlightModule } from 'ngx-text-highlight';
import { NgSelectModule } from '@ng-select/ng-select';
import { FacebookModule } from 'ngx-facebook';


import { BlockUiPorletModule } from '../../../commons/block-ui/block-ui.module';

const routes: Routes = [
    {
        "path": "",
        "component": TrendsComponent,
        "children": [
            {
                "path": "configurations",
                "component": TrendsComponent
            }
        ]
    }
];



@NgModule({
    imports: [
        NgbModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes),

        //Modules
        TagInputModule,
        OrderModule,
        NgHighlightModule,
        ShortNumberModule,
        TimeAgoTimestampModule,
        NgSelectModule,
        FacebookModule.forRoot(),

        //common
        DateFilterModule,
        GraphFilterModule,
        BlockUiPorletModule
    ],
    declarations: [
        AsideNavTrendsComponent,
        TrendsComponent,
        ListCommentsComponent,
        ChartsComponent

    ],
    exports: [
        TrendsComponent,
        RouterModule
    ],
    providers: [
        CommentsService,
    ],
})
export class TrendsModule { }
