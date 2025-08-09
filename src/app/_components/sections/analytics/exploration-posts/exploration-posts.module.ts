import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule,ReactiveFormsModule  } from '@angular/forms';

//ux
import { AsideNavExplorationPostsComponent } from './ux/aside-nav-exploration-posts/aside-nav-exploration-posts.component';


//Component 
import { ExplorationPostsComponent } from './exploration-posts.component';

// Subcomponent
import { ListPostComponent } from './_subcomponents/list-posts/list-post.component';

// Commons
import { DateFilterModule } from './../../../commons/date-filter/date-filter.module';
import { ModalPreviewModule} from '../../../../_components/commons/modal-preview/modal-preview.module';
import { GraphFilterModule } from '../../../commons/xpack/graph-filter/graph-filter.module';

/* Charts */
import { ChartsTimelineModule } from '../../../../_components/commons/charts/timeline/timeline.module';


//Service 
import { PostsService } from '../../../../_services/query-services/posts.service';
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
        "component": ExplorationPostsComponent,
        "children": [
            {
                "path": "configurations",
                "component": ExplorationPostsComponent
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
        ModalPreviewModule,
        ChartsTimelineModule,
        BlockUiPorletModule
    ],
    declarations: [
        AsideNavExplorationPostsComponent,
        ExplorationPostsComponent,
        ListPostComponent
        ],
    exports: [
        ExplorationPostsComponent,
        RouterModule
    ],
    providers: [
        PostsService,
        CommentsService,
        ElasticService
    ],
})
export class ExplorationPostsModule { }
