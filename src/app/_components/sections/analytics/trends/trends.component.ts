import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { Helpers } from '../../../../helpers';

// Service 
import { ScriptLoaderService } from '../../../../_services/script-loader.service';
import { CommentsService } from '../../../../_services/query-services/comments.service';

//Javascript
import * as moment from 'moment'; // add this 1 of 4
import 'moment/locale/es';

import { environment } from '../../../../../environments/environment';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { AngularFireDatabase } from '@angular/fire/database';


@Component({
    selector: "app-trends",
    templateUrl: './trends.component.html',
    styleUrls: ["../../sections.component.css","trends.component.css", "./../../../../../assets/app/styles/picker.min.css"],
    host: {
        '(window:resize)': 'verifWidth()'
     }
  

})
export class TrendsComponent implements OnInit {
    public jsonQueryFilter_: any;

    public listData_: any;
    public asideDate_: any;
    public chartData_: any;
    public dateData_: any;

    public componentEmitterInfo_: any;

    public current_l1: string;
    public current_l2: string;
    public current_l3: string;
    public current_index:string;

    public ismobile:boolean;

    public sortTop:string;

    @BlockUI() blockUI: NgBlockUI;


    constructor(      
        public db: AngularFireDatabase,
        private _script: ScriptLoaderService, 
        private _commentsService: CommentsService) {

        /* Last Month*/
        let gteDate = moment().subtract(29, 'days').valueOf();
        let lteDate = moment().valueOf();
        /* */

        this.jsonQueryFilter_ = {"version":true,"size":50,"sort":[{"totalLikes":{"order":"desc"}}],"query":{"bool":{"must":[{"range":{"fechaComment":{"gte":gteDate,"lte":lteDate,"format":"epoch_millis"}}},{"query_string":{"query":"*"}},{"bool":{"should":[],"minimum_should_match":1}},{"bool":{"should":[{"match_phrase":{"type":"attachment"}}],"minimum_should_match":1}},{"bool":{"should":[],"minimum_should_match":1}},{"bool":{"should":[],"minimum_should_match":1}}],"must_not":[]}},"_source":{"excludes":["body"]},"aggregations":{"grafico":{"date_histogram":{"field":"fechaComment","fixed_interval":"1d","time_zone":"America/Costa_Rica","min_doc_count":1}},"fuente":{"terms":{"field":"origin","size":500,"order":{"_count":"desc"}},"aggregations":{"fuente":{"top_hits":{"size":1,"_source":{"includes":["idOrigin"]}}}}},"topposts":{"terms":{"field":"idPost","size":5,"order":{"_count":"desc"}},"aggregations":{"postmsj":{"top_hits":{"size":1,"_source":{"includes":["postMessage","origin"]}}}}},"tipo":{"terms":{"field":"type","size":7,"min_doc_count":0,"order":{"_term":"asc"}}}}}; 
        this.componentEmitterInfo_ = { "id": "parent-component" };

        this.current_l1 = "";
        this.current_l2 = "";
        this.current_l3 = "";
        this.current_index = "";

        this.ismobile = false;
    }

    ngOnInit() {
        this.blockUI.start(); // Start blocking

        this.getUserCurrentProfileInfo_env();

         /*if is mobile*/
         this.verifWidth();
         
         this.blockUI.stop(); // Stop blocking

    }

    /* Firebase Current Info Onload*/
    getUserCurrentProfileInfo_env() {
        if (environment.user.currentProfile.current_index == '') {


            this.db.object('users/' + environment.user.uid + "/default_selection/").query.once('value').then(defaultSelection => {

                environment.user.currentProfile.current_l1 = defaultSelection.val()["l1"];
                environment.user.currentProfile.current_l2 = defaultSelection.val()["l2"];
                environment.user.currentProfile.current_l3 = defaultSelection.val()["l3"];
                environment.user.currentProfile.current_index = defaultSelection.val()["index"];

                this.current_l1 = environment.user.currentProfile.current_l1;
                this.current_l2 = environment.user.currentProfile.current_l2;
                this.current_l3 = environment.user.currentProfile.current_l3;
                this.current_index = environment.user.currentProfile.current_index;

                this.getCommentsInfo();


            });
        } else {
            this.current_l1 = environment.user.currentProfile.current_l1;
            this.current_l2 = environment.user.currentProfile.current_l2;
            this.current_l3 = environment.user.currentProfile.current_l3;
            this.current_index = environment.user.currentProfile.current_index;
            this.getCommentsInfo();
        }
    }


    /*** Update Post List ************************************************************/

    updateQueryFilter($event) {
        this.jsonQueryFilter_ = $event["filter"];
        this.componentEmitterInfo_ = $event["info"];

        this.getCommentsInfo();


        /* Google Analytics */
        (<any>window).ga('send', 'event', {
            eventCategory: this.current_l1,
            eventAction: "Trends",
            eventLabel: "Filter Query",
            eventValue: 1
        });
    }


    updateQty(value: number) {
        
    }


    getCommentsInfo() {

        this._commentsService.getListComments(this.jsonQueryFilter_,this.current_index).subscribe(result => {
            let tempResponse = result;
            this.listData_ = { "data": tempResponse["hits"]["hits"], "filterQuery": this.jsonQueryFilter_, "info": this.componentEmitterInfo_ ,"index":this.current_index};
            this.asideDate_ = { "data": { "aggregations": tempResponse["aggregations"], "hits": tempResponse["hits"]["total"].value}, "filterQuery": this.jsonQueryFilter_, "info": this.componentEmitterInfo_ };
            this.chartData_ = { "data": tempResponse["aggregations"]["grafico"]["buckets"], "filterQuery": this.jsonQueryFilter_, "info": this.componentEmitterInfo_ };
            this.dateData_ = { "data": this.jsonQueryFilter_.query.bool.must[0].range['@timestamp'], "filterQuery": this.jsonQueryFilter_,"indexType":"comments", "info": this.componentEmitterInfo_ };



        },
            error => {
                console.log(error);
            })
    }


    verifWidth() {
        if (window.screen.width <= 768) { // 768px portrait
            this.ismobile = true;
        }else{
            this.ismobile = false;
        }
    }


}
