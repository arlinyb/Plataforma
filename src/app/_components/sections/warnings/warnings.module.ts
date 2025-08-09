import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components 
import { WarningsComponent } from './warnings.component';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [WarningsComponent],
    exports: [WarningsComponent]

})
export class WarningsModule { }
