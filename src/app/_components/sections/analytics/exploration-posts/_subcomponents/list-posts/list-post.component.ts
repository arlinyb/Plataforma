import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ScriptLoaderService } from '../../../../../../_services/script-loader.service';
import { TagModel } from 'ngx-chips/core/accessor';
import { environment } from '../../../../../../../environments/environment';

import { Observable } from 'rxjs'
import { of } from 'rxjs';


// Service

declare var MasonryJS: any;


@Component({
    selector: 'app-list-data',
    templateUrl: "./list-post.component.html",
    styleUrls: ["./list-post.component.css"],
    host: {
        '(window:resize)': 'onResize()'
    }
})
export class ListPostComponent implements OnInit {
    public screenWidth: number;

    public index: string;
    public listData: any;
    public hits: number;
    public fromRangeHits: number;
    public sizeRangeHits: number;

    public listWithAttachment: any;
    public listDisplayMode: string;
    public jsonQueryFilter: any;


    /*search terms */
    public selectedQuerySearchFilter: string
    public filterTermActivated: boolean;
    public highlightTerm: string;
    public filterSearchTagsLists: any;
    public lastQueryFilter: string
    /* -advance search*/
    public selectedAdvanceSearchTerms: boolean;
    public minimumMatchParameterAdvanceSearch: number;

    public modalMessage: any;
    public typeSearchFilterName: string;
    public typeSearchFilterOption: string

    public sortTop: string;
    public listSectionBlock: boolean;
    public ismobile: boolean;

    public filterData_: any;

    public currentLoginProvider:string;


    constructor(
        private _script: ScriptLoaderService,
    ) {
        this.screenWidth = 0;

        this.listData = [];
        this.fromRangeHits = 0;
        this.sizeRangeHits = 0;

        this.listWithAttachment = [];
        this.listDisplayMode = 'list';


        this.filterTermActivated = false;
        this.highlightTerm = null;
        this.filterSearchTagsLists = [];
        this.selectedQuerySearchFilter = "*";
        this.lastQueryFilter = "*";
        this.typeSearchFilterOption = 'post+';
        this.typeSearchFilterName = "Post +"

        /*advance search */
        this.selectedAdvanceSearchTerms = false;
        this.minimumMatchParameterAdvanceSearch = 65;

        this.listSectionBlock = true;
        this.ismobile = false;

        this.currentLoginProvider = environment.user.provider; 
    }

    @Input()
    set localLoadingSectionBlock(listSectionBlock_: any) {
        this.listSectionBlock = listSectionBlock_;



    }

    @Input()
    set localListData(listData_: any) {
        if (listData_ != undefined) {
            if (listData_["options"]["topics"] == false) {
                this.jsonQueryFilter = listData_["filterQuery"];
                this.selectListElements(listData_["data"]["list"]);
                this.hits = listData_["data"]["hits"].value;
                this.index = listData_["index"];
                this.sortTop = Object.keys(this.jsonQueryFilter.sort[0])[0];

                /*graph filter */
                this.filterData_ = { "filterQuery": this.jsonQueryFilter, "indexType": "posts" };


                this.initDisplayMode();
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

    /*post list selection*/
    selectListElements(listElements) {
        if (this.jsonQueryFilter.size == 50 && this.sizeRangeHits != 50) {
            this.listData = listElements;
        } else {
            if (this.fromRangeHits < this.jsonQueryFilter.size) {
                var newEntries = listElements.slice(this.fromRangeHits, this.jsonQueryFilter.size);
                newEntries.forEach(entry => {
                    this.listData.push(entry)
                });
            } else {
                for (let index = this.jsonQueryFilter.size; index < this.fromRangeHits; index++) {
                    this.listData.pop();
                }
            }
        }
    }


    /*post mode*/
    changePostDisplayMode(mode: string) {
        if (mode != this.listDisplayMode) {
            this.listDisplayMode = mode;

            this.initDisplayMode();
        }


    }

    initDisplayMode() {
        if (this.listDisplayMode == 'masonry') {
            this.removeAttachmentNull();
            setTimeout(() => {
                MasonryJS.load();
            }, 100);
            setTimeout(() => {
                this.listSectionBlock = false;
            }, 500);
        } else {
            this.listSectionBlock = false;
        }
    }


    /**/
    accordionElementList(id: any) {
        for (let i in this.listData) {
            if (this.listData[i]._id == id) {
                (this.listData[i].accordion_activated) ? this.listData[i].accordion_activated = false : this.listData[i].accordion_activated = true;
                break;
            }
        }
    }



    /***  QUERY SEARCH ***/


    /* Type of search */
    updateTypeFilterSearchName(filterOption: string) {
        this.typeSearchFilterOption = filterOption;
        switch (filterOption) {
            case "title":
                this.typeSearchFilterName = "Título";
                break;
            case "post":
                this.typeSearchFilterName = " Post ";
                break;
            case "post+":
                this.typeSearchFilterName = "Post +";
                break;

            case "all":
                this.typeSearchFilterName = "- Todo -";
                break;
        }
        this.buildfilterTermsQuery(this.selectedQuerySearchFilter);
    }

    /*Build the query for filter terms*/
    buildfilterTermsQuery(query) {
        this.listSectionBlock = true;
        this.selectedQuerySearchFilter = query;
        if (query == '*') {
            this.selectedAdvanceSearchTerms = false;
        }
        // Query Search Option
        if (!this.selectedAdvanceSearchTerms) {
            //Query String
            this.jsonQueryFilter.query.bool.must[1] = { "query_string": {} };
            if (this.typeSearchFilterOption == 'all') {
                this.jsonQueryFilter.query.bool.must[1].query_string = { "query": query };
            } else if (this.typeSearchFilterOption == 'title') {
                this.jsonQueryFilter.query.bool.must[1].query_string = { "default_field": "postTitle", "query": query };

            } else if (this.typeSearchFilterOption == 'post') {
                this.jsonQueryFilter.query.bool.must[1].query_string = { "default_field": "postMessage", "query": query };

            } else if (this.typeSearchFilterOption == 'post+') {
                this.jsonQueryFilter.query.bool.must[1].query_string = { "default_field": "message", "query": query };

            }
        } else {
            //More like this
            this.jsonQueryFilter.query.bool.must[1] = { "more_like_this": { "fields": [], "like": query, "min_term_freq": 1, "max_query_terms": 12, "minimum_should_match": this.minimumMatchParameterAdvanceSearch + "%" } };
            if (this.typeSearchFilterOption == 'all') {
                this.jsonQueryFilter.query.bool.must[1].more_like_this.fields = ["message", "body"];
            } else if (this.typeSearchFilterOption == 'title') {
                this.jsonQueryFilter.query.bool.must[1].more_like_this.fields = ["postTitle"];

            } else if (this.typeSearchFilterOption == 'post') {
                this.jsonQueryFilter.query.bool.must[1].more_like_this.fields = ["postMessage"];

            } else if (this.typeSearchFilterOption == 'post+') {
                this.jsonQueryFilter.query.bool.must[1].more_like_this.fields = ["message"];

            }
        }

        /*Default*/
        this.sizeRangeHits = 0;
        this.fromRangeHits = 0;
        this.jsonQueryFilter.size = 50;

        this.filterData_ = { "filterQuery": this.jsonQueryFilter, "indexType": "posts" };

        this.updateFilterParent();
    }

    /*Set format for query depending of searchInput and type*/
    parseQueryString(tagList) {
        let termQuery = "";
        let termName = "";
        for (let i = 0; i < tagList.length; i++) {
            termName = tagList[i].value;
            if (termName == 'AND') {
                if (i < tagList.length - 1 && i > 0)
                    termQuery += " AND ";
            }
            else {
                if (termName.includes(" "))
                    termName = "(" + termName.replace(/ /g, " AND ") + ")";
                termQuery += termName + " ";
            }
        }
        return termQuery;
    }
    deleteFilterTerm(event) {
        let queryStr = "*";
        if (this.filterSearchTagsLists.length > 0) {
            if (this.filterSearchTagsLists[0].value == 'AND')
                this.filterSearchTagsLists.shift();

            this.deleteRepeatAnds();

            queryStr = this.parseQueryString(this.filterSearchTagsLists);
            this.buildfilterTermsQuery(queryStr);

        } else {
            this.buildfilterTermsQuery(queryStr);

        }
    }

    deleteRepeatAnds() {
        for (let i = 0; i < this.filterSearchTagsLists.length; i++) {
            if (i < this.filterSearchTagsLists.length - 1) {
                if (this.filterSearchTagsLists[i].value == 'AND' && this.filterSearchTagsLists[i + 1].value == 'AND') {
                    this.filterSearchTagsLists.splice(i, 1);
                    break;
                }
            }
        }
    }



    addFilterTerm(event) {
        if (!this.checkAdvanceSearchParameters(event.value)) {
            if (event.value == 'AND') {
                if (this.filterSearchTagsLists.length == 1 || this.filterSearchTagsLists[this.filterSearchTagsLists.length - 2].value == 'AND') {
                    this.filterSearchTagsLists.pop();
                }
            } else {
                let queryStr = this.parseQueryString(this.filterSearchTagsLists);
                this.buildfilterTermsQuery(queryStr);
            }
        } else {
            //remove from tag list the config parameter
            this.filterSearchTagsLists.splice(-1, 1);
            //Update Query with new parameter
            this.buildfilterTermsQuery(this.selectedQuerySearchFilter);

        }
    }


    onAdding(tag): Observable<any> {
        let newTag = tag.toLowerCase();
        if (newTag == 'and' || newTag == 'and ') {
            newTag = "AND";
            return of(newTag);
        }
        return of(tag);
    }

    filterTerm(event) {
        if (event.value != 'AND') {
            this.highlightTerm = event.value;

            this.lastQueryFilter = this.selectedQuerySearchFilter;
            this.buildfilterTermsQuery(event.value);

            this.filterTermActivated = true;
        }

    }
    //Use to recover the complete filter query
    filterTermRecover() {
        if (this.filterTermActivated) {
            this.highlightTerm = null;
            this.filterTermActivated = false;

            this.buildfilterTermsQuery(this.lastQueryFilter)
        }
    }


    clearFilterInput() {
        this.filterSearchTagsLists = [];
        this.filterTermActivated = false;
        this.buildfilterTermsQuery("*");

    }
    /*Advance search */

    activateAdvanceSearchTerms(state) {
        this.selectedAdvanceSearchTerms = state;

        this.buildfilterTermsQuery(this.selectedQuerySearchFilter);

    }
    checkAdvanceSearchParameters(newValue) {
        let response = false;
        if (this.selectedAdvanceSearchTerms && newValue.match(/@@\D+.\d+/)) {
            let parameterValue = newValue.split('.')[1];
            let parameterName = newValue.split('.')[0].slice(2);
            switch (parameterName) {
                case '%': //Minimun Match
                    if (parameterValue <= 100 && parameterValue >= 1) {
                        this.minimumMatchParameterAdvanceSearch = parameterValue;
                        response = true;
                    }
                    break;
            }

        }
        return response;
    }


    /*********/


    /* send a link to modal component for preview*/
    sendLinkModal(id: any, type: any, link: any) {
        let tempMessage = { "index": "","network":"", "postTitle": "", "postMessage": "", "url": "", "@timestamp": "", "type": "", "link": "", "idPost": "", "totalLikes": 0, "totalComments": 0, "totalShares": 0,"totalViews": 0, "origin": "", "pictureLink": "", "attachmentNull": false,"currentLogin": "" };
        for (let i in this.listData) {
            if (this.listData[i]._id == id) {

                if (this.listData[i]._source.attachment == null) {
                    if (type == 'photo') {
                        if (!this.listData[i]._source.attachmentBroken)
                            tempMessage.url = this.listData[i]._source.attachment;
                        else
                            tempMessage.url = 'https://firebasestorage.googleapis.com/v0/b/nairu-d4893.appspot.com/o/NAIRU%2Fassets%2Fmedia%2Fcontent%2Fno_image.png?alt=media&token=13e48cc8-6d25-4016-bda2-b992fdeba658';
                    } else if (type == 'video') {
                        tempMessage.url = "https://firebasestorage.googleapis.com/v0/b/nairu-d4893.appspot.com/o/NAIRU%2Fassets%2Fmedia%2Fcontent%2Fvideo.png?alt=media&token=339e2cd0-9a76-4eda-8678-e819a1307941";
                    } else if (type == 'link') {
                        tempMessage.url = "https://firebasestorage.googleapis.com/v0/b/nairu-d4893.appspot.com/o/NAIRU%2Fassets%2Fmedia%2Fcontent%2Flink.png?alt=media&token=10862e6f-20b4-4d96-a0fe-571177aa7f85";
                    } else {
                        tempMessage.url = "https://firebasestorage.googleapis.com/v0/b/nairu-d4893.appspot.com/o/NAIRU%2Fassets%2Fmedia%2Fcontent%2Fstatus.png?alt=media&token=1f0030ec-5970-4261-8a4b-39b670c38686";
                    }
                } else {
                    tempMessage.url = this.listData[i]._source.attachment;
                }
                tempMessage.index = this.index;
                tempMessage.network = this.listData[i]._source.network;
                tempMessage.postTitle = this.listData[i]._source.postTitle;
                tempMessage.postMessage = this.listData[i]._source.postMessage;
                tempMessage.type = type;
                tempMessage.link = link;
                tempMessage.idPost = this.listData[i]._source.id;
                tempMessage.totalLikes = this.listData[i]._source.totalLikes;
                tempMessage.totalComments = this.listData[i]._source.totalComments;
                tempMessage.totalShares = this.listData[i]._source.totalShares;
                tempMessage.totalViews = this.listData[i]._source.totalViews;
                tempMessage.origin = this.listData[i]._source.origin;
                tempMessage.pictureLink = this.listData[i]._source.pictureLink;
                tempMessage['@timestamp'] = this.listData[i]._source['@timestamp'];
                tempMessage.currentLogin  =  this.currentLoginProvider

                this.modalMessage = tempMessage;
                if (this.listData[i]._source.attachment == null || this.listData[i]._source.attachmentBroken) {
                    tempMessage.attachmentNull = true;
                }
                break;
            }
        }
    }


    /* UPDATE FILTER QUERY ************************************************************** */

    /* update  query search */
    updateQuerySearch($event) {
        let querySTR = $event;

        this.buildfilterTermsQuery(querySTR);

    }

    updateQty(value: number) {
        if (this.hits >= value && value != this.jsonQueryFilter.size) {
            this.listSectionBlock = true;
            this.fromRangeHits = this.jsonQueryFilter.size;
            this.sizeRangeHits = value;
            this.jsonQueryFilter.size = value;
            this.updateFilterParent();
        }
    }


    IncrementQty() {
        this.listSectionBlock = true;
        this.fromRangeHits = this.jsonQueryFilter.size;
        this.sizeRangeHits = this.jsonQueryFilter.size + 50;
        this.jsonQueryFilter.size = this.jsonQueryFilter.size + 50;
        this.updateFilterParent();
    }

    updateFilterParent() {
        let componentInfo = { "id": "postsList-component" };
        let queryFilter = { "filter": this.jsonQueryFilter, "info": componentInfo };
        this.updateQueryFilterEvent.emit(queryFilter);
    }

    /* image attachement */

    errorImageBroken(i, img) {
        this.listData[i]._source.attachment = 'https://firebasestorage.googleapis.com/v0/b/nairu-d4893.appspot.com/o/NAIRU%2Fassets%2Fmedia%2Fcontent%2Fno_image.png?alt=media&token=13e48cc8-6d25-4016-bda2-b992fdeba658'
        this.listData[i]._source.attachmentBroken = true;

        if (this.listDisplayMode == 'masonry') {
            setTimeout(() => { MasonryJS.resize(); }, 1000);
        }
        return this.listData[i]._source.attachment;
    }

    calculateTopIconHover(img) {
        if (window.screen.width > 480) {
            return (img.offsetHeight / 2 - 15) + 'px';
        } else {
            return ((img.offsetHeight / 2 - 15)) + 'px';
        }
    }

    onResize() {
        this.verifWidth();
        if (this.listDisplayMode == 'masonry') {

            MasonryJS.resize();
        }
    }



    verifWidth() {
        this.screenWidth = window.screen.width;

        if (window.screen.width <= 480) { // 480px portrait
            this.ismobile = true;
        } else {
            this.ismobile = false;
        }
    }
    removeAttachmentNull() {
        this.listWithAttachment = [];

        for (let i = 0; i < this.listData.length; i++) {
            if (this.listData[i]._source.attachment != null) {
                this.listWithAttachment.push(this.listData[i])
            }
        }
    }


    /* General */



}