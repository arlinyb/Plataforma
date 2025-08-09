import { NgModule } from '@angular/core';



//pipes
import { TimeAgoTimestampPipe } from './time-ago-timestamp.pipe';



@NgModule({
    imports: [
        
    ],
    declarations: [
        TimeAgoTimestampPipe

    ],
    exports: [
        TimeAgoTimestampPipe
    ]
})
export class TimeAgoTimestampModule { } 
