import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule} from '@angular/forms';


//components
import { ChartsTimelineComponent } from './timeline.component';
import { BlockUiPorletModule } from '../../../commons/block-ui/block-ui.module';



@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        BlockUiPorletModule

    ],
    declarations: [
        ChartsTimelineComponent
    ],
    exports: [
        ChartsTimelineComponent
    ], 
    providers: [
    ]
})
export class ChartsTimelineModule { } 
