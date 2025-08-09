import { Component, OnInit, Input, EventEmitter, Output,ViewChild } from '@angular/core';
import { Helpers } from '../../../../../../helpers';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

import { FacebookService, InitParams } from 'ngx-facebook';
import { environment } from '../../../../../../../environments/environment';

declare let mLayout: any;
@Component({
    selector: 'app-aside-nav-trends',
    templateUrl: './aside-nav-trends.component.html',
    styleUrls: ["../../../../../layouts/aside-nav/aside-nav.component.css"]
})
export class AsideNavTrendsComponent implements OnInit {

    public jsonQueryFilter: any;
    public sources: any;
    public contents: any;
    public hits: any;
    /* Aside */
    public contentType: string;
    public generalMetric: string;
    public reaction: string;
    public region: string;

 
    /* sources*/
    public firstLoadSidebar:boolean;
    public selectedSources: any;
    public totalSources:any;
    public topSources: any;
    public topSourcesFB: any;
    public currentSourcesSelection:any;
    public sourceModeOption:string;
    public selectedSourcesMultiselect:any;
    public sourcesListDropdown:any;

    /*Posts */
    public currentPostId:string;
    public topPosts: any;
    public topPostsFB: any;


       /* contents*/
    public cantAttachment:number;

    public cantText:number;


    public errorImage:string;
    constructor( 
          private toastr: ToastrService,
          private fb: FacebookService

        ) {

        let initParams: InitParams = environment.facebook.initParams; 
        fb.init(initParams);
          
     
        this.hits = null;
        this.contentType = "";
        this.selectedSources = [];
        this.totalSources = [];
        this.topSources =  [];
        this.topSourcesFB =  [];

        this.currentSourcesSelection = [];
        this.selectedSourcesMultiselect = [];
        this.sourcesListDropdown = [];
        this.sourceModeOption = 'all';
        this.firstLoadSidebar = true;

        /* Posts */    
        this.topPosts  = [];    
        this.topPostsFB = [];
        this.currentPostId  = "";


        /* contents*/
        this.cantAttachment = 0;
        this.cantText = 0;

        this.errorImage = 'https://firebasestorage.googleapis.com/v0/b/nairu-d4893.appspot.com/o/NAIRU%2Fassets%2Fmedia%2Fcontent%2Fno_image.png?alt=media&token=13e48cc8-6d25-4016-bda2-b992fdeba658';
    }


    @Input()
    set localAsideData(asideDate_: any) {
        if (asideDate_ != undefined) {

            this.sources = asideDate_["data"]["aggregations"]["fuente"]["buckets"];
            this.contents = asideDate_["data"]["aggregations"]["tipo"]["buckets"];
            this.hits = asideDate_["data"]["hits"];
            this.topPosts = asideDate_["data"]["aggregations"]["topposts"]["buckets"];
            this.jsonQueryFilter = asideDate_["filterQuery"];

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


            //Add FB data sources to top
            this.addFBDataSources();

            
            //Add FB data posts to top
            this.addFBDataPosts();

            //Remove Top Data from dropdown
            this.splitSelectedSources();
    
        }
    }



    @Output() updateQueryFilterEvent = new EventEmitter<any>();


    ngOnInit() {

        mLayout.initAside();


    }

    /** Detect click event  **********************************************************************/

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
            let query = [];
            for (let i = 0; i < this.currentSourcesSelection.length; i++) {
                const source = this.currentSourcesSelection[i];
                 query.push({ "match_phrase": { "idOrigin": source } })
            }
            this.jsonQueryFilter.query.bool.must[2].bool.should = query;
        } else if (this.sourceModeOption == 'all') {
            this.currentSourcesSelection = [];
            this.jsonQueryFilter.query.bool.must[2].bool.should = [];
        }
        this.clearSourcesData(this.sourceModeOption);
        this.updateFilterParent();

    }

    /*Sources FB Data */
    addFBDataSources() {
        var cont = 0;
        this.topSourcesFB = [];
        for (let index = 0; index < this.topSources.length; index++) {
            this.topSources[index].info = { "picture": "" };
               this.fb.api('/' + this.topSources[index].details.hits.hits[0]._source.idOrigin + '?fields=access_token,picture&access_token=' + environment.facebook.accessToken).then(
                    res => {
                        this.topSources[index].info.picture = res.picture.data.url;
                        if (cont == (this.topSources.length - 1)) {
                            this.topSourcesFB = this.topSources;
                            if(this.sourceModeOption == 'custom'){
                                this.enebleCheckboxSources(true);
                            }
                        }
                        cont++;
                    }, err => {
                        this.topSources[index].info.picture = 'https://firebasestorage.googleapis.com/v0/b/nairu-d4893.appspot.com/o/NAIRU%2Fassets%2Fmedia%2Fcontent%2Fno_image.png?alt=media&token=13e48cc8-6d25-4016-bda2-b992fdeba658';
                        if (cont == (this.topSources.length - 1)) {
                            this.topSourcesFB = this.topSources;
                            if(this.sourceModeOption == 'custom'){
                                this.enebleCheckboxSources(true);
                            }
                        }
                        cont++;
                    })
                
        }

    }

    /*Sources Events*/
    onAddMultiselectSource(event){
        this.selectSource(event.details.hits.hits[0]._source.idOrigin, true);
    }

    onRemoveMultiselectSource(event){
        this.selectSource(event.value.details.hits.hits[0]._source.idOrigin, false);
    }


    /* Posts */
    addFBDataPosts() {
        var cont = 0;
        this.topPostsFB = [];
        for (let index = 0; index < this.topPosts.length; index++) {
            this.topPosts[index].info = { "picture": "","created_time":"" };
               this.fb.api('/' + this.topPosts[index].key + '?fields=created_time,picture&access_token=' + environment.facebook.accessToken).then(
                    res => {
                           this.topPosts[index].info.picture = res.picture;
                           this.topPosts[index].info.created_time = res.created_time;

                       if (cont == (this.topPosts.length - 1)) {
                            this.topPostsFB = this.topPosts;
                       
                        }
                        cont++;
                   }, err => {
                       this.topPosts[index].info.picture = 'https://firebasestorage.googleapis.com/v0/b/nairu-d4893.appspot.com/o/NAIRU%2Fassets%2Fmedia%2Fcontent%2Fno_image.png?alt=media&token=13e48cc8-6d25-4016-bda2-b992fdeba658';
                       this.topPosts[index].info.created_time = null;

                       if (cont == (this.topPosts.length - 1)) {
                           this.topPostsFB = this.topPosts;

                       }
                       cont++;
                   })
                
        }

    }
    selectTopPost(postId){
        this.currentPostId = postId;
        if(postId == 'all'){
            this.jsonQueryFilter.query.bool.must[6].bool.should = [];
        }else{
            this.jsonQueryFilter.query.bool.must[6].bool.should = { "match_phrase": { "idPost": postId } };
        }
        this.updateFilterParent();
    }

    /** Sentiment ***/
    selectGeneralMetrics(generalMetric: string) {
        this.generalMetric = generalMetric;

        switch (generalMetric) {
            case "likes":
                this.jsonQueryFilter.sort[0] = { "totalLikes": { "order": "desc" } };
                break;

            case "comments":
                this.jsonQueryFilter.sort[0] = { "totalComments": { "order": "desc" } };
                break;
        }

        this.updateFilterParent();

    }

    selectReactions(reaction: string) {
        this.reaction = reaction;
        switch (reaction) {
            case "love":
                this.jsonQueryFilter.sort[0] = { "reactionsLove": { "order": "desc" } };
                break;

            case "haha":
                this.jsonQueryFilter.sort[0] = { "reactionsHaha": { "order": "desc" } };
                break;

            case "wow":
                this.jsonQueryFilter.sort[0] = { "reactionsWow": { "order": "desc" } };
                break;

            case "sad":
                this.jsonQueryFilter.sort[0] = { "reactionsSad": { "order": "desc" } };
                break;
            case "angry":
                this.jsonQueryFilter.sort[0] = { "reactionsAngry": { "order": "desc" } };
                break;
        }
        this.updateFilterParent();
    }

    /** Region ***/
    selectRegion(region: string) {
        this.region = region;

        if (region == "all") {
            this.jsonQueryFilter.query.bool.must[5].bool.should = [];
        } else {
            this.jsonQueryFilter.query.bool.must[5].bool.should = { "match_phrase": { "editorDR": this.region } };
        }
        this.updateFilterParent();
    }


    /** Content ***/
    selectContentType(contentType: string) {
        this.contentType = contentType;
        if (contentType == "all") {
            this.jsonQueryFilter.query.bool.must[4].bool.should = [];
        } else {
            this.jsonQueryFilter.query.bool.must[4].bool.should = { "match_phrase": { "type": this.contentType } };
        }
        this.updateFilterParent();
    }


    assingContentsCants(){
        for (let i = 0; i < this.contents.length; i++) {
            switch(this.contents[i].key){
                case "attachment":
                    this.cantAttachment  = this.contents[i].doc_count;
                    break;
                case "text":
                    this.cantText  = this.contents[i].doc_count;
                    break;
            }
        }
    }


  
    /* UPDATE FILTER QUERY ************************************************************** */


    updateFilterParent() {
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
