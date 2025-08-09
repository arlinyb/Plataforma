import { Component, OnInit, Input, EventEmitter, Output,ViewChild } from '@angular/core';
import { Helpers } from '../../../../../../helpers';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

import { FacebookService, InitParams } from 'ngx-facebook';
import { environment } from '../../../../../../../environments/environment';

import { IonRangeSliderComponent } from "ng2-ion-range-slider";
import { ShortNumberModule } from '../../../../../../_pipes/short-number/short-number.module';


declare let mLayout: any;
@Component({
    selector: 'app-aside-nav-exploration-posts',
    templateUrl: './aside-nav-exploration-posts.component.html',
    styleUrls: [
        "../../../../../layouts/aside-nav/aside-nav.component.css",
     "../../../../../layouts/angular-scss-modules/IonRangeSliderModule.scss",
     "../../../../../layouts/angular-scss-modules/NgSelectModule.scss",
     "../../../../../layouts/angular-scss-modules/TagInputModule.scss",

    ]
})
export class AsideNavExplorationPostsComponent implements OnInit {

    @ViewChild('rangeReactionsSliderElement') rangeReactionsSlider: IonRangeSliderComponent;
    
    public firstLoad : boolean;
    public jsonQueryFilter: any;
    public sources: any;
    public contents: any;
    public networkDistribution: any;

    public hits: any;

    /* Aside */
    public selectedNetwork: string;
    public contentType: string;
    public selectedSort: string;
    public region: string;

    /*networks */
    public sectionNetworksActivated:boolean;
    public cantPostsFacebook:number;
    public cantPostsInstagram:number;
    public cantPostsTwitter:number;
    public cantPostsTikTok:number;
    public cantPostsYouTube:number;
    public cantPostsThreads:number;

    /* sources*/
    public sectionSourcesActivated:boolean;
    public sortSources: string;
    public firstLoadSidebar: boolean;
    public selectedSources: any;
    public totalSources: any;
    public topSources: any;
    public topSourcesFB: any;
    public currentSourcesSelection: any;
    public currentSourcesExcludeSelection:any;
    public sourceModeOption: string;
    public selectedSourcesMultiselect: any;
    public sourcesListDropdown: any;

    /*sentiment */
    public sectionReactionsActivated;
    public reactions_: any;
    public reactionsMax_: any;

    public generalMetrics_: any;
    public generalMetricsMax_: any;
    public selectedRangeSliderFilterReaction: string;
    public minValueRangeSliderReactions: number;
    public maxValueRangeSliderReactions: number;


       /* contents*/
     public sectionContentsActivated:boolean; 
    public cantPhotos:number;
    public cantVideos:number;
    public cantLinks:number;
    public cantStatus:number;
    public cantText:number;

    

    public currentLoginProvider:string;


    constructor( 
          private toastr: ToastrService,
          private fb: FacebookService

        ) {

   

        //fb.init(initParams);
        this.firstLoad = false;


        this.hits = null;

        /* Networks */
        this.sectionNetworksActivated = false;
        this.selectedNetwork = "";
        this.cantPostsFacebook = 0;
        this.cantPostsInstagram = 0;
        this.cantPostsTwitter = 0;
        this.cantPostsTikTok = 0;
        this.cantPostsYouTube = 0;
        this.cantPostsThreads = 0;


        /*Sources */
        this.sectionSourcesActivated = false;
        this.selectedSources = [];
        this.totalSources = [];
        this.topSources = [];
        this.topSourcesFB = [];
        this.sortSources = "reach.value";

        this.currentSourcesSelection = [];
        this.currentSourcesExcludeSelection = [];
        this.selectedSourcesMultiselect = [];
        this.sourcesListDropdown = [];
        this.sourceModeOption = 'all';
        this.firstLoadSidebar = true;

        /*Aside */
        this.selectedSort = "likes";


        /* sentiment */
        this.sectionReactionsActivated = false;
        this.selectedRangeSliderFilterReaction = "";
        this.minValueRangeSliderReactions = -1;
        this.maxValueRangeSliderReactions = -1;

        /* contents*/
        this.contentType = "";
        this.sectionContentsActivated = false;
        this.cantPhotos = 0;
        this.cantVideos = 0;
        this.cantLinks = 0;
        this.cantStatus = 0;
        this.cantText = 0;

        
        this.currentLoginProvider = environment.user.provider; 

        
    }


    @Input()
    set localAsideData(asideDate_: any) {
        if (asideDate_ != undefined) {

            


            //Clear Sources
            this.clearSourcesData('all');
            
            this.sources = asideDate_["data"]["aggregations"]["sources"]["buckets"];
            this.contents = asideDate_["data"]["aggregations"]["contentType"]["buckets"];
            this.networkDistribution = asideDate_["data"]["aggregations"]["networkDistribution"]["buckets"];

            this.hits = asideDate_["data"]["hits"].value;

            this.generalMetrics_ = asideDate_["data"]["generalMetrics"];
            this.generalMetricsMax_ = asideDate_["data"]["generalMetricsMax"];

            this.reactions_ = asideDate_["data"]["reactions"];
            this.reactionsMax_ = asideDate_["data"]["reactionsMax"];


            this.jsonQueryFilter = asideDate_["filterQuery"];

            // Enter only in first Load of controller
            if(this.firstLoad == false){
                this.firstLoad = true;
                let maxValue = this.generalMetricsMax_.totalLikes.value;
                this.rangeReactionsSlider.update({ prefix: "",min:0,max: maxValue,from_max:maxValue,to:maxValue,to_max:maxValue,max_interval:maxValue});
            }
           
           /* Reset Reaction Slider Min-Max*/
           let maxValue =  this.getMaxValueSelectedSort();
           this.rangeReactionsSlider.update({ prefix: "",min:0,max: maxValue,from_max:maxValue,to:maxValue,to_max:maxValue,max_interval:maxValue});

           //Assing Cants Networks
           this.assingNetworkCants();

           //Assing Cants Contents
           this.assingContentsCants();

            // Set Top
            if(  this.sourceModeOption == 'all'){

                if(this.firstLoadSidebar){
                    this.firstLoadSidebar = false;
                    this.totalSources = this.sources;              
                    //Shorter Names Sources
                    this.shorterNameSource();
                }
                this.topSources = this.sources.slice(0, 5);

            }else{
                this.topSources =  this.sources.slice(0, 30);
            }



            //Add FB data to top
            this.addFBData();

            //Remove Top Data from dropdown
            this.splitSelectedSources();
    
        }
    }



    @Output() updateQueryFilterEvent = new EventEmitter<any>();


    ngOnInit() {

        mLayout.initAside();

        this.currentLoginProvider = environment.user.provider; 

    }

    /** Detect click event  **********************************************************************/



    /**  Network **/

    selectNetwork(network: string) {
        this.selectedNetwork = network;
        if (network == "all") {
            this.sectionNetworksActivated =  false;
            this.jsonQueryFilter.query.bool.must[5].bool.should = [];
        } else {
            this.sectionNetworksActivated =  true;
            this.jsonQueryFilter.query.bool.must[5].bool.should = { "match_phrase": { "network": this.selectedNetwork } };
        }
        this.updateFilterParent();
    }


    assingNetworkCants(){
        for (let i = 0; i < this.networkDistribution.length; i++) {
            switch(this.networkDistribution[i].key){
                case "Facebook":
                    this.cantPostsFacebook  = this.networkDistribution[i].doc_count;
                    break;
                case "Instagram":
                    this.cantPostsInstagram  = this.networkDistribution[i].doc_count;
                    break;
                case "Twitter":
                    this.cantPostsTwitter  = this.networkDistribution[i].doc_count;
                    break;
                case "TikTok":
                    this.cantPostsTikTok  = this.networkDistribution[i].doc_count;
                    break;
                case "YouTube":
                    this.cantPostsYouTube  = this.networkDistribution[i].doc_count;
                    break;
                case "Threads":
                    this.cantPostsThreads  = this.networkDistribution[i].doc_count;
                    break;
            }
        }
    } 





      /** Sources ***/
      shorterNameSource(){
        for (let i = 0; i < this.totalSources.length; i++) {
            this.totalSources[i].key_short = this.totalSources[i].key.substring(0, 21);
        }
      }  

      splitSelectedSources(){
        this.sourcesListDropdown = [];
        for (let i = 0; i < this.totalSources.length; i++) {
            if(this.verifNotInTopSources(this.totalSources[i].key)){
                this.sourcesListDropdown.push(this.totalSources[i])
            }
        }
      }

      verifNotInTopSources(sourceName){
          let nonExistElement = true;
         for (let i = 0; i < this.topSources.length; i++ ) {
             if (this.topSources[i].key == sourceName) {
                nonExistElement = false;
                break;
             }
         }
          return nonExistElement;
      }
    

    clearSourcesData(type){
        this.sourceModeOption = type;
        this.sourcesListDropdown = [];
        this.topSources = [];  
        this.clearCheckboxes();
    }

    clearCheckboxes() {
       
        this.selectedSourcesMultiselect = [];

       this.enebleCheckboxSources(false);
        
    } 

    enebleCheckboxSources(condition){
        setTimeout(function(){
            var els = document.getElementsByName('source-top');
            for (var i=0;i<els.length;i++){
                els[i]['checked'] = condition; 
            }
        }, 300);   
    }
    selectSource(sourceId, state) {
        this.sourceModeOption = 'custom';
        if(state){
            this.currentSourcesSelection.push(sourceId);
        }else{
            for (let i = 0; i < this.currentSourcesSelection.length; i++ ) {
                if (this.currentSourcesSelection[i] == sourceId) {
                    this.currentSourcesSelection.splice(i, 1);
                    break;
                }
            }
            if(this.currentSourcesSelection.length == 0){
                this.sourceModeOption = 'all'; 
            }
        }
      }

      showSelectedSources() {
        if (this.sourceModeOption == 'custom') {
            this.sectionSourcesActivated = true;
            let query = [];
            let queryExclude = [];
            //Filter Terms
            if(this.currentSourcesSelection.length > 0){
                for (let i = 0; i < this.currentSourcesSelection.length; i++) {
                    const source = this.currentSourcesSelection[i];
                    query.push({ "match_phrase": { "idOrigin": source } })
                }

                this.jsonQueryFilter.query.bool.must[2].bool.should = query;
                this.currentSourcesSelection = [];
            }else{
                this.jsonQueryFilter.query.bool.must[2].bool.should = [];
            }


            //Add Excludes
            if(this.currentSourcesExcludeSelection.length > 0){

                for (let i = 0; i < this.currentSourcesExcludeSelection.length; i++) {
                    const sourceId = this.currentSourcesExcludeSelection[i].details.hits.hits[0]._source.idOrigin;
                    queryExclude.push({ "match_phrase": { "idOrigin": sourceId } })
                }
                this.jsonQueryFilter.query.bool.must_not =  {"bool": {"should": queryExclude, "minimum_should_match": 1 }};
            }else{
                this.jsonQueryFilter.query.bool.must_not = [];
            }
        } else if (this.sourceModeOption == 'all') {
            this.sectionSourcesActivated = false;
            this.currentSourcesSelection = [];
            this.currentSourcesExcludeSelection = [];
            this.jsonQueryFilter.query.bool.must[2].bool.should = [];
            this.jsonQueryFilter.query.bool.must_not = []; // remove excludes

        }
        this.clearSourcesData(this.sourceModeOption);
        this.updateFilterParent();

    }


    /*Sources FB Data */
    addFBData() {
        var cont = 0;
        this.topSourcesFB = [];
        for (let index = 0; index < this.topSources.length; index++) {
            this.topSources[index].info = { "picture": "" };
            this.topSources[index].exclude = false;
            this.topSources[index].info.picture = this.topSources[index].details.hits.hits[0]._source.pictureLink;
                        if (cont == (this.topSources.length - 1)) {
                            this.topSourcesFB = this.topSources;
                            if(this.sourceModeOption == 'custom'){
                                this.enebleCheckboxSources(true);
                            }
                        }
                        cont++;

            /*this.fb.api('/' + this.topSources[index].details.hits.hits[0]._source.idOrigin + '?fields=access_token,picture&access_token=' + environment.facebook.accessToken).then(
                    res => {
                        
                    }
                )*/
        }

    }

    /*Sources Events*/
    onAddMultiselectSource(event){
        this.selectSource(event.details.hits.hits[0]._source.idOrigin, true);
    }

    onRemoveMultiselectSource(event){
        this.selectSource(event.value.details.hits.hits[0]._source.idOrigin, false);
    }
    
   /*Exclude Sources Top*/
   addToExcludeTopSource(sourceId) {
    let currentExclude = this.currentSourcesExcludeSelection;
    this.currentSourcesExcludeSelection = [];

    //remove from  selected sources 
    this.selectSource(sourceId, false);
    //Remove source from top sources
    for (let i = 0; i < this.topSourcesFB.length; i++) {
        if (this.topSourcesFB[i].details.hits.hits[0]._source.idOrigin == sourceId) {
            //Add source to exclude list
            currentExclude.push(this.topSourcesFB[i]);
            this.topSourcesFB[i].exclude =  true;
            break;
        }
    }
    this.currentSourcesExcludeSelection = currentExclude;
    this.sourceModeOption = 'custom';

}

removeElementExcludeTopSource(event) {
    let sourceId = event.details.hits.hits[0]._source.idOrigin;
    let currentExclude = this.currentSourcesExcludeSelection;
    this.currentSourcesExcludeSelection = [];

    for (let i = 0; i < this.topSourcesFB.length; i++) {
        if (this.topSourcesFB[i].details.hits.hits[0]._source.idOrigin == sourceId) {
            //Add source to exclude list
            currentExclude.splice(i, 1);
            this.topSourcesFB[i].exclude = false;
            break;
        }
    }
    this.currentSourcesExcludeSelection = currentExclude;
    if(this.currentSourcesExcludeSelection.length == 0 && this.currentSourcesSelection.length == 0  ){
        this.sourceModeOption = 'all';
    }else{
        this.sourceModeOption = 'custom';
    }
}


    /** Sentiment ***/
    selectGeneralMetrics(generalMetric: string) {
        this.selectedSort = generalMetric;
        let maxValue = 0;

        switch (generalMetric) {
            case "likes":
                maxValue = this.generalMetricsMax_.totalLikes.value;
                this.jsonQueryFilter.sort[0] = { "totalLikes": { "order": "desc" } };
                this.jsonQueryFilter.query.bool.must[3] =  {"range":{ "totalLikes":{"gte":0,"lte":maxValue}   }}
                this.rangeReactionsSlider.update({ prefix: "",min:0,max: maxValue,from:0,from_min:0,from_max:maxValue,to:maxValue,to_max:maxValue,max_interval:maxValue});
                break;

            case "comments":
                maxValue = this.generalMetricsMax_.totalComments.value  ;
                this.jsonQueryFilter.sort[0] = { "totalComments": { "order": "desc" } };
                this.jsonQueryFilter.query.bool.must[3] =  {"range":{ "totalComments":{"gte":0,"lte":maxValue}   }}
                this.rangeReactionsSlider.update({ prefix: "",min:0,max: maxValue,from:0,from_min:0,from_max:maxValue,to:maxValue,to_max:maxValue,max_interval:maxValue});
                break;
            case "shares":
                maxValue = this.generalMetricsMax_.totalShares.value  ;
                this.jsonQueryFilter.sort[0] = { "totalShares": { "order": "desc" } };
                this.jsonQueryFilter.query.bool.must[3] =  {"range":{ "totalShares":{"gte":0,"lte":maxValue}   }}
                this.rangeReactionsSlider.update({ prefix: "",min:0,max: maxValue,from:0,from_min:0,from_max:maxValue,to:maxValue,to_max:maxValue,max_interval:maxValue});
                break;
            case "views":
                maxValue = this.generalMetricsMax_.totalViews.value;
                this.jsonQueryFilter.sort[0] = { "totalViews": { "order": "desc" } };
                this.jsonQueryFilter.query.bool.must[3] =  {"range":{ "totalViews":{"gte":0,"lte":maxValue}   }}
                this.rangeReactionsSlider.update({ prefix: "",min:0,max: maxValue,from:0,from_min:0,from_max:maxValue,to:maxValue,to_max:maxValue,max_interval:maxValue});
                break;
        }
        this.updateFilterParent();

    }

    selectReactions(reaction: string) {
        this.selectedSort = reaction;
        let maxValue = 0;
        switch (reaction) {
            case "love":
                maxValue = this.reactionsMax_.reactionsLove.value;
                this.jsonQueryFilter.sort[0] = { "reactionsLove": { "order": "desc" } };
                this.jsonQueryFilter.query.bool.must[3] =  {"range":{ "reactionsLove":{"gte":0,"lte":maxValue}   }}
                this.rangeReactionsSlider.update({ prefix: "",min:0,max: maxValue,from:0,from_min:0,from_max:maxValue,to:maxValue,to_max:maxValue,max_interval:maxValue});
                break;

            case "haha":
                 maxValue = this.reactionsMax_.reactionsHaha.value;
                 this.jsonQueryFilter.sort[0] = { "reactionsHaha": { "order": "desc" } };
                 this.jsonQueryFilter.query.bool.must[3] =  {"range":{ "reactionsHaha":{"gte":0,"lte":maxValue}   }}
                 this.rangeReactionsSlider.update({ prefix: "",min:0,max: maxValue,from:0,from_min:0,from_max:maxValue,to:maxValue,to_max:maxValue,max_interval:maxValue});
                break;

            case "wow":
                maxValue = this.reactionsMax_.reactionsWow.value;
                this.jsonQueryFilter.sort[0] = { "reactionsWow": { "order": "desc" } };
                this.jsonQueryFilter.query.bool.must[3] =  {"range":{ "reactionsWow":{"gte":0,"lte":maxValue}   }}
                this.rangeReactionsSlider.update({ prefix: "",min:0,max: maxValue,from:0,from_min:0,from_max:maxValue,to:maxValue,to_max:maxValue,max_interval:maxValue});
                break;

            case "sad":
                maxValue = this.reactionsMax_.reactionsSad.value;
                this.jsonQueryFilter.sort[0] = { "reactionsSad": { "order": "desc" } };
                this.jsonQueryFilter.query.bool.must[3] =  {"range":{ "reactionsSad":{"gte":0,"lte":maxValue}   }}
                this.rangeReactionsSlider.update({ prefix: "",min:0,max: maxValue,from:0,from_min:0,from_max:maxValue,to:maxValue,to_max:maxValue,max_interval:maxValue});
                break;
            case "angry":
                 maxValue = this.reactionsMax_.reactionsAngry.value;
                 this.jsonQueryFilter.sort[0] = { "reactionsAngry": { "order": "desc" } };
                 this.jsonQueryFilter.query.bool.must[3] =  {"range":{ "reactionsAngry":{"gte":0,"lte":maxValue}   }}
                 this.rangeReactionsSlider.update({ prefix: "",min:0,max: maxValue,from:0,from_min:0,from_max:maxValue,to:maxValue,to_max:maxValue,max_interval:maxValue});
                break;
        }


        this.updateFilterParent();
    }

    finishChangeSliderReactions( event) {
        let minValue = event.from;
        let maxValue = event.to;
        this.selectedRangeSliderFilterReaction = this.selectedSort;
        this.minValueRangeSliderReactions= minValue;
        this.maxValueRangeSliderReactions= maxValue;
        let sliderOption = this.selectedSort;
        switch (sliderOption) {
            case "likes":
                this.jsonQueryFilter.query.bool.must[3] =  {"range":{ "totalLikes":{"gte":minValue,"lte":maxValue}   }}
                break;
            case "comments":
                this.jsonQueryFilter.query.bool.must[3] =  {"range":{ "totalComments":{"gte":minValue,"lte":maxValue}   }}
                break;
            case "shares":
                this.jsonQueryFilter.query.bool.must[3] =  {"range":{ "totalShares":{"gte":minValue,"lte":maxValue}   }}
                break;
            case "views":
                this.jsonQueryFilter.query.bool.must[3] =  {"range":{ "totalViews":{"gte":minValue,"lte":maxValue}   }}
                break;
            case "love":
                this.jsonQueryFilter.query.bool.must[3] =  {"range":{ "reactionsLove":{"gte":minValue,"lte":maxValue}   }}
                break;
            case "haha":
                this.jsonQueryFilter.query.bool.must[3] =  {"range":{ "reactionsHaha":{"gte":minValue,"lte":maxValue}   }}
                break;
            case "wow":
                this.jsonQueryFilter.query.bool.must[3] =  {"range":{ "reactionsWow":{"gte":minValue,"lte":maxValue}   }}
                break;
            case "sad":
                this.jsonQueryFilter.query.bool.must[3] =  {"range":{ "reactionsSad":{"gte":minValue,"lte":maxValue}   }}
                break;
            case "angry":
                this.jsonQueryFilter.query.bool.must[3] =  {"range":{ "reactionsAngry":{"gte":minValue,"lte":maxValue}   }}
                break;
        }
        this.sectionReactionsActivated = true;

        this.updateFilterParent();


    }

    clearRangeSlider(){
        this.sectionReactionsActivated = false;

        this.selectedRangeSliderFilterReaction = "";
        this.minValueRangeSliderReactions=-1;
        this.maxValueRangeSliderReactions=-1;
        this.jsonQueryFilter.query.bool.must[3] =  {"bool":{"should":[],"minimum_should_match":1}}//Default Range Reactions
        this.updateFilterParent();
        this.rangeReactionsSlider.update({ prefix: "",min:0,max: 0,from:0,from_min:0,from_max:0,to:0,to_max:0,max_interval:0});
    }

    getMaxValueSelectedSort(){
        let maxValue=0;
        let sliderOption = this.selectedSort;
        switch (sliderOption) {
            case "likes":
                maxValue = this.generalMetricsMax_.totalLikes.value;
                break;
            case "comments":
                maxValue = this.generalMetricsMax_.totalComments.value;
                break;
            case "shares":
                maxValue = this.generalMetricsMax_.totalShares.value;
                break;
            case "views":
                maxValue = this.generalMetricsMax_.totalShares.value;
                break;
            case "love":
                maxValue = this.reactionsMax_.reactionsLove.value;
                break;
            case "haha":
                maxValue = this.reactionsMax_.reactionsHaha.value;
                break;
            case "wow":
                maxValue = this.reactionsMax_.reactionsWow.value;
                break;
            case "sad":
                maxValue = this.reactionsMax_.reactionsSad.value;
                break;
            case "angry":
                maxValue = this.reactionsMax_.reactionsAngry.value;
                break;
        
            }
            return maxValue;
    }


    /** Region ***/
    selectRegion(region: string) {
        this.region = region;

        if (region == "all") {
            this.jsonQueryFilter.query.bool.must[5].bool.should = [];
        } else {
            this.jsonQueryFilter.query.bool.must[5].bool.should = { "match_phrase": { "editor": this.region } };
        }
        this.updateFilterParent();
    }


    /** Content ***/
    selectContentType(contentType: string) {
        this.contentType = contentType;
        if (contentType == "all") {
            this.sectionContentsActivated =  false;
            this.jsonQueryFilter.query.bool.must[4].bool.should = [];
        } else {
            this.sectionContentsActivated =  true;
            this.jsonQueryFilter.query.bool.must[4].bool.should = { "match_phrase": { "type": this.contentType } };
        }
        this.updateFilterParent();
    }


    /**  Type **/
    assingContentsCants(){
        for (let i = 0; i < this.contents.length; i++) {
            switch(this.contents[i].key){
                case "photo":
                    this.cantPhotos  = this.contents[i].doc_count;
                    break;
                case "video":
                    this.cantVideos  = this.contents[i].doc_count;
                    break;
                case "link":
                    this.cantLinks  = this.contents[i].doc_count;
                    break;
                case "status":
                    this.cantStatus  = this.contents[i].doc_count;
                    break;
                case "text":
                    this.cantText  = this.contents[i].doc_count;
                    break;
               
                
            }
        }
    }




  
    /* UPDATE FILTER QUERY ************************************************************** */




    updateFilterParent() {
        this.jsonQueryFilter.size = 50; //dafault 50
        let componentInfo = { "id": "aside-component" };
        let queryFilter = { "filter": this.jsonQueryFilter, "info": componentInfo };
        this.updateQueryFilterEvent.emit(queryFilter);
    }


    /**/
    showMessage(){
        setTimeout(function(){
            $("#header-menu-id").click();
        }, 50);
        this.toastr.info('Proximamente Disponible','Acceso a Feature');
        
    }
}
