import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ScriptLoaderService } from '../../../../../../_services/script-loader.service';
import { TagModel } from 'ngx-chips/core/accessor';

import { Observable } from 'rxjs'
import { of } from 'rxjs';


// Service

declare var MasonryJS: any;


@Component({
    selector: 'app-list-comments',
    templateUrl: "./list-comments.component.html",
    styleUrls: ["./list-comments.component.css"],
    host: {
        '(window:resize)': 'onResize()'
     }
})
export class ListCommentsComponent implements OnInit {
    public screenWidth:number; 

    public index: string;
    public comments: any;
    public listWithAttachment: any;
    public listDisplayMode:string;
    public jsonQueryFilter: any;


    /*search terms */
    public filterTermActivated:boolean;
    public highlightTerm: string;
    public filterSearchTagsLists:any;
    public lastQueryFilter:string

    public modalMessage: any;
    public typeSearchFilterName: string;
    public typeSearchFilterOption:string

    public sortTop: string;
    public listSectionBlock:boolean;
    public ismobile:boolean;

    constructor(
        private _script: ScriptLoaderService,
    ) {
        this.screenWidth = 0;
        this.comments = [];

        this.listWithAttachment =[];
        this.listDisplayMode = 'masonry';
        
        
        this.filterTermActivated = false;
        this.highlightTerm = null;
        this.filterSearchTagsLists = [];
        this.lastQueryFilter= "*";
        this.typeSearchFilterOption = 'all';
        this.typeSearchFilterName = "- Todo -"


        this.listSectionBlock = true; 
        this.ismobile = false;
    }



    @Input()
    set localCommentsData(listData_: any) {
        if (listData_ != undefined) {
            this.jsonQueryFilter = listData_["filterQuery"];
            this.comments = listData_["data"];
            this.index = listData_["index"];
            this.sortTop = Object.keys(this.jsonQueryFilter.sort[0])[0];


        

            if(this.listDisplayMode == 'masonry'){
                this.removeAttachmentNull();
               setTimeout(()=>{
                MasonryJS.load();
             }, 100);
             setTimeout(()=>{
                this.listSectionBlock = false; 
             }, 500);
            }else{
                this.listSectionBlock = false; 
            }
        }
    }

    @Output() updateQueryFilterEvent = new EventEmitter<any>();

    ngOnInit() {

        this._script.loadScripts('body', [
            'assets/vendors/custom/masonry/imagesloaded.pkgd.min.js',
            'assets/vendors/custom/masonry/masonry.pkgd.min.js',
            'assets/app/js/general/masonry.js'
         ], true).then(() => {
         });
     
         this.verifWidth();
    }
   


    /* CONTROL  ************************************************************** */

    /*post mode*/
    changePostDisplayMode(mode:string){
        if(mode != this.listDisplayMode){
            this.listDisplayMode = mode;
            
            if(this.listDisplayMode == 'list'){
                this.jsonQueryFilter.size = 25;
                this.jsonQueryFilter.query.bool.must[4].bool.should = [];
            } else if(this.listDisplayMode == 'masonry'){
                this.jsonQueryFilter.size = 50;
                this.jsonQueryFilter.query.bool.must[4].bool.should = { "match_phrase": { "type": "attachment" } };
            } 

            this.updateQty(this.jsonQueryFilter.size)
        }
       

    }

    /**/
    accordionElementList(id: any) {
        for (let i in this.comments) {
            if (this.comments[i]._id == id) {
                (this.comments[i].accordion_activated) ? this.comments[i].accordion_activated = false : this.comments[i].accordion_activated = true;
                break;
            }
        }
    }



    /***  QUERY SEARCH ***/

    /* Type of search */
    updateTypeFilterSearchName(filterOption: string) {
        this.typeSearchFilterOption = filterOption;
        switch (filterOption) {
            case "comments":
                 this.typeSearchFilterName = "Nota";
                break;

            case "posts":
                this.typeSearchFilterName = "Post";
                break;

            case "all":
                this.typeSearchFilterName = "- Todo -";
                break;
        }
        this.buildfilterTermsQuery(this.jsonQueryFilter.query.bool.must[1].query_string.query )
    }

    /*Build the query for filter terms*/
    buildfilterTermsQuery(query){
        this.listSectionBlock = true; 
        if(this.typeSearchFilterOption == 'all'){
            this.jsonQueryFilter.query.bool.must[1].query_string  = {"query":query};
        }else if(this.typeSearchFilterOption == 'posts'){
            this.jsonQueryFilter.query.bool.must[1].query_string = {"default_field": "postMessage","query":query};

        }else if(this.typeSearchFilterOption == 'comments'){
            this.jsonQueryFilter.query.bool.must[1].query_string = {"default_field": "message","query":query};

        }

        this.updateFilterParent();
    }

    /*Set format for query depending of searchInput and type*/
    parseQueryString(tagList) {
        let termQuery = "";
        let termName = "";
        for (let i = 0; i < tagList.length; i++) {
             termName = tagList[i].value;
            if (termName == 'AND') {
                if(i < tagList.length - 1 && i > 0 )
                    termQuery += " AND ";
            }
            else {
                termQuery += termName + " ";
            }
        }
        return termQuery;
    }
    deleteFilterTerm(event){
        let queryStr = "*";
        if(this.filterSearchTagsLists.length > 0){
            if(this.filterSearchTagsLists[0].value=='AND')
                this.filterSearchTagsLists.shift();
            
            this.deleteRepeatAnds();
                
            queryStr = this.parseQueryString(this.filterSearchTagsLists);
            this.buildfilterTermsQuery(queryStr);

        }else{
            this.buildfilterTermsQuery(queryStr);

        }
    }

    deleteRepeatAnds(){
        for (let i = 0; i <  this.filterSearchTagsLists.length; i++) {
            if(i < this.filterSearchTagsLists.length-1 ){
                if(this.filterSearchTagsLists[i].value == 'AND' && this.filterSearchTagsLists[i+1].value == 'AND'){
                    this.filterSearchTagsLists.splice(i, 1);
                    break;
                }
            }
        }
    }


    addFilterTerm(event){
        if(event.value == 'AND'){
            if(this.filterSearchTagsLists.length == 1 || this.filterSearchTagsLists[this.filterSearchTagsLists.length-2].value == 'AND'){
                this.filterSearchTagsLists.pop();
            }
        }else{
            let queryStr = this.parseQueryString(this.filterSearchTagsLists);
            this.buildfilterTermsQuery(queryStr);
        }
    }



    onAdding(tag): Observable<any> {
    
        if(tag.toLowerCase() == 'and'){
            return of(tag.toUpperCase());
        }
        return of(tag);
    }

    filterTerm(event) {
        if (event.value != 'AND') {
            this.highlightTerm = event.value;

            this.lastQueryFilter = this.jsonQueryFilter.query.bool.must[1].query_string.query;
            this.buildfilterTermsQuery(event.value);

            this.filterTermActivated = true;
        }

    }
    //Use to recover the complete filter query
    filterTermRecover(){
        if(this.filterTermActivated){
            this.highlightTerm = null;
            this.filterTermActivated = false;
            
            this.buildfilterTermsQuery(this.lastQueryFilter )
        }
    }



 
    /*********/
openLink(link){
    window.open(link, '_blank');
}


    /* UPDATE FILTER QUERY ************************************************************** */




    updateQty(value: number) {
        this.listSectionBlock = true; 

        this.jsonQueryFilter.size = value;
        this.updateFilterParent();
    }

    updateFilterParent() {
        let componentInfo = { "id": "postsList-component" };
        let queryFilter = { "filter": this.jsonQueryFilter, "info": componentInfo };
        this.updateQueryFilterEvent.emit(queryFilter);
    }

    /* image attachement */

    errorImageBroken(i,img) {
        this.comments[i]._source.linkAttachment = 'https://firebasestorage.googleapis.com/v0/b/nairu-d4893.appspot.com/o/NAIRU%2Fassets%2Fmedia%2Fcontent%2Fno_image.png?alt=media&token=13e48cc8-6d25-4016-bda2-b992fdeba658'
        this.comments[i]._source.linkAttachmentBroken = true;

        if(this.listDisplayMode == 'masonry'){
            setTimeout(()=>{MasonryJS.resize();}, 1000);
        }
        return this.comments[i]._source.linkAttachment;
    }

    calculateTopIconHover(img) {
        if (window.screen.width > 480) {
            return (img.offsetHeight / 2 - 15) + 'px';
        } else {
            return ((img.offsetHeight / 2 - 15)) + 'px';
        }
    }

    onResize(){
        this.verifWidth();
        if(this.listDisplayMode == 'masonry'){
            MasonryJS.resize();
        }
    }



    verifWidth() {
        this.screenWidth = window.screen.width; 
        if (window.screen.width <= 480) { // 480px portrait
            this.ismobile = true;
        }else{
            this.ismobile = false;
        }
    }
    removeAttachmentNull(){
     this.listWithAttachment = [];

     for (let i = 0; i < this.comments.length; i++) {
         if(this.comments[i]._source.linkAttachment != null){
            this.listWithAttachment.push(this.comments[i])
         }
     }
    }


}