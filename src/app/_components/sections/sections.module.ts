import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


// Components 
import { SectionsComponent } from './sections.component';


// SubModules
import { ExplorationPostsModule } from './analytics/exploration-posts/exploration-posts.module';
import { ExplorationCommentsModule } from './analytics/exploration-comments/exploration-comments.module';
import { TrendsModule } from './analytics/trends/trends.module';

import { ConfigurationsModule } from './configurations/configurations.module';
import { HomeModule } from './/home/home.module';
import { ReportsModule } from './reports/reports.module';
import { WarningsModule } from './warnings/warnings.module';


import { SectionsRoutingModule } from './sections-routing.module';


import { AppRoutingModule } from './../../app-routing.module';

// LayoutModule 

import { LayoutModule } from '../layouts/layout.module';
import { ToastrModule } from 'ngx-toastr';
import { BlockUIModule } from 'ng-block-ui';
//import { DateFilterModule } from './../commons/date-filter/date-filter.module';





@NgModule({
    imports: [

        //Modules 
        ExplorationPostsModule,
        ExplorationCommentsModule,
        TrendsModule,
        ConfigurationsModule,
        ReportsModule,
        HomeModule,
        SectionsRoutingModule,
        WarningsModule,

        // External Modules
        LayoutModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BlockUIModule.forRoot(),
        ToastrModule.forRoot(),
        
   
          
        
    ],
    declarations: [
        SectionsComponent,




    ],
    exports: [SectionsComponent]

})
export class SectionsModule { }