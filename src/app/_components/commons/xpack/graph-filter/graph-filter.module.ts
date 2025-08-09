import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule} from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


//pipes
import { GraphFilterComponent } from './graph-filter.component';
import { ShortNumberModule } from '../../../../_pipes/short-number/short-number.module';

//modules
import { OwlModule } from 'ngx-owl-carousel';
import { BlockUiPorletModule } from '../../../commons/block-ui/block-ui.module';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        OwlModule,
        BlockUiPorletModule,

        //pipes
        ShortNumberModule

    ],
    declarations: [
        GraphFilterComponent

    ],
    exports: [
        GraphFilterComponent
    ]
})
export class GraphFilterModule { } 
