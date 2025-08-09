import { Component, OnInit, ViewChild, ViewEncapsulation, AfterContentInit } from '@angular/core';

import { Helpers } from '../../../helpers';
import { ScriptLoaderService } from '../../../_services/script-loader.service';

import { OwlCarousel } from 'ngx-owl-carousel';


import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
import { UserService } from '../../auth/core/user.service';
import { PostsService } from '../../../_services/query-services/posts.service';
import { ToastrService } from 'ngx-toastr';
import { FacebookService, InitParams } from 'ngx-facebook';

import { environment } from '../../../../environments/environment';
import * as moment from 'moment'; // add this 1 of 4

declare let mApp: any;
declare var DatatablesAdvancedColumnRendering: any;
@Component({
   selector: "app-home",
   templateUrl: './home.component.html',
   styleUrls: ["../sections.component.css", "home.component.css"],
   host: {
      '(window:resize)': 'onResize()'
   }


})
export class HomeComponent implements OnInit {

   @ViewChild('owlElement') owlElement: OwlCarousel
   @BlockUI() blockUI: NgBlockUI;


   /** Profile Selector **/
   businessTypeOption: boolean; //is admin
   optionBusinessTypeName: string;
   profileSelectorSectionBlock: boolean;

   userCurrentProfileInfo: AngularFireObject<any>;

   dbBusinessListNames: AngularFireObject<any>;
   businessListNames: any;

   dbBusinessData: AngularFireObject<any>;
   businessDataList: any;
   businessDataListFiltered: any;

   selectedBusiness: any

   current_l0: string;
   current_l1: string;
   current_l2: string;
   current_l3: string;
   current_index: string;
   current_score: number;
   current_l2_reference: string;

   allCategories: boolean;

   categoriesAccordion_activated: boolean;
   profilesAccordion_activated: boolean;

   currentHeightProfilesList: string;

   ismobile: boolean;
   isFirstComponentLoad: boolean;


   optionsCarousel = {
      items: 2,
      lazyLoad:true,
      mouseDrag: true,
      touchDrag: true,
      center: true,
      onChange: (event) => {
         this.changeBusiness(event);
      }

   }




   /*** profile Details ***/
   profileDetailsSectionBlock: boolean;
   currentProfileDetailsOption: string;
   currentProfileDetailsOptionName: string;
   startDateInterval: number;
   endDateInterval: number;
   searchSource: string;
   listSourcesProfile: any;
   listSourcesProfileFiltered: any;
   currentProfileDetailsTimeRange: string
   /* Profile Sources*/
   currentHeightProfileDetailsSourcesList: string;
   profileDetailsSourcesAccordion_activated: boolean;
   jsonQueryFilterListSources_: any;
   constructor(
      public db: AngularFireDatabase,
      private _script: ScriptLoaderService,
      public userService: UserService,
      private toastr: ToastrService,
      private fb: FacebookService,
      private _postService: PostsService


   ) {
      let initParams: InitParams = environment.facebook.initParams;
      fb.init(initParams);


      this.profileSelectorSectionBlock = false;
      this.businessTypeOption = false;
      this.optionBusinessTypeName = "";

      this.businessDataList = [];
      this.businessDataListFiltered = [];
      this.selectedBusiness = [];

      this.current_l0 = "";
      this.current_l1 = "";
      this.current_l2 = "";
      this.current_l3 = "";
      this.current_index = "";
      this.current_score = 0;
      this.current_l2_reference = "";

      this.allCategories = false;
      this.ismobile = false;

      this.categoriesAccordion_activated = false;
      this.profilesAccordion_activated = false;
      this.currentHeightProfilesList = this.profilesHeight();

      this.profileDetailsSectionBlock = false;
      this.currentProfileDetailsOption = "listsources";
      this.currentProfileDetailsOptionName = "Top 15 Influenciadores";
      this.searchSource = "";
      this.listSourcesProfile = [];
      this.listSourcesProfileFiltered = [];
      this.currentHeightProfileDetailsSourcesList = "calc(100vh - 305px)"
      this.profileDetailsSourcesAccordion_activated = false;

      this.jsonQueryFilterListSources_ = {"size":0,"query":{"bool":{"must":[{"range":{"@timestamp":{"gte":0,"lte":0,"format":"epoch_millis"}}},{"match_phrase":{"network":"Facebook"}}],"must_not":[]}},"_source":{"excludes":[]},"aggs":{"sources":{"terms":{"field":"idOrigin","size":15,"order":{"reach":"desc"}},"aggs":{"totalLikes":{"sum":{"field":"totalLikes"}},"totalComments":{"sum":{"field":"totalComments"}},"totalShares":{"sum":{"field":"totalShares"}},"reach":{"sum":{"script":"doc['totalLikes'].value+doc['totalComments'].value+doc['totalShares'].value"}},"origin":{"top_hits":{"size":1,"_source":{"includes":["origin"]}}}}}}}
   }



   ngOnInit() {

      this.blockUI.start(); // Start blocking
      this.startBlockUIOption('p_selector');  //start block
      this.startBlockUIOption('p_details');  //start block




      this.isFirstComponentLoad = true;


      this._script.loadScripts('body', [
         'assets/vendors/custom/owl-carousel/owl.carousel.js',
         'assets/vendors/custom/datatables/datatables.bundle.js',
         'assets/app/js/sections/home/table-sourceslist.js'
      ], true).then(() => {
         Helpers.setLoading(false);
      });




      /*if is mobile*/
      this.verifIsMovil();


      //if is not a trial user
      if (environment.user.provider != "facebook.com") {
         this.db.object('users/' + environment.user.uid).query.once('value').then(optionBusiness => {
            if (optionBusiness.child("isAdmin").exists()) {
               this.businessTypeOption = optionBusiness.val()["isAdmin"];
            }
            this.blockUI.stop(); // Stop blocking

            /* Get Current Info Profile*/
            this.getUserCurrentProfileInfo_env(optionBusiness.val()['default_selection']);

            /* Get Business Data */
            this.getBusinessListNames(optionBusiness.val()['business']);
         });
      }
      else {
         this.blockUI.stop(); // Stop blocking


         var trial = {"index": "crfb", "l0": "brands", "l1": "Demo", "l2": "Tendencia", "l3": "Medios Costa Rica"};

          /* Get Trial Profile Info */
         this.getUserCurrentProfileInfo_env(trial);

          /* Get Trial Business Data */
          this.getBusinessListNames(["demo"]);
      }

   }




   /* Firebase Current Info Onload*/
   getUserCurrentProfileInfo_env(defaultSelection) {

      environment.user.currentProfile.current_l1 = defaultSelection["l1"];
      environment.user.currentProfile.current_l2 = defaultSelection["l2"];
      environment.user.currentProfile.current_l3 = defaultSelection["l3"];
      environment.user.currentProfile.current_index = defaultSelection["index"];

      environment.user.currentProfile.current_l0 = defaultSelection["l0"];
      this.nameBusinessType(defaultSelection["l0"]);

      this.current_l1 = environment.user.currentProfile.current_l1;
      this.current_l2 = environment.user.currentProfile.current_l2;
      this.current_l3 = environment.user.currentProfile.current_l3;
      this.current_index = environment.user.currentProfile.current_index;
      this.current_l2_reference = this.current_l2;


   }

   /* Firebase Get User Data */
   getBusinessListNames(businessListNames) {
      let indexBusinessSelected = 0;
      for (let i = 0; i < businessListNames.length; i++) {

         this.db.object('business/' + businessListNames[i]).query.once('value').then(businessData => {
            this.businessDataList.push(businessData.val());
            if (businessData.val().type == this.current_l0) {
               this.businessDataListFiltered.push(businessData.val());

               if (this.current_l1 == businessData.val().name) {
                  indexBusinessSelected = this.businessDataListFiltered.length - 1;
                  this.selectedBusiness = businessData.val();

               }
            }
            if (i == (businessListNames.length - 1)) {
               //set current position
               // indexBusinessSelected = 0;
               setTimeout(()=>{
                  this.owlElement.to([indexBusinessSelected, 200]);

                  indexBusinessSelected = 0;
                  this.stopBlockUIOption('p_selector');  //start block

                  this.updateProfileDetailsTimeRange('last1day')
               },1000);
               
            }
         });
      };
   }

   /* Firebase Set New Profile */
   setNewProfile(profileName, index) {
      if (this.current_index != index) {
         this.startBlockUIOption('p_selector');  //start block

         this.current_index = index;
         this.current_l3 = profileName;

         environment.user.currentProfile.current_l0 = this.current_l0;
         environment.user.currentProfile.current_l1 = this.current_l1;
         environment.user.currentProfile.current_l2 = this.current_l2;
         environment.user.currentProfile.current_l3 = this.current_l3;
         environment.user.currentProfile.current_index = this.current_index;
         this.current_l2_reference = this.current_l2;

         this.getDatabyProfileOption()

         //if is admin
         var queryUpdateDefault = { "l0": this.current_l0, "l1": this.current_l1, "l2": this.current_l2, "l3": profileName, "index": index };

         var updateUserDefault = this.db.object('users/' + environment.user.uid + "/default_selection");

         /* Google Analytics */
         (<any>window).ga('send', 'event', {
            eventCategory: this.current_l1,
            eventLabel: this.current_index,
            eventAction: environment.user.uid,
            eventValue: 1 //Change Index 
         });

         updateUserDefault.update(queryUpdateDefault).then(
            res => {

               this.stopBlockUIOption('p_selector');  //start block
            }, err => {
               console.log(err)
               this.stopBlockUIOption('p_selector');  //start block
            });
      }
   }


   /***********************************************/
   nameBusinessType(type) {
      this.current_l0 = type;
      if (type == 'politics') {
         this.optionBusinessTypeName = "Política";
      } else if (type == 'brands') {
         this.optionBusinessTypeName = "Marcas";
      } else {
         this.optionBusinessTypeName = "Todos";
      }
   }

   updateBusinessType(type) {
      this.nameBusinessType(type);
      this.filterBusinessType(this.businessDataList);
   }


   filterBusinessType(listBusiness) {
      let filteredList = [];
      if (this.current_l0 != 'all') {
         for (let business of listBusiness) {
            if (business.type == this.current_l0)
               filteredList.push(business)
         }
      } else {
         filteredList = this.businessDataList;
      }
      this.businessDataListFiltered = filteredList;
      this.selectedBusiness = this.businessDataListFiltered[0];
      this.current_l1 = this.selectedBusiness.name;
      this.current_l2 = this.selectedBusiness.profiles[0].category;
   }


   /* Business */
   changeBusiness($event): void {
      if (Number.isInteger($event.property.value)) {
         var businessListOption = [];
         for (let index = 0; index < this.businessDataList.length; index++) {
            if (this.businessDataList[index].type == this.current_l0) {
               businessListOption.push(this.businessDataList[index]);
            }

         }
         this.selectedBusiness = businessListOption[$event.property.value];
         this.current_l1 = this.selectedBusiness.name;
         if (this.current_l1 == environment.user.currentProfile.current_l1) {
            this.current_l2 = environment.user.currentProfile.current_l2;
         }
         else {
            this.current_l2 = this.selectedBusiness.profiles[0].category;
         }
      }
   }

   changeBusinessClick(index) {
      this.owlElement.to([index, 200]);
   }


   /* Categories */

   selectCategory(categoryName) {
      if (categoryName != '_all_') {
         this.allCategories = false;
         this.current_l2 = categoryName;
      } else {
         this.allCategories = true;
      }
   }


   /*  Profiles  */
   profilesHeight() {
      var scrollHeight;
      if (window.innerWidth >= 1200) {
         var footer_menu = 90 + 53;
         var padding = 60;
         var porletRest = 71 + 115 + 91 + 14;
         scrollHeight = (window.innerHeight - (footer_menu + padding + porletRest + 20))
         if (scrollHeight < 140)
            scrollHeight = 140;
      } else {
         scrollHeight = 365;
      }

      return scrollHeight + 'px';
   }


   /* Profile selector tools */
   changeCategoriesAccordion() {
      this.categoriesAccordion_activated = !this.categoriesAccordion_activated;
   }
   changeProfilesAccordion() {
      this.profilesAccordion_activated = !this.profilesAccordion_activated;
   }



   onResize() {
      this.currentHeightProfilesList = this.profilesHeight();

      this.verifIsMovil();
   }







   /* Profile Details */

   setProfileDetailsOption(option) {
      if (this.currentProfileDetailsOption != option) {
         switch (option) {
            case "listsources": {
               this.currentProfileDetailsOption = "listsources";
               this.currentProfileDetailsOptionName = "Top 15 Influenciadores";
            }

         }
      }
   }

   updateProfileDetailsTimeRange(value) {

      switch (value) {
         case ('last1day'): {
            this.currentProfileDetailsTimeRange = "Ayer a Hoy";
            this.startDateInterval = moment().subtract(1, 'days').toDate().getTime();
            this.endDateInterval = moment().toDate().getTime();
            break;
         }
         case ('last7days'): {
            this.currentProfileDetailsTimeRange = "Últimos 7 días";
            this.startDateInterval = moment().subtract(6, 'days').toDate().getTime();
            this.endDateInterval = moment().toDate().getTime();
            break;
         }
         case ('last30days'): {
            this.currentProfileDetailsTimeRange = "Últimos 30 días";
            this.startDateInterval = moment().subtract(29, 'days').toDate().getTime();
            this.endDateInterval = moment().toDate().getTime();
            break;
         }
         case ('last3months'): {
            this.currentProfileDetailsTimeRange = "Últimos 3 meses";
            this.startDateInterval = moment().subtract(3, 'month').toDate().getTime();
            this.endDateInterval = moment().toDate().getTime();
            break;
         }
         case ('all'): {
            this.currentProfileDetailsTimeRange = "Completo";
            this.startDateInterval = moment("2015-1-1").toDate().getTime();
            this.endDateInterval = moment().toDate().getTime();
            break;
         }

      }


      this.jsonQueryFilterListSources_.query.bool.must[0].range['@timestamp'].gte = this.startDateInterval;
      this.jsonQueryFilterListSources_.query.bool.must[0].range['@timestamp'].lte = this.endDateInterval;


      //get new sources
      this.getDatabyProfileOption();
   }



   //get data determined by profile option
   getDatabyProfileOption() {
      if (this.currentProfileDetailsOption == "listsources") {
         this.getDataListSources();
      }
   }



   /* Profile Sources List*/
   getDataListSources() {
      this.startBlockUIOption('p_details') // Start blocking

      DatatablesAdvancedColumnRendering.clear();
      this.listSourcesProfileFiltered = [];

      this._postService.getListSources(this.jsonQueryFilterListSources_, this.current_index).subscribe(result => {
         let tempResponse = result;

         this.listSourcesProfile = tempResponse["aggregations"]["sources"]["buckets"];

         this.setListSourcesProfile();


      },
         error => {
            console.log(error);
         })
   }


   setListSourcesProfile() {

      var cont = 0;


      //  for (let source of this.listSourcesProfile) {
      for (let index = 0; index < this.listSourcesProfile.length; index++) {

         this.fb.api('/' + this.listSourcesProfile[index].key + '?fields=access_token,category,display_subtext,location,name,picture,about,link,website,rating_count,fan_count&access_token=' + environment.facebook.accessToken).then(
            res => {
               this.listSourcesProfile[index].info = { "category": "", "display_subtext": "erer", "location": { "city": "", "country": "" }, "name": "", "picture": "", "about": "", "link": "", "website": "","rating_count":"","fan_count":"" };
               this.listSourcesProfile[index].info.name = res.name;
               this.listSourcesProfile[index].info.picture = res.picture.data.url;
               res.category != null ? this.listSourcesProfile[index].info.category = res.category : this.listSourcesProfile[index].info.category = "";
               res.display_subtext != null ? this.listSourcesProfile[index].info.display_subtext = res.display_subtext : this.listSourcesProfile[index].info.display_subtext = "";
               if (res.location != null) {
                  res.location.country != null ? this.listSourcesProfile[index].info.location.country = res.location.country : this.listSourcesProfile[index].info.location.country = "";
                  res.location.city != null ? this.listSourcesProfile[index].info.location.city = res.location.city : this.listSourcesProfile[index].info.location.city = "";
               }
               res.about != null ? this.listSourcesProfile[index].info.about = res.about : this.listSourcesProfile[index].info.about = "";
               res.link != null ? this.listSourcesProfile[index].info.link = res.link : this.listSourcesProfile[index].info.link = "";
               res.website != null ? this.listSourcesProfile[index].info.website = res.website : this.listSourcesProfile[index].info.website = "";

               res.rating_count != null ? this.listSourcesProfile[index].info.rating_count = res.rating_count : this.listSourcesProfile[index].info.rating_count = "";
               res.fan_count != null ? this.listSourcesProfile[index].info.fan_count = res.fan_count : this.listSourcesProfile[index].info.fan_count = "";

               // this.listSourcesProfileFiltered.push(source);
               if (cont == (this.listSourcesProfile.length - 1)) {
                  this.listSourcesProfileFiltered = this.listSourcesProfile;
                  setTimeout(() => {
                     DatatablesAdvancedColumnRendering.init();
                  }, 300);

                  setTimeout(() => {
                     this.stopBlockUIOption('p_details') // Stop blocking
                  }, 900);

               }
               cont++;
            }
         );


      }

   }



   searchSourceList() {
      let term = this.searchSource;
      /*this.listSourcesProfileFiltered = this.listSourcesProfile.filter(function(tag) {
          return tag.name.indexOf(term) >= 0;
      });*/
   }

   changeProfileDetailsSourcesAccordion() {
      this.profileDetailsSourcesAccordion_activated = !this.profileDetailsSourcesAccordion_activated;
   }









   /*Extras*/

   /* block ui*/


   startBlockUIOption(value) {
      if (value == 'p_selector') {
         this.profileSelectorSectionBlock = true;
      }
      else if (value == 'p_details') {
         this.profileDetailsSectionBlock = true;
      }
   }
   stopBlockUIOption(value) {
      if (value == 'p_selector') {
         this.profileSelectorSectionBlock = false;
      }
      else if (value == 'p_details') {
         this.profileDetailsSectionBlock = false;
      }
   }

   verifIsMovil() {
      if (window.screen.width <= 480) { // 768px portrait
         this.categoriesAccordion_activated = true;
         this.profilesAccordion_activated = true;
         this.profileDetailsSourcesAccordion_activated = true;
      }

      if (window.screen.height >= 1180) {
         this.currentHeightProfileDetailsSourcesList = "940px"

      } else {
         this.currentHeightProfileDetailsSourcesList = "calc(100vh - 305px)"

      }
   }

   showMessage() {
      setTimeout(function () {
         $("#header-menu-id").click();
      }, 50);
      this.toastr.info('Proximamente Disponible', 'Acceso a Feature');

   }





}


