import { Component, OnInit, ViewChild, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';

import 'anychart';
import 'anychart/dist/locales/es-es';




@Component({
    selector: 'app-charts',
    templateUrl: "./charts.component.html",
    styleUrls: ["./charts.component.css"],
    host: {
        '(window:resize)': 'verifWidth()'
     }
})
export class ChartsComponent implements OnInit, AfterViewInit {

    public dataChart: any;
    public chartElement: anychart.charts.Cartesian = null;

    public jsonQueryFilter: any;

    public totalMentions: number;

    public dateArray: Array<any>;

    public lastFormatLabelHover: string;
    public lastDateOptions: any;

    public noData:boolean;
    public chartSectionBlock:boolean;


    //Control
    private undoActivated: boolean;
    private lastGTE;
    private lastLTE;

    constructor() {
        this.totalMentions = 0;
        this.dateArray = [];
        this.dataChart = [];
        this.noData = false;
        this.lastFormatLabelHover = "";
        this.lastDateOptions = {};

        this.undoActivated = false;

        this.lastGTE = 0;
        this.lastLTE = 0;

        this.chartSectionBlock = true;

    }





    // definicion
    @ViewChild('chartContainer') container;




    @Input()
    set localChartData(chartData_: any) {

        if (chartData_ != undefined) {



            this.jsonQueryFilter = chartData_["filterQuery"];



            this.totalMentions = this.totalMentionsCalc(chartData_["data"]);

            this.dataChart = this.changeKeyJSON(chartData_["data"]);
            this.chartElement.removeAllSeries();
           // this.chartElement.normal().fill("#FF0000", 0.2);
            let series = this.chartElement.column(this.dataChart);
            this.chartElement.interactivity().hoverMode("single");
            
            // Serie Color 
            series.normal().stroke("#ec8264",0.7);
            series.normal().fill("#eda374",1);
            series.hovered().fill("#eda374", 0.8);
        

            if (this.dataChart.length > 0) {
                this.noData =false;
                this.verifWidth();
                this.chartElement.getSeries(0).name("Cantidad de Comentarios");
                //update labels
                this.timeBaseOptionesLabels(this.jsonQueryFilter.aggs.timelineChart.date_histogram.fixed_interval);
                this.updateChartDateBase(this.lastDateOptions);
                this.updateChartDateLabelHover(this.lastFormatLabelHover);
                if (!this.undoActivated) {

                    if (this.lastGTE != this.jsonQueryFilter.query.bool.must[0].range['@timestamp'].gte && this.lastLTE != this.jsonQueryFilter.query.bool.must[0].range['@timestamp'].lte) {
                        this.lastGTE = this.jsonQueryFilter.query.bool.must[0].range['@timestamp'].gte;
                        this.lastLTE = this.jsonQueryFilter.query.bool.must[0].range['@timestamp'].lte;
                        this.addCurrentDate(this.lastDateOptions, this.lastFormatLabelHover);
                    }
                } else {
                    if (chartData_["info"]["id"] == "chart-component") {
                        this.undoActivated = false;
                    }
                }
            } else {
                this.noData = true;

                this.chartElement.yAxis().enabled(false);
                this.chartElement.xAxis().enabled(true);

                this.chartElement.xAxis().title('No información Disponible');
            }

            this.chartSectionBlock = false;

        }
    }


    @Output() updateQueryFilterEvent = new EventEmitter<any>();


    ngOnInit() {

        // https://api.anychart.com/8.1.0/anychart#appendTheme

        this.chartElement = anychart.column();
        this.verifWidth();
        this.chartElement.interactivity().hoverMode("single");


    }


    ngAfterViewInit() {

        //Clear
        this.dateArray = [];


        this.chartElement.container(this.container.nativeElement);
        this.chartElement.draw();

        //Event Listener
        this.chartElement.listen('pointClick', (e?: any) => {
            let index = e.iterator.getIndex();
            this.updatePointChartData(index);
        });



    }
    /* CONTROL FUNCTIONS *********************************************************/

    changeKeyJSON(json: any) {
        let temp = JSON.stringify(json).replace(/\"key_as_string\":/g, "\"x\":");
        temp = temp.replace(/\"doc_count\":/g, "\"value\":");
        return JSON.parse(temp);

    }


    totalMentionsCalc(data) {
        let temp = 0;
        for (let i in data) {
            temp += data[i].doc_count;
        }
        return temp;
    }


    // Add date to JSON Array 

    addCurrentDate(dateOptions: any, dateFormat: string) {
        let dategte = this.jsonQueryFilter.query.bool.must[0].range['@timestamp'].gte;
        let datelte = this.jsonQueryFilter.query.bool.must[0].range['@timestamp'].lte;
        let dateInterval = this.jsonQueryFilter.aggs.timelineChart.date_histogram.fixed_interval;
        let tempDate = { "interval": dateInterval, "gte": dategte, "lte": datelte, "dateOptions": dateOptions, "dateFormat": dateFormat };
        this.dateArray.push(tempDate);


    }

    // ZoomTimeBase 
    zoomTimeBase() {

        let tempBase = this.jsonQueryFilter.aggs.timelineChart.date_histogram.fixed_interval;
        let tempResponse = { "intervalStr": "", "intervalNum": 0 };
        switch (tempBase) {
            case "1y":
                tempResponse.intervalStr = "1M";
                tempResponse.intervalNum = 3600 * 24 * 30.416 * 12 * 1000;

                break;
            case "1M":
                tempResponse.intervalStr = "1d";
                tempResponse.intervalNum = 3600 * 24 * 30.416 * 1000;
                break;
            case "1d":
                tempResponse.intervalStr = "1h";
                tempResponse.intervalNum = 3600 * 24 * 1000;
                break;

            case "1h":
                tempResponse.intervalStr = "10m";
                tempResponse.intervalNum = 3600 * 1000;
                break;

            case "10m":
                tempResponse.intervalStr = "10s";
                tempResponse.intervalNum = 60 * 10 * 1000;
                break;
        }

        return tempResponse;
    }

    timeBaseOptionesLabels(intervalStr) {
        switch (intervalStr) {
            case "1y":
                this.lastDateOptions = { year:'numeric'};
                this.lastFormatLabelHover = "yyyy";
                break;
            case "1M":
                this.lastDateOptions = { year:'numeric', month: 'long' };
                this.lastFormatLabelHover = "MMMM' de 'yyyy";
                break;
            case "1d":
                this.lastDateOptions = { weekday: 'long', month: 'short', day: 'numeric' };
                this.lastFormatLabelHover = "EEEE, dd' de 'MMMM' de 'yyyy";
                break;
            case "1h":
                this.lastDateOptions = { weekday: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
                this.lastFormatLabelHover = "EEEE, dd' de 'MMMM' de 'yyyy h:00 a";
                break;
            case "10m":
                this.lastDateOptions = { hour: 'numeric', minute: 'numeric', hour12: true };
                this.lastFormatLabelHover = "EEEE, dd' de 'MMMM' de 'yyyy h:mm a";
                break;
            case "10s":
                this.lastDateOptions = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
                this.lastFormatLabelHover = "EEEE, dd' de 'MMMM' de 'yyyy h:mm:ss a";
                break;
            default:
                break;
        }
    }

    // Undo Time
    undoTimeBase() {
        this.chartSectionBlock = true;


        //Flag activated undo  
        this.undoActivated = true;

        this.dateArray.pop();
        let tempDate = this.dateArray[this.dateArray.length - 1];

        //update labels
        this.updateChartDateBase(tempDate.dateOptions);
        this.updateChartDateLabelHover(tempDate.dateFormat);

        this.lastDateOptions = tempDate.dateOptions;
        this.lastFormatLabelHover = tempDate.dateFormat;



        this.jsonQueryFilter.query.bool.must[0].range['@timestamp'].gte = tempDate.gte;
        this.jsonQueryFilter.query.bool.must[0].range['@timestamp'].lte = tempDate.lte;
        this.jsonQueryFilter.aggs.timelineChart.date_histogram.fixed_interval = tempDate.fixed_interval;

        this.updateFilterParent();
    }


    // Chart Labels ************************
    updateChartDateBase(dateOptions: any) {
        var labels = this.chartElement.xAxis().labels();
        labels.hAlign("center");
        labels.format((e?: any) => {
            let date = new Date(e["tickValue"].replace(/ /g, "T"));
            let options = dateOptions;
            return date.toLocaleDateString("es-ES", options);
        });
    }

    updateChartDateLabelHover(dateFormat: string) {
      this.chartElement.tooltip().titleFormat(function(this: any) {
            let timeZoneOffeset = new Date().getTimezoneOffset();
            anychart.format.outputLocale("es-es");
            return anychart.format.dateTime(this.x.replace(/ /g, "T"), dateFormat, timeZoneOffeset);
        });
    //    this.chartElement.tooltip().titleFormat("Manager: casa {%x}")

    }


    /*UPDATE FILTER QUERY  ************************************************************/

    //Update Chart Time
    updatePointChartData(i) {
        if (this.jsonQueryFilter.aggs.timelineChart.date_histogram.fixed_interval != "10s") {
            this.chartSectionBlock = true;

            //zoom
            let newInterval = this.zoomTimeBase();

            let tempInit = this.dataChart[i]["key"];
            let tempFinal = this.dataChart[i]["key"] + newInterval.intervalNum;


            this.jsonQueryFilter.query.bool.must[0].range['@timestamp'].gte = tempInit;
            this.jsonQueryFilter.query.bool.must[0].range['@timestamp'].lte = tempFinal;
            this.jsonQueryFilter.aggs.timelineChart.date_histogram.fixed_interval = newInterval.intervalStr;

            this.updateFilterParent();
        }

    }

    updateFilterParent() {
        let componentInfo = { "id": "chart-component" };
        let queryFilter = { "filter": this.jsonQueryFilter, "info": componentInfo };
        this.updateQueryFilterEvent.emit(queryFilter);
    }



    /* resize event*/
    verifWidth(){
        if (window.screen.width > 480){ 
            this.chartElement.yAxis().title('Comentarios');
            this.chartElement.xAxis().title('');
            this.chartElement.xAxis().labels().wordBreak("break-word");
            this.chartElement.xAxis().labels().hAlign("center");
            this.chartElement.xAxis().labels().width(90);

        }else{
            this.chartElement.left('-10');
            this.chartElement.right('10');
            this.chartElement.yAxis().title('');
            this.chartElement.xAxis().labels().wordBreak("normal");
            this.chartElement.xAxis().labels().wordBreak("break-word");
            this.chartElement.xAxis().labels().hAlign("center");
            this.chartElement.xAxis().labels().width(72);

        }
    }




}
