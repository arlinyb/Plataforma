import { NgModule } from '@angular/core';



//pipes
import { ShortNumberPipe } from './short-number.pipe';



@NgModule({
    imports: [
        
    ],
    declarations: [
        ShortNumberPipe

    ],
    exports: [
        ShortNumberPipe
    ]
})
export class ShortNumberModule { } 
