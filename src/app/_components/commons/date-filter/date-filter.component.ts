import { Component, OnInit, Input, Output, EventEmitter,ViewEncapsulation } from '@angular/core';
import { OwlDateTimeModule, OwlNativeDateTimeModule, OwlDateTimeIntl, OWL_DATE_TIME_FORMATS } from 'ng-pick-datetime';

//Javascript
import * as moment from 'moment'; // add this 1 of 4
import 'moment/locale/es';
import 'daterangepicker';


// DATE FORMAT  ************************************************

export const NewFormatDate = {
    fullPickerInput: { year: 'numeric', month: 'long', weekday: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true },
    datePickerInput: { year: 'numeric', month: 'numeric', day: 'numeric', hour12: true },
    timePickerInput: { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true },
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
};


// LABELS *******************************************************

export const DefaultIntl = {



    /** A label for the up second button (used by screen readers).  */
    upSecondLabel: 'Agregar un segundo',

    /** A label for the down second button (used by screen readers).  */
    downSecondLabel: 'Menos un segundo',

    /** A label for the up minute button (used by screen readers).  */
    upMinuteLabel: 'Agregar un minuto',

    /** A label for the down minute button (used by screen readers).  */
    downMinuteLabel: 'Menos un minuto',

    /** A label for the up hour button (used by screen readers).  */
    upHourLabel: 'Agregar una hora',

    /** A label for the down hour button (used by screen readers).  */
    downHourLabel: 'Menos una hora',

    /** A label for the previous month button (used by screen readers). */
    prevMonthLabel: 'Mes pasado',

    /** A label for the next month button (used by screen readers). */
    nextMonthLabel: 'Próximo mes',

    /** A label for the previous year button (used by screen readers). */
    prevYearLabel: 'Año pasado',

    /** A label for the next year button (used by screen readers). */
    nextYearLabel: 'Próximo Año',

    /** A label for the 'switch to month view' button (used by screen readers). */
    switchToMonthViewLabel: 'Cambiar a vista mensual',

    /** A label for the 'switch to year view' button (used by screen readers). */
    switchToYearViewLabel: 'Cambiar a vista anual',

    /** A label for the cancel button */
    cancelBtnLabel: 'Cerrar',

    /** A label for the set button */
    setBtnLabel: 'Confirmar',

    /** A label for the range 'from' in picker info */
    rangeFromLabel: 'Desde',

    /** A label for the range 'to' in picker info */
    rangeToLabel: 'Hasta',
};


@Component({
    selector: 'commons-date-filter',
    templateUrl: "./date-filter.component.html",
    styleUrls: ["./date-filter.component.css", "./../../../../assets/app/styles/picker.min.css"],
    encapsulation: ViewEncapsulation.None,
    providers: [
        { provide: OwlDateTimeIntl, useValue: DefaultIntl },
        { provide: OWL_DATE_TIME_FORMATS, useValue: NewFormatDate },
    ],
})
export class DateFilterComponent implements OnInit {

    public jsonQueryFilter: any;

    public selectedIntervalLabel: string;
    public selectedCustomDate: any;


    public startDateInterval: Date;
    public endDateInterval: Date;

    public dateData: any;



    constructor() {
        this.selectedIntervalLabel = "last1day";
    }

    ngOnInit() {
        moment.locale('es');
        let title = 'Ayer a Hoy:&nbsp;';
        let range = moment().subtract(1, 'day').startOf('day').format('MMM D') + ' - ' + moment().format('MMM D');
        $('#m_dashboard_daterangepicker').find('.m-subheader__daterange-title').html(title);
        $('#m_dashboard_daterangepicker').find('.m-subheader__daterange-date').html(range);

        this.startDateInterval = moment().subtract(1, 'day').startOf('day').toDate();
        this.endDateInterval = moment().toDate();

        this.selectedCustomDate = [this.startDateInterval, this.endDateInterval];
        
    }

    @Input()
    set localDatePickerData(dateData_: any) {
        if (dateData_ !== undefined) {
            this.jsonQueryFilter = dateData_["filterQuery"];
            this.dateData = dateData_["data"];


            let startDate = moment(this.dateData.gte);
            let endDate = moment(this.dateData.lte);

            let difEndTime = Math.abs(endDate.valueOf() - this.endDateInterval.getTime());
            let difStartTime = Math.abs(startDate.valueOf() - this.startDateInterval.getTime());

            if ((difEndTime > (10000)) && (difStartTime > (10000))) {

                this.selectedCustomDate = [startDate.toDate(), endDate.toDate()];
                this.dateTitleInterval(startDate, endDate, "custom", false);
            }



        }
    }


    @Output() updateQueryFilterEvent = new EventEmitter<any>();

    setDateInterval(interval: string) {
        this.selectedIntervalLabel = interval;
        switch (interval) {
            case 'today':
                this.dateTitleInterval(moment().startOf('day'), moment(), "today", true);
                break;
            case 'yesterday':
                this.dateTitleInterval(moment().subtract(1, 'day').startOf('day'), moment().subtract(1, 'day').endOf('day'), "yesterday", true);
                break;
            case 'last1day':
                this.dateTitleInterval(moment().subtract(1, 'day').startOf('day'), moment(), "last1day", true);
                break;
            case 'last7days':
                this.dateTitleInterval(moment().subtract(6, 'days').startOf('day'), moment(), "last7days", true);
                break;
            case 'last30days':

                this.dateTitleInterval(moment().subtract(29, 'days').startOf('day'), moment(), "last30days", true);
                break;
            case 'thismonth':
                this.dateTitleInterval(moment().startOf('month'), moment().endOf('month'), "thismonth", true);
                break;
            case 'lastmonth':
                this.dateTitleInterval(moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month'), "lastmonth", true);
                break;
            case 'last3months':
                this.dateTitleInterval(moment().subtract(3, 'month').startOf('month'), moment(), "last3months", true);
                break;
            case 'last6months':
                this.dateTitleInterval(moment().subtract(6, 'month').startOf('month'), moment(), "last6months", true);
                break;
            case 'last12months':
                this.dateTitleInterval(moment().subtract(12, 'month').startOf('month'), moment(), "last12months", true);
                break;
            default:
                break;
        }
    }


    setCustomDate() {
        this.dateTitleInterval(moment(this.selectedCustomDate[0]), moment(this.selectedCustomDate[1]), 'custom', true);

    }

    dateTitleInterval(start, end, label, updateOption) {

        this.startDateInterval = start.toDate();
        this.endDateInterval = end.toDate();
        let tempIntervalStr = this.selectIntervalStr(start, end);



        this.selectedCustomDate = [this.startDateInterval, this.endDateInterval]

        let picker = $('#m_dashboard_daterangepicker');
        let title = '';
        let range = '';
        let actualMoment: any;
        actualMoment = moment();

        if (((actualMoment - start) <= 86400000) && ((actualMoment.date() - start.date()) == 0)) {
            this.selectedIntervalLabel = "today";
            title = 'Hoy:&nbsp;';
            range = start.format('MMM D');
        } else if (((actualMoment - start) > 86400000) && ((actualMoment - start) < 2 * 86400000)) {
            this.selectedIntervalLabel = "last1day";
            title = 'Ayer a Hoy:&nbsp;';
            range = start.format('MMM D') + ' - ' + end.format('MMM D');
        } else if (((actualMoment - start) <= 2 * 86400000) && ((actualMoment.date() - start.date()) == 1)) {
            this.selectedIntervalLabel = "yesterday";
            title = 'Ayer:&nbsp;';
            range = start.format('MMM D');
        } else if (((end - start) < 86400000) && ((end.date() - start.date()) == 0)) {
            this.selectedIntervalLabel = "custom";
            range = start.format('MMM D');
        }
        else {
            if (label == 'custom') {
                this.selectedIntervalLabel = "custom";
            }
            else {
                this.selectedIntervalLabel = label;
            }
            range = start.format('MMM D') + ' - ' + end.format('MMM D');
        }

        picker.find('.m-subheader__daterange-date').html(range);
        picker.find('.m-subheader__daterange-title').html(title);

        if (updateOption) {
            //update Time Query
            this.updateIntervalDateFilter(this.startDateInterval.getTime(), this.endDateInterval.getTime(), tempIntervalStr)
        }

    }


    selectIntervalStr(start, end) {
        let tempIntervalStr = "";
        let intervalDifference = end - start;
        if (intervalDifference < 60 * 10 * 1000) {
            tempIntervalStr = "10s";
        } else if (intervalDifference < 3600 * 1000) {
            tempIntervalStr = "10m";
        } else if (intervalDifference < 3600 * 24 * 2 * 1000) {
            tempIntervalStr = "1h";
        } else if (intervalDifference < 3600 * 24 * 30.416 * 1000) {
            tempIntervalStr = "1d";
        } else if (intervalDifference < 3600 * 24 * 30.416 * 2 * 1000) {
            tempIntervalStr = "1d";
        } else if (intervalDifference < 3600 * 24 * 30.416 * 12 * 1000) {
            tempIntervalStr = "30d";
        } else {
            tempIntervalStr = "365d";
        }
        return tempIntervalStr;
    }


    /*UPDATE FILTER QUERY  ************************************************************/

    updateIntervalDateFilter(gteDate: Number, letDate: Number, intervalStr: string) {
   
        this.jsonQueryFilter.query.bool.must[0].range['@timestamp'].gte = gteDate;
        this.jsonQueryFilter.query.bool.must[0].range['@timestamp'].lte = letDate;
        
        this.jsonQueryFilter.aggs.timelineChart.date_histogram.fixed_interval = intervalStr;
        this.jsonQueryFilter.size = 50; //default 50 hits
        let componentInfo = { "id": "datePicker-component" };
        let queryFilter = { "filter": this.jsonQueryFilter, "info": componentInfo };
        this.updateQueryFilterEvent.emit(queryFilter);
    }



}
