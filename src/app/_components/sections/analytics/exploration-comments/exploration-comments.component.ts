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

import { FacebookService, InitParams } from 'ngx-facebook';


@Component({
    selector: "app-exploration-comments",
    templateUrl: './exploration-comments.component.html',
    styleUrls: ["../../sections.component.css","exploration-comments.component.css", "./../../../../../assets/app/styles/picker.min.css"],
    host: {
        '(window:resize)': 'verifWidth()'
     }
  

})
export class ExplorationCommentsComponent implements OnInit {
    public jsonQueryFilter_: any;

    
    public asideDate_: any;
    public listData_: any;
    public listSectionBlock_:boolean; 


    public chartsTimelineData_: any;
    public chartTimelineSectionBlock_:boolean; 
    public dateData_: any;
    public hitsData_:any;
    public componentEmitterInfo_: any;

    public hitsSectionActivate_:boolean; 


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
        private _commentsService: CommentsService,
        private fb: FacebookService

        ) {

        let initParams: InitParams = environment.facebook.initParams; 
        fb.init(initParams);
        /* Last 1 day*/
        let gteDate = moment().subtract(1, 'day').startOf('day').valueOf();
        let lteDate = moment().valueOf();
        /* */

        this.jsonQueryFilter_ = {
            "version": true, "size": 50, "sort": [{ "totalLikes": { "order": "desc" } }], "track_total_hits": true, "query": { "bool": { "must": [{ "range": { "@timestamp": { "gte": gteDate, "lte": lteDate, "format": "epoch_millis" } } }, { "query_string": { "query": "*" } }, { "bool": { "should": [], "minimum_should_match": 1 } }, { "bool": { "should": [], "minimum_should_match": 1 } }, { "bool": { "should": [], "minimum_should_match": 1 } }, { "bool": { "should": [], "minimum_should_match": 1 } }, { "bool": { "should": [], "minimum_should_match": 1 } }, { "bool": { "should": [], "minimum_should_match": 1 } }, { "bool": { "should": [], "minimum_should_match": 1 } }], "must_not": [] } }, "_source": { "excludes": ["body"] }, "aggs": {
                "max_totalLikes": { "max": { "field": "totalLikes" } }, "max_totalComments": { "max": { "field": "totalComments" } }, "max_reactionsLove": { "max": { "field": "reactionsLove" } }, "max_reactionsHaha": { "max": { "field": "reactionsHaha" } }, "max_reactionsWow": { "max": { "field": "reactionsWow" } }, "max_reactionsSad": { "max": { "field": "reactionsSad" } }, "max_reactionsAngry": { "max": { "field": "reactionsAngry" } }, "timelineChart": {
                    "date_histogram": { "field": "@timestamp", "fixed_interval": "1h", "time_zone": "America/Costa_Rica", "min_doc_count": 1 }, "aggs": { "totalLikes": { "sum": { "field": "totalLikes" } }, "totalComments": { "sum": { "field": "totalComments" } }, "reach": { "sum": { "script": "doc['totalLikes'].value+doc['totalComments'].value" } }, "totalSources": { "cardinality": { "field": "origin" } } }
                }, "sources": { "terms": { "field": "origin", "size": 500, "order": { "reach": "desc" } }, "aggs": { "details": { "top_hits": { "size": 1, "_source": { "includes": ["idOrigin"] } } }, "totalLikes": { "sum": { "field": "totalLikes" } }, "totalComments": { "sum": { "field": "totalComments" } }, "reactionsHaha": { "sum": { "field": "reactionsHaha" } }, "reactionsWow": { "sum": { "field": "reactionsWow" } }, "reactionsAngry": { "sum": { "field": "reactionsAngry" } }, "reactionsSad": { "sum": { "field": "reactionsSad" } }, "reactionsLove": { "sum": { "field": "reactionsLove" } }, "reactionsThankful": { "sum": { "field": "reactionsThankful" } }, "reach": { "sum": { "script": "doc['totalLikes'].value+doc['totalComments'].value" } } } }, "topPosts": { "terms": { "field": "idPost", "size": 5, "order": { "_count": "desc" } }, "aggs": { "details": { "top_hits": { "size": 1, "_source": { "includes": ["postMessage", "origin"] } } } } }, "contentType": { "terms": { "field": "type", "size": 7, "min_doc_count": 0, "order": { "_key": "asc" } } }, "totalCommentsType": { "terms": { "field": "typeFB", "size": 2, "min_doc_count": 0, "order": { "_key": "asc" } } }, "totalSources": { "cardinality": { "field": "origin" } }, "totalLikes": { "sum": { "field": "totalLikes" } }, "totalComments": { "sum": { "field": "totalComments" } }, "reactionsWow": { "sum": { "field": "reactionsWow" } }, "reactionsHaha": { "sum": { "field": "reactionsHaha" } }, "reactionsSad": { "sum": { "field": "reactionsSad" } }, "reactionsAngry": { "sum": { "field": "reactionsAngry" } }, "reactionsLove": { "sum": { "field": "reactionsLove" } }
            }
        };
        this.componentEmitterInfo_ = { "id": "parent-component" };

        this.current_l1 = "";
        this.current_l2 = "";
        this.current_l3 = "";
        this.current_index = "";

        this.ismobile = false;
        this.chartTimelineSectionBlock_ =  true;
        this.listSectionBlock_ =  true;
        this.hitsSectionActivate_ =  false;

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
            eventAction: "ExplorationComments",
            eventLabel: "Filter Query",
            eventValue: 1
        });
    }


    updateQty(value: number) {
        
    }


    getCommentsInfo() {
        this.chartTimelineSectionBlock_ =  true;
        this.listSectionBlock_ =  true;
        let reactions = {};
        let reactionsMax = {};
        let generalMetrics = {};
        let generalMetricsMax = {};

        let max_totalLikes;
        let max_totalComments;
        let max_reactionsLove;
        let max_reactionsHaha;
        let max_reactionsWow;
        let max_reactionsSad;
        let max_reactionsAngry;

    
        this._commentsService.getListComments(this.jsonQueryFilter_,this.current_index).subscribe(result => {
            let tempResponse = result;

            tempResponse["aggregations"].max_totalLikes.value != null ? max_totalLikes =  tempResponse["aggregations"].max_totalLikes  : max_totalLikes = {"value":0};
            tempResponse["aggregations"].max_totalComments.value != null ?max_totalComments = tempResponse["aggregations"].max_totalComments  : max_totalComments = {"value":0};

            tempResponse["aggregations"].max_reactionsLove.value  != null ? max_reactionsLove = tempResponse["aggregations"].max_reactionsLove  : max_reactionsLove = {"value":0};
            tempResponse["aggregations"].max_reactionsHaha.value  != null ? max_reactionsHaha =  tempResponse["aggregations"].max_reactionsHaha  : max_reactionsHaha = {"value":0};
            tempResponse["aggregations"].max_reactionsWow.value  != null ?  max_reactionsWow = tempResponse["aggregations"].max_reactionsWow  : max_reactionsWow = {"value":0};
            tempResponse["aggregations"].max_reactionsSad.value  != null ? max_reactionsSad = tempResponse["aggregations"].max_reactionsSad  : max_reactionsSad = {"value":0};
            tempResponse["aggregations"].max_reactionsHaha.value  != null ? max_reactionsHaha = tempResponse["aggregations"].max_reactionsHaha  : max_reactionsHaha = {"value":0};
            tempResponse["aggregations"].max_reactionsAngry.value  != null ? max_reactionsAngry = tempResponse["aggregations"].max_reactionsAngry  : max_reactionsAngry = {"value":0};


            

            reactions = {"reactionsLove":tempResponse["aggregations"].reactionsLove,"reactionsHaha":tempResponse["aggregations"].reactionsHaha,"reactionsWow":tempResponse["aggregations"].reactionsWow,"reactionsSad":tempResponse["aggregations"].reactionsSad,"reactionsAngry":tempResponse["aggregations"].reactionsAngry};
            //generalMetrics = {"totalLikes":tempResponse["aggregations"].totalLikes ,"totalComments":{"value":tempResponse["aggregations"].totalCommentsType.buckets[0].doc_count},"totalSubComments":{"value":tempResponse["aggregations"].totalCommentsType.buckets[1].doc_count}};
            generalMetrics = {"totalLikes":tempResponse["aggregations"].totalLikes ,"totalComments":{"value":tempResponse["aggregations"].totalCommentsType.buckets[0].doc_count},"totalSubComments":{"value":0}};


            reactionsMax = {"reactionsLove":max_reactionsLove,"reactionsHaha": max_reactionsHaha,"reactionsWow": max_reactionsWow,"reactionsSad":max_reactionsSad,"reactionsAngry":max_reactionsAngry};
            generalMetricsMax = {"totalLikes": max_totalLikes,"totalComments": max_totalComments};

            this.hitsData_ = { "data":{"hits":tempResponse["hits"]["total"],"totalSources":tempResponse["aggregations"].totalSources ,"topSources":tempResponse["aggregations"].sources.buckets.slice(0, 3),"reactions":reactions,"generalMetrics":generalMetrics}};

            this.chartsTimelineData_ = { "data": tempResponse["aggregations"]["timelineChart"]["buckets"], "filterQuery": this.jsonQueryFilter_,"indexType":"comments", "info": this.componentEmitterInfo_ };

            this.asideDate_ = { "data": { "aggregations": tempResponse["aggregations"], "hits": tempResponse["hits"]["total"],"reactions":reactions,"reactionsMax":reactionsMax,"generalMetrics":generalMetrics,"generalMetricsMax":generalMetricsMax}, "filterQuery": this.jsonQueryFilter_, "info": this.componentEmitterInfo_ };

            this.dateData_ = { "data": this.jsonQueryFilter_.query.bool.must[0].range['@timestamp'], "filterQuery": this.jsonQueryFilter_, "info": this.componentEmitterInfo_ };
           
            this.listData_ = { "data": {"list":tempResponse["hits"]["hits"],"hits": tempResponse["hits"]["total"]}, "filterQuery": this.jsonQueryFilter_, "info": this.componentEmitterInfo_, "index": this.current_index };

            //Activate KPIs
            setTimeout(()=>{this.hitsSectionActivate_ =  true;}, 10);

            

           // this.getFBData();

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


    getFBData() {
        for (let index = 0; index < this.hitsData_.data.topSources.length; index++) {
            this.fb.api('/' + this.hitsData_.data.topSources[index].details.hits.hits[0]._source.idOrigin + '?fields=access_token,picture&access_token=' + environment.facebook.accessToken).then(
                res => {
                     this.hitsData_.data.topSources[index].info = {"picture": res.picture.data.url};
       
                }
            )
        }
    }



}
