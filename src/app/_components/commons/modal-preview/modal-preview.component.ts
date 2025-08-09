import { Component, OnInit, Input ,ViewChild } from '@angular/core';
import {DomSanitizer,SafeResourceUrl,} from '@angular/platform-browser';

import { CommentsService } from '../../../_services/query-services/comments.service';
import { ToastrService } from 'ngx-toastr';

import { FBVideoComponent ,FacebookService, InitParams} from 'ngx-facebook';
import { EmbedVideoService } from 'ngx-embed-video';

import { environment } from '../../../../environments/environment';

declare var window: any;
@Component({
    selector: 'common-modal-preview',
    templateUrl: "./modal-preview.component.html",
    styleUrls: ["./modal-preview.component.css"]
})
export class ModalPreviewComponent implements OnInit {

    public modalSectionBlock:Boolean;
    public inputLoaded:boolean;
    public index:string;
    public network:string;
    public posts: any;
    public jsonQueryFilter: any;
    public testDate: Date;
    public commentsDataImages: any;
    public commentsDataTop: any;

    public jsonQueryFilterComment_: any;
    public postType: string;
    public postURL: string;
    public postLinkSafe:SafeResourceUrl; 
    public postLink: string;
    public postLikes: number;
    public postComments: number;
    public postCommentsElements: number;
    public postCustomLink: string;

    public postShares: number;
    public postViews: number;

    public postUrlSN:string;
    public postOrigin: string;
    public postPictureLink: string;

    public postDateTime:string;
    public postIdOrigin: string;
    public postAttachmentNull: boolean;

    public jsonQueryFilterCommentImages_: any;
    public jsonQueryFilterTopComment_: any;

    public validateLinkPost:boolean;
    public validateTopComments:boolean;
    public validateTopCommentsImages:boolean;

    public postMessage:string;
    public postTitle:string;

    public postId:string;
    public currentLogin:string;
    

    /* videos */
    public yt_iframe_html: any;
    public vimeo_iframe_html: any;
    public hideFacebookVideoLoading:boolean;
    constructor(
        private _commentService: CommentsService,
        private toastr: ToastrService,
        private fb: FacebookService,
        private embedService: EmbedVideoService,
        public sanitizer: DomSanitizer
        ) {
        let initParams: InitParams = environment.facebook.initParams; 
        this.fb.init(initParams);
        
        this.network = "";  
        this.postLink = "";  

        this.commentsDataImages = [];

        this.validateTopComments = false;    
        this.validateTopCommentsImages = false;   
        this.validateLinkPost = false;

        this.postMessage = "";
        this.postTitle = "";
        this.postCommentsElements = 0;
        this.postUrlSN = "";
        this.postOrigin = "";
        this.jsonQueryFilterCommentImages_ = { "size": 10, "sort": [{ "totalLikes": { "order": "desc" } }], "query": { "bool": { "must": [{ "match_phrase": { "idPost": "116842558326954_2011681655509692" } }, { "match_phrase": { "type": "attachment" } }, { "exists": { "field": "linkAttachment" } }] } } };
        this.jsonQueryFilterTopComment_ = { "version": true, "size": 5, "sort": [{ "totalLikes": { "order": "desc" } }], "query": { "bool": { "must": [{ "match_all": {} }, { "match_phrase": { "idPost": "111416968911423_1622493664470405" } }, { "match_phrase": { "type": "text" } }] } } };
        this.hideFacebookVideoLoading = true;
        this.modalSectionBlock = false;
        this.inputLoaded =  false;
        
        this.postId = "";
        this.currentLogin = "";
    }
    @ViewChild(FBVideoComponent) video: FBVideoComponent;



    /* catch the JSON with the link */
    @Input()
    set localModalPreview(modalMessage: any) {

        if (modalMessage !== undefined) {
            this.network = modalMessage["network"];

            this.modalSectionBlock = true;//start blocking
            this.validateLinkPost =  true;
            this.postType = modalMessage["type"];
            this.postLink = modalMessage["link"];
            this.postAttachmentNull = modalMessage["attachmentNull"];

            // Get current video type
            if(this.postType == 'video'){

                if(this.postLink.includes('facebook.com/')){
                    this.hideFacebookVideoLoading = false;
                    setTimeout(() => { 
                        window.FB.XFBML.parse();
                    },1000);
                }else if(this.postLink.includes('youtube.com/')){
                    this.yt_iframe_html = this.embedService.embed(this.postLink.split("&")[0], {attr: { width:"100%",height: 280 }});
                }else if(this.postLink.includes('vimeo.com/')){
                    this.vimeo_iframe_html = this.embedService.embed(this.postLink, {attr: {width:"100%", height: 280 }});
                }else{
                    this.postAttachmentNull = true;
                }
            }

            this.postLinkSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.postLink);      

            // Get current video type
            if(this.network == 'Facebook'){
                this.postUrlSN = "https://www.facebook.com/" + modalMessage["idPost"];

            }else{
                this.postUrlSN = modalMessage["link"];
            }

            this.postURL = modalMessage["url"];

            this.postMessage = modalMessage["postMessage"];
            this.postTitle = modalMessage["postTitle"];
            this.index = modalMessage["index"];
            
            this.postLikes = modalMessage["totalLikes"];
            this.postComments = modalMessage["totalComments"];
        
            this.postShares = modalMessage["totalShares"];
            this.postViews = modalMessage["totalViews"];
            this.postOrigin = modalMessage["origin"];
            this.postPictureLink = modalMessage["pictureLink"];
            this.postDateTime = modalMessage["@timestamp"];
            this.postIdOrigin =  modalMessage["idPost"].split('_')[0];

            this.postId = modalMessage["idPost"]
            this.currentLogin = modalMessage["currentLogin"];

            this.jsonQueryFilterCommentImages_["query"]["bool"]["must"][0]["match_phrase"]["idPost"] = modalMessage["idPost"];
            this.jsonQueryFilterTopComment_["query"]["bool"]["must"][1]["match_phrase"]["idPost"] = modalMessage["idPost"];

            this.getTopComments(5);
            this.getCommentsImages(100);
            this.jsonQueryFilterCommentImages_.size = 10;

       

          
        }

    }


    ngOnInit() {
       
    }
    ngAfterViewInit() {
     

    }
    destryModal() {      
       

       this.inputLoaded = false;
       this.hideFacebookVideoLoading = true;
       this.validateLinkPost = false;

       $(".nav-link").removeClass("active");
       $('.nav-tabs li:nth-child(3) a').addClass('active');

       $(".tab-pane").removeClass("active");
       $('.tab-content div:nth-child(3)').addClass('active');
       
    }

    getCommentsImages(topSize) {

        this.jsonQueryFilterCommentImages_.size = topSize;
        this._commentService.getListComments(this.jsonQueryFilterCommentImages_, this.index).subscribe(result => {
            let tempResponse = result;
            this.commentsDataImages = result["hits"]["hits"];
            /* loaded */
            this.inputLoaded = true;
        },
            error => {
                console.log(error);
            });
    }
    getTopComments(topSize) {

;
        this.jsonQueryFilterTopComment_.size = topSize;
        this._commentService.getListComments(this.jsonQueryFilterTopComment_, this.index).subscribe(result => {
            let tempResponse = result;
            this.commentsDataTop = result["hits"]["hits"];
            this.modalSectionBlock = false;// Stop blocking

            if(this.commentsDataTop.length == 0){
                this.postCommentsElements = 0;
            }
        },
            error => {
                console.log(error);
            });
    }





    /* Menu*/

    showMessage(){
        setTimeout(function(){
            $("#header-menu-id").click();
        }, 50);
        this.toastr.info('Proximamente Disponible','Acceso a Feature');
    }

    /* actions*/

    goLink(link){
        window.open(link,'_blank');
    }

    /* verif image size beforedownloading */
    verifImageSize(element,index) {
       if(element.naturalWidth == 1){
         this.commentsDataImages.splice(index, 1);
       }
        
    }

    /* verif image is not broken */
    verifImageError(index) {
        this.commentsDataImages.splice(index, 1);  
    }


    /* extras*/


    validateIframeLiskPost(id){

        if(id.contentWindow.length > 0){
            this.validateLinkPost =  true;
        }else{
            this.validateLinkPost = false;
        }
    }

} 
