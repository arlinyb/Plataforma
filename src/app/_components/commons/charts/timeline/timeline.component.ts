import { Component, OnInit, ViewChild, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';

import 'anychart';
import 'anychart/dist/locales/es-es';

@Component({
    selector: 'app-charts-timeline',
    templateUrl: "./timeline.component.html",
    styleUrls: ["./timeline.component.css"],
    host: {
        '(window:resize)': 'verifWidth()'
    }
})
export class ChartsTimelineComponent implements OnInit, AfterViewInit {
    public indexType: string;
    public dataInfo: string;
    public dataChart: any;
    public chartElement: anychart.charts.Cartesian = null;

    public jsonQueryFilter: any;

    public totalMentions: number;

    public dateArray: Array<any>;

    public lastFormatLabelHover: string;
    public lastDateOptions: any;

    public noData: boolean;
    public chartSectionBlock: boolean;


    //Control
    private undoActivated: boolean;
    private lastGTE: number;
    private lastLTE: number;

    public selectedOption: string;
    private selectedOptonSerieName: string;
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


        this.selectedOption = "reach";
        this.selectedOptonSerieName = 'Interacciones'
    }





    // definicion
    @ViewChild('chartContainer') container;




    @Input()
    set localLoadingSectionBlock(chartSectionBlock_: any) {
        this.chartSectionBlock = chartSectionBlock_;

    }

    @Input()
    set localChartData(chartData_: any) {

        if (chartData_ != undefined) {

            this.dataInfo = chartData_["info"]["id"];
            this.indexType = chartData_["indexType"];
            this.jsonQueryFilter = chartData_["filterQuery"];
            this.totalMentions = this.totalMentionsCalc(chartData_["data"]);
            this.dataChart = this.changeKeyJSON(chartData_["data"]);

            this.chartElement.removeAllSeries();
            /*Intereactivity */
            this.chartElement.interactivity().selectionMode("multiSelect");

            // Serie Doc Count  *****************        
            let docsYAxis = this.chartElement.yAxis(0);
            let docsYScale = anychart.scales.linear();
            docsYAxis.scale(docsYScale);
            //labels
            let docsLabels = docsYAxis.labels();
            docsLabels.format("{%value}{scale: (1)(1000)(1000)(1000)|()(K)(M)(B)}");

            let serieDoc = this.chartElement.column(this.dataChart);
            serieDoc.name(this.selectedOptonSerieName);
            this.indexType == 'posts' ? serieDoc.name("Publicaciones") : serieDoc.name("Comentarios");
            serieDoc.normal().stroke("#ec8264", 0.7);
            serieDoc.normal().fill("#eda374", 1);
            serieDoc.hovered().fill("#eda374", 0.8);
            serieDoc.yScale(docsYScale);



            // Serie Option *******************

            this.loadOptionData();





            if (this.dataChart.length > 0) {
                this.noData = false;
                this.verifWidth();
                //update labels
                this.timeBaseOptionesLabels(this.jsonQueryFilter.aggs.timelineChart.date_histogram.fixed_interval);
                this.updateChartDateBase(this.lastDateOptions);
                this.updateChartDateLabelHover(this.lastFormatLabelHover);
                if (!this.undoActivated) {
                    //  if (this.lastGTE != this.jsonQueryFilter.query.bool.must[0].range['@timestamp'].gte && this.lastLTE != this.jsonQueryFilter.query.bool.must[0].range['@timestamp'].lte) {
                    this.lastGTE = this.jsonQueryFilter.query.bool.must[0].range['@timestamp'].gte;
                    this.lastLTE = this.jsonQueryFilter.query.bool.must[0].range['@timestamp'].lte;
                    this.addCurrentDate(this.lastDateOptions, this.lastFormatLabelHover);
                    // }
                } else {
                    if (this.dataInfo == "chart-component") {
                        this.undoActivated = false;
                    }
                }
            } else {
                this.noData = true;

                this.chartElement.yAxis().enabled(false);
                this.chartElement.xAxis().enabled(true);

                this.chartElement.xAxis().title('No información Disponible');
            }

            //remove block ui
            this.chartSectionBlock = false;

        }
    }


    @Output() updateQueryFilterEvent = new EventEmitter<any>();


    ngOnInit() {

        // https://api.anychart.com/8.1.0/anychart#appendTheme

        this.chartElement = anychart.line();
        this.chartElement.interactivity().selectionMode("multiSelect");


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


    /*load Option Serie */
    loadOptionData() {
        //remove last serie
        this.chartElement.removeSeriesAt(1);

        // adding option Y scale
        let extraYScale = anychart.scales.linear();


        // adding and adjust extra Y axis
        let optionYAxis = this.chartElement.yAxis(1);
        optionYAxis.title(this.selectedOptonSerieName);
        optionYAxis.orientation("right");
        optionYAxis.scale(extraYScale);

        //labels
        let optionYLabels = optionYAxis.labels();
        optionYLabels.format("{%value}{scale: (1)(1000)(1000)(1000)|()(K)(M)(B)}");
        let optionDataChart = this.setOptionDataList(this.dataChart, this.selectedOption);
        let serieOption = this.chartElement.area(optionDataChart)
        serieOption.name(this.selectedOptonSerieName);
        serieOption.yScale(extraYScale);
        serieOption.normal().stroke("#343434", 0.5);
        serieOption.normal().fill("#343434", 0.4);
        serieOption.hovered().fill("#343434", 0.3);

    }




    /* CONTROL FUNCTIONS *********************************************************/

    changeKeyJSON(json: any) {
        let temp = JSON.stringify(json).replace(/\"key_as_string\":/g, "\"x\":");
        temp = temp.replace(/\"doc_count\":/g, "\"value\":");
        return JSON.parse(temp);

    }
    setOptionDataList(dataList: any, option) {
        let list = [];
        for (let index = 0; index < dataList.length; index++) {
            let newElement = { "x": dataList[index]['x'], "value": dataList[index][option].value }
            list.push(newElement)
        }
        return list;
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
                this.lastDateOptions = { year: 'numeric' };
                this.lastFormatLabelHover = "yyyy";
                break;
            case "1M":
                this.lastDateOptions = { year: 'numeric', month: 'long' };
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
        let labels = this.chartElement.xAxis().labels();
        labels.hAlign("center");
        labels.format((e?: any) => {
            let date = new Date(e["tickValue"].replace(/ /g, "T"));
            let options = dateOptions;
            return date.toLocaleDateString("es-ES", options);
        });
    }

    updateChartDateLabelHover(dateFormat: string) {
        this.chartElement.tooltip().titleFormat(function (this: any) {
            let timeZoneOffeset = new Date().getTimezoneOffset();
            anychart.format.outputLocale("es-es");
            return anychart.format.dateTime(this.x.replace(/ /g, "T"), dateFormat, timeZoneOffeset);
        });

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
        this.jsonQueryFilter.size = 50; //Default 50 hits
        let componentInfo = { "id": "chart-component" };
        let queryFilter = { "filter": this.jsonQueryFilter, "info": componentInfo };
        this.updateQueryFilterEvent.emit(queryFilter);
    }


    /* timeline option chart */
    changeOptionChart(option) {
        this.selectedOption = option;
        switch (option) {
            case "totalLikes":
                this.selectedOptonSerieName = "Reacciones";
                break;
            case "totalComments":
                this.selectedOptonSerieName = "Comentarios";
                break;
            case "totalShares":
                this.selectedOptonSerieName = "Compartidos";
                break;
            case "totalSources":
                this.selectedOptonSerieName = "Influenciadores";
                break;
            case "reach":
                this.selectedOptonSerieName = "Interacciones";
                break;
        }
        this.loadOptionData();
        this.verifWidth(); 
    }

    /* resize event*/
    verifWidth() {


        if(window.screen.width <= 480){
            this.chartElement.left('-10');
            this.chartElement.right('-15');
            this.chartElement.yAxis(0).title('');
            this.chartElement.yAxis(1).title('');
            this.chartElement.xAxis().labels().wordBreak("normal");
            this.chartElement.xAxis().labels().wordBreak("break-word");
            this.chartElement.xAxis().labels().hAlign("center");
            this.chartElement.xAxis().labels().width(72);
            // enable the legend
            this.chartElement.legend().enabled(true).position("top").align("center").padding(15);
        }
        else{
            this.indexType == 'posts' ? this.chartElement.yAxis(0).title('Publicaciones') : this.chartElement.yAxis(0).title('Comentarios');
            this.chartElement.yAxis(1).title(this.selectedOptonSerieName.split(" ")[0]);
            this.chartElement.xAxis().title('');
            this.chartElement.xAxis().labels().wordBreak("break-word");
            this.chartElement.xAxis().labels().hAlign("center");
            this.chartElement.legend().enabled(true).position("top").align("center").padding(0);

            if (window.screen.width > 1920) {
                this.chartElement.xAxis().labels().width(160);    
            }
            else if (window.screen.width > 1024) {
                this.chartElement.xAxis().labels().width(120);    
            }
            else if (window.screen.width > 480) {
                this.chartElement.xAxis().labels().width(90);    
            }

        }

    }




}
