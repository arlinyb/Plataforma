import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { CommonModule } from '@angular/common';
import {FormsModule} from '@angular/forms';


import { ModalPreviewComponent } from './modal-preview.component';

import { FacebookModule } from 'ngx-facebook';
import { EmbedVideo } from 'ngx-embed-video';

//Pipes
import { ShortNumberModule } from '../../../_pipes/short-number/short-number.module';
import { TimeAgoTimestampModule } from '../../../_pipes/time-ago-timestamp/time-ago-timestamp.module';


import { BlockUiPorletModule } from '../../commons/block-ui/block-ui.module';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        ShortNumberModule,
        TimeAgoTimestampModule,
        NgbModule,
        BlockUiPorletModule,
        FacebookModule.forRoot(),
        EmbedVideo.forRoot()
    ],
    declarations: [
        ModalPreviewComponent

    ],
    exports: [
        ModalPreviewComponent
    ]
})
export class ModalPreviewModule { } 
