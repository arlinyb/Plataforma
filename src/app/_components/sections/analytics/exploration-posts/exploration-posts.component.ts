import { Component, OnInit, ViewEncapsulation, ɵConsole } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { Helpers } from '../../../../helpers';

// Service 
import { ScriptLoaderService } from '../../../../_services/script-loader.service';
import { ElasticService } from '../../../../_services/query-services/elastic.service';
import { PostsService } from '../../../../_services/query-services/posts.service';

//Javascript
import * as moment from 'moment'; // add this 1 of 4
import 'moment/locale/es';

import { environment } from '../../../../../environments/environment';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
import { FacebookService, InitParams } from 'ngx-facebook';


@Component({
    selector: "app-exploration-posts",
    templateUrl: './exploration-posts.component.html',
    styleUrls: ["../../sections.component.css", "exploration-posts.component.css", "./../../../../../assets/app/styles/picker.min.css"],
    host: {
        '(window:resize)': 'verifWidth()'
    }


})
export class ExplorationPostsComponent implements OnInit {
    public jsonQueryFilter_: any;

    public asideDate_: any;
    public listData_: any;
    public listSectionBlock_: boolean;
    public chartsTimelineData_: any;
    public chartTimelineSectionBlock_: boolean;
    public dateData_: any;
    public hitsData_: any;
    public componentEmitterInfo_: any;

    current_l1: string;
    current_l2: string;
    current_l3: string;
    current_index: string;

    ismobile: boolean;


    @BlockUI() blockUI: NgBlockUI;


    /* Topics */
    public topicsList: any;
    public similarityValue: number
    public maxNumberTopics: number;
    public scoreThresholdDivisor: number;

    constructor(
        public db: AngularFireDatabase,
        private _script: ScriptLoaderService,
        private _elasticService: ElasticService,
        private _postsService: PostsService,

        private fb: FacebookService

    ) {

        let initParams: InitParams = environment.facebook.initParams;
        fb.init(initParams);

        /* Last 1 day*/
        let gteDate = moment().subtract(1, 'day').startOf('day').valueOf();
        let lteDate = moment().valueOf();
        /* */
        this.jsonQueryFilter_ = {"version":true,"size":50,"sort":[{"totalLikes":{"order":"desc"}}],"track_total_hits":true,"query":{"bool":{"must":[{"range":{"@timestamp":{"gte":gteDate,"lte":lteDate,"format":"epoch_millis"}}},{"query_string":{"query":"*"}},{"bool":{"should":[],"minimum_should_match":1}},{"bool":{"should":[],"minimum_should_match":1}},{"bool":{"should":[],"minimum_should_match":1}},{"bool":{"should":[],"minimum_should_match":1}},{"bool":{"should":[],"minimum_should_match":1}},{"bool":{"should":[],"minimum_should_match":1}}],"must_not":[]}},"_source":{"excludes":["body"]},"aggs":{"max_totalLikes":{"max":{"field":"totalLikes"}},"max_totalComments":{"max":{"field":"totalComments"}},"max_totalShares":{"max":{"field":"totalShares"}},"max_totalViews":{"max":{"field":"totalViews"}},"max_reactionsLove":{"max":{"field":"reactionsLove"}},"max_reactionsHaha":{"max":{"field":"reactionsHaha"}},"max_reactionsWow":{"max":{"field":"reactionsWow"}},"max_reactionsSad":{"max":{"field":"reactionsSad"}},"max_reactionsAngry":{"max":{"field":"reactionsAngry"}},"timelineChart":{"date_histogram":{"field":"@timestamp","fixed_interval":"1h","time_zone":"America/Costa_Rica","min_doc_count":1},"aggs":{"totalLikes":{"sum":{"field":"totalLikes"}},"totalComments":{"sum":{"field":"totalComments"}},"totalShares":{"sum":{"field":"totalShares"}},"totalViews":{"sum":{"field":"totalViews"}},"reach":{"sum":{"script":"doc['totalLikes'].value+doc['totalComments'].value+doc['totalShares'].value"}},"totalSources":{"cardinality":{"field":"origin"}}}},"sources":{"terms":{"field":"origin","size":500,"order":{"reach":"desc"}},"aggs":{"details":{"top_hits":{"size":1,"_source":{"includes":["idOrigin","pictureLink"]}}},"totalLikes":{"sum":{"field":"totalLikes"}},"totalComments":{"sum":{"field":"totalComments"}},"totalShares":{"sum":{"field":"totalShares"}},"totalViews":{"sum":{"field":"totalViews"}},"reactionsHaha":{"sum":{"field":"reactionsHaha"}},"reactionsWow":{"sum":{"field":"reactionsWow"}},"reactionsAngry":{"sum":{"field":"reactionsAngry"}},"reactionsSad":{"sum":{"field":"reactionsSad"}},"reactionsLove":{"sum":{"field":"reactionsLove"}},"reactionsThankful":{"sum":{"field":"reactionsThankful"}},"reach":{"sum":{"script":"doc['totalLikes'].value+doc['totalComments'].value+doc['totalShares'].value"}}}},"contentType":{"terms":{"field":"type","size":9,"min_doc_count":0,"order":{"_key":"asc"}}},"networkDistribution":{"terms":{"field":"network","size":6,"min_doc_count":0,"order":{"_key":"asc"}}},"totalSources":{"cardinality":{"field":"origin"}},"totalLikes":{"sum":{"field":"totalLikes"}},"totalComments":{"sum":{"field":"totalComments"}},"totalShares":{"sum":{"field":"totalShares"}},"totalViews":{"sum":{"field":"totalViews"}},"reactionsWow":{"sum":{"field":"reactionsWow"}},"reactionsHaha":{"sum":{"field":"reactionsHaha"}},"reactionsSad":{"sum":{"field":"reactionsSad"}},"reactionsAngry":{"sum":{"field":"reactionsAngry"}},"reactionsLove":{"sum":{"field":"reactionsLove"}}}}
       
        this.componentEmitterInfo_ = { "id": "parent-component" };

        this.current_l1 = "";
        this.current_l2 = "";
        this.current_l3 = "";
        this.current_index = "";

        this.ismobile = false;
        this.chartTimelineSectionBlock_ = true;
        this.listSectionBlock_ = true;


        /* Topics */
        this.topicsList = [];
        this.similarityValue = 65;
        this.maxNumberTopics = 10;

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

                this.getPostsInfo();


            });
        } else {
            this.current_l1 = environment.user.currentProfile.current_l1;
            this.current_l2 = environment.user.currentProfile.current_l2;
            this.current_l3 = environment.user.currentProfile.current_l3;
            this.current_index = environment.user.currentProfile.current_index;
            this.getPostsInfo();
        }
    }



    /*** Update Post List ************************************************************/


    updateQueryFilter($event) {
        this.jsonQueryFilter_ = $event["filter"];
        this.componentEmitterInfo_ = $event["info"];

        this.getPostsInfo();


        /* Google Analytics */
        (<any>window).ga('send', 'event', {
            eventCategory: this.current_l1,
            eventAction: "ExplorationPosts",
            eventLabel: "Filter Query",
            eventValue: 1
        });
    }

    getPostsInfo() {
        this.chartTimelineSectionBlock_ = true;
        this.listSectionBlock_ = true;
        let reactions = {};
        let reactionsMax = {};
        let generalMetrics = {};
        let generalMetricsMax = {};

        let max_totalLikes;
        let max_totalComments;
        let max_totalShares;
        let max_totalViews;
        let max_reactionsLove;
        let max_reactionsHaha;
        let max_reactionsWow;
        let max_reactionsSad;
        let max_reactionsAngry;

        this._elasticService.getSearch(this.jsonQueryFilter_, "posts").subscribe(result => {
            let tempResponse = result;

            tempResponse["aggregations"].max_totalLikes.value != null ? max_totalLikes = tempResponse["aggregations"].max_totalLikes : max_totalLikes = { "value": 0 };
            tempResponse["aggregations"].max_totalComments.value != null ? max_totalComments = tempResponse["aggregations"].max_totalComments : max_totalComments = { "value": 0 };
            tempResponse["aggregations"].max_totalShares.value != null ? max_totalShares = tempResponse["aggregations"].max_totalShares : max_totalShares = { "value": 0 };
            tempResponse["aggregations"].max_totalViews.value != null ? max_totalViews = tempResponse["aggregations"].max_totalViews : max_totalViews = { "value": 0 };

            tempResponse["aggregations"].max_reactionsLove.value != null ? max_reactionsLove = tempResponse["aggregations"].max_reactionsLove : max_reactionsLove = { "value": 0 };
            tempResponse["aggregations"].max_reactionsHaha.value != null ? max_reactionsHaha = tempResponse["aggregations"].max_reactionsHaha : max_reactionsHaha = { "value": 0 };
            tempResponse["aggregations"].max_reactionsWow.value != null ? max_reactionsWow = tempResponse["aggregations"].max_reactionsWow : max_reactionsWow = { "value": 0 };
            tempResponse["aggregations"].max_reactionsSad.value != null ? max_reactionsSad = tempResponse["aggregations"].max_reactionsSad : max_reactionsSad = { "value": 0 };
            tempResponse["aggregations"].max_reactionsAngry.value != null ? max_reactionsAngry = tempResponse["aggregations"].max_reactionsAngry : max_reactionsAngry = { "value": 0 };



            reactions = { "reactionsLove": tempResponse["aggregations"].reactionsLove, "reactionsHaha": tempResponse["aggregations"].reactionsHaha, "reactionsWow": tempResponse["aggregations"].reactionsWow, "reactionsSad": tempResponse["aggregations"].reactionsSad, "reactionsAngry": tempResponse["aggregations"].reactionsAngry };
            generalMetrics = { "totalLikes": tempResponse["aggregations"].totalLikes, "totalComments": tempResponse["aggregations"].totalComments, "totalShares": tempResponse["aggregations"].totalShares, "totalViews": tempResponse["aggregations"].totalViews  };
            reactionsMax = { "reactionsLove": max_reactionsLove, "reactionsHaha": max_reactionsHaha, "reactionsWow": max_reactionsWow, "reactionsSad": max_reactionsSad, "reactionsAngry": max_reactionsAngry };
            generalMetricsMax = { "totalLikes": max_totalLikes, "totalComments": max_totalComments, "totalShares": max_totalShares , "totalViews":max_totalViews};

            this.hitsData_ = { "data": { "hits": tempResponse["hits"]["total"], "totalSources": tempResponse["aggregations"].totalSources, "topSources": tempResponse["aggregations"].sources.buckets.slice(0, 3), "reactions": reactions, "generalMetrics": generalMetrics } };

            this.chartsTimelineData_ = { "data": tempResponse["aggregations"]["timelineChart"]["buckets"], "filterQuery": this.jsonQueryFilter_, "indexType": "posts", "info": this.componentEmitterInfo_ };

            this.asideDate_ = { "data": { "aggregations": tempResponse["aggregations"], "hits": tempResponse["hits"]["total"], "reactions": reactions, "reactionsMax": reactionsMax, "generalMetrics": generalMetrics, "generalMetricsMax": generalMetricsMax }, "filterQuery": this.jsonQueryFilter_, "info": this.componentEmitterInfo_ };

            this.dateData_ = { "data": this.jsonQueryFilter_.query.bool.must[0].range['@timestamp'], "filterQuery": this.jsonQueryFilter_, "info": this.componentEmitterInfo_ };



            this.listData_ = { "data": {"list":tempResponse["hits"]["hits"],"hits": tempResponse["hits"]["total"]}, "filterQuery": this.jsonQueryFilter_, "info": this.componentEmitterInfo_, "index": this.current_index ,"options":{"topics":false}};

            //this.getFBData();






        },
            error => {
                console.log(error);
            })
    }


    verifWidth() {
        if (window.screen.width <= 480) { // 768px portrait
            this.ismobile = true;
        } else {
            this.ismobile = false;
        }
    }


    getFBData() {
        for (let index = 0; index < this.hitsData_.data.topSources.length; index++) {
            this.fb.api('/' + this.hitsData_.data.topSources[index].details.hits.hits[0]._source.idOrigin + '?fields=access_token,picture&access_token=' + environment.facebook.accessToken).then(
                res => {
                    this.hitsData_.data.topSources[index].info = { "picture": res.picture.data.url };

                }
            )
        }
    }


    /* IDEA TEMAS */
    // Esta seccion debe estar en un contenedor por aparte

    //Get Similarities from a post
    getRelatedTopics(topicIDCounter, Entities, entityType) {

        //query search
        var jsonQueryFilterTopics_ = [];
        jsonQueryFilterTopics_ = this.jsonQueryFilter_;
        jsonQueryFilterTopics_['track_total_hits'] = true;
        jsonQueryFilterTopics_['track_scores'] = true;
        jsonQueryFilterTopics_['query']['bool']['must'][1] = { "more_like_this": { "fields": ["message"], "like": Entities.join(" "), "min_term_freq": 1, "max_query_terms": 12, "minimum_should_match": this.similarityValue + "%" } };



        this._elasticService.getSearchTopics(jsonQueryFilterTopics_, "posts").subscribe(response => {
            let tempResponse = response;
            //console.log(response)
            let listElementsResponse = tempResponse['hits']['hits'];
            let hitsResponse = tempResponse['hits']['total'].value;
            let reactionsResponse = tempResponse['aggregations']['totalLikes'].value;
            let timelineResponse = tempResponse['aggregations']['timelineChart']["buckets"];
            this.setTopicstoPosts(listElementsResponse, hitsResponse, reactionsResponse,timelineResponse, topicIDCounter, Entities, entityType)

            //Topics Completed
            if (this.topicsList.length == this.maxNumberTopics) {

                this.listData_ = { "data": { "list": this.listData_.data.list, "hits": this.listData_.data.hits }, "filterQuery": this.jsonQueryFilter_, "info": this.componentEmitterInfo_, "index": this.current_index,"options":{"topics":true} };

                //Set Parent Topics
                this.extractSubTopics('reactions');

            }
        },
            error => {
                console.log(error);
            })
    }


    //Set id topic to posts and get entities for each topic
    setTopicstoPosts(listElementsResponse, hitsResponse, reactionsResponse,timelineResponse, topicIDCounter, Entities, entityType) {
        var matches = 0; // elements in response json that match in top n posts
        var reactionsMatch = 0; //the sum of the matched posts
        var newTopic = Entities;
        var newTopicActivated = false
        var topicCounterResponse = 0;
        for (let index = 0; index < this.listData_.data.list.length; index++) {
            const element = this.listData_.data.list[index]._source;
            var idElement = element.id;
            var matchResponse = false;
            // evaluate each post with topics response
            for (let indexResponse = 0; indexResponse < listElementsResponse.length; indexResponse++) {
                const elementResponse = listElementsResponse[indexResponse]._source;
                //top keyword for each topic
                if (topicCounterResponse < 5 && newTopicActivated == false) {
                    if (topicCounterResponse == 4)
                        newTopicActivated = true;
                    topicCounterResponse++;
                    newTopic = Array.from(new Set(newTopic.concat(elementResponse[entityType])));
                }

                //set topic id to post
                if (idElement == elementResponse.id) {
                    matchResponse = true;
                    matches++;
                    reactionsMatch += elementResponse.totalLikes;
                    //console.log("INDEX: ", index, "Tema: ", topicIDCounter)
                    if (!element.hasOwnProperty('topicIDs')) {
                        this.listData_.data.list[index]._source['topicIDs'] = [topicIDCounter];
                    }
                    else {
                        this.listData_.data.list[index]._source['topicIDs'].push(topicIDCounter);
                    }

                }
                //break when match a post and have completed
                if (matchResponse && newTopicActivated) {
                    break;
                }
            }



        }
        //console.log("Topic: ", topicIDCounter,"Matched: ",matches, "Cantidad Hits: ",hitsResponse,"reactions",reactionsResponse,"  **********");
        this.topicsList.push({ "id": topicIDCounter, "keywords": newTopic, "matches": matches, "hits": hitsResponse, 'reactions': reactionsResponse, "reactionsMatch": reactionsMatch, "subTopics": [], "timeline": timelineResponse });


    }


    extractSubTopics(key) {
        //Sort Topics List
        this.topicsList.sort(function (a, b) { return (b[key] > a[key]) ? 1 : ((b[key] < a[key]) ? -1 : 0); });


        /*Set Children nodes */
        for (let indexTopic = 0; indexTopic < this.topicsList.length; indexTopic++) {
            const idTopic = this.topicsList[indexTopic].id;
            for (let indexPosts = 0; indexPosts < this.listData_.data.list.length; indexPosts++) {
                const element = this.listData_.data.list[indexPosts]._source;

                if (element.hasOwnProperty('topicIDs')) {
                    var postTopics = element['topicIDs'];

                    if (postTopics.length > 1 && postTopics.includes(idTopic)) {

                        for (let indexPostTopics = 0; indexPostTopics < postTopics.length; indexPostTopics++) {
                            if (postTopics[indexPostTopics] != idTopic) {
                                // console.log("indice: ", idTopic, "subtopico: ",postTopics[indexPostTopics])
                                var indexTopicRequested = this.topicsList.findIndex(obj => obj.id == postTopics[indexPostTopics]);
                                if (this.topicsList[indexTopic][key] > this.topicsList[indexTopicRequested][key]) {
                                    this.topicsList[indexTopic].subTopics.push(postTopics[indexPostTopics]);
                                }
                            }
                        }
                    }
                }

            }
        }

        console.log(this.topicsList)

    }


    //extract topics
    listDocuments(entityType) {
        var topicIDCounter = 0;
        this.topicsList = [];
        for (let index = 0; index < this.maxNumberTopics; index++) {
            const element = this.listData_.data.list[index]._source;
            this.getRelatedTopics(topicIDCounter, element[entityType], entityType)
            topicIDCounter++;
        }
    }





}







