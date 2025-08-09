import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule} from '@angular/forms';


//pipes
import { DateFilterComponent } from './date-filter.component';
import { OwlDateTimeModule, OwlNativeDateTimeModule, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';



@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        OwlDateTimeModule,
        OwlNativeDateTimeModule,
    ],
    declarations: [
        DateFilterComponent

    ],
    exports: [
        DateFilterComponent
    ], 
    providers: [
        { provide: OWL_DATE_TIME_LOCALE, useValue: 'es' },
    ]
})
export class DateFilterModule { } 
