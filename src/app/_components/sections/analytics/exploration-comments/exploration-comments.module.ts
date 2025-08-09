import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule,ReactiveFormsModule  } from '@angular/forms';

//ux
import { AsideNavExplorationCommentsComponent } from './ux/aside-nav-exploration-comments/aside-nav-exploration-comments.component';


//Component 
import { ExplorationCommentsComponent } from './exploration-comments.component';

// Subcomponent
import { ListCommentsComponent } from './_subcomponents/list-comments/list-comments.component';

// Commons
import { DateFilterModule } from '../../../commons/date-filter/date-filter.module';
import { GraphFilterModule } from '../../../commons/xpack/graph-filter/graph-filter.module';
/* Charts */
import { ChartsTimelineModule } from '../../../../_components/commons/charts/timeline/timeline.module';

//Service 
import { CommentsService } from '../../../../_services/query-services/comments.service';
import { ElasticService } from '../../../../_services/query-services/elastic.service';

//Pipes
import { ShortNumberModule } from '../../../../_pipes/short-number/short-number.module';
import { TimeAgoTimestampModule } from '../../../../_pipes/time-ago-timestamp/time-ago-timestamp.module';

//Modules
import { TagInputModule } from 'ngx-chips';
import { OrderModule } from 'ngx-order-pipe';
import { NgHighlightModule } from 'ngx-text-highlight';
import { NgSelectModule } from '@ng-select/ng-select';
import { FacebookModule } from 'ngx-facebook';

import { IonRangeSliderModule } from "ng2-ion-range-slider";


import { BlockUiPorletModule } from '../../../commons/block-ui/block-ui.module';

const routes: Routes = [
    {
        "path": "",
        "component": ExplorationCommentsComponent,
        "children": [
            {
                "path": "configurations",
                "component": ExplorationCommentsComponent
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
        IonRangeSliderModule,
        FacebookModule.forRoot(),

        //common
        DateFilterModule,
        GraphFilterModule,
        ChartsTimelineModule,
        BlockUiPorletModule
    ],
    declarations: [
        AsideNavExplorationCommentsComponent,
        ExplorationCommentsComponent,
        ListCommentsComponent,

    ],
    exports: [
        ExplorationCommentsComponent,
        RouterModule
    ],
    providers: [
        CommentsService,
        ElasticService
    ],
})
export class ExplorationCommentsModule { }
