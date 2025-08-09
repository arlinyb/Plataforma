import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { Helpers } from '../../../helpers';
import { ScriptLoaderService } from '../../../_services/script-loader.service';

import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { environment } from '../../../../environments/environment';
import { DomSanitizer, SafeResourceUrl, } from '@angular/platform-browser';


@Component({
    selector: 'app-reports',
    templateUrl: './reports.component.html',
    styleUrls: ["../sections.component.css", "./reports.component.css"],
    host: {
        '(window:resize)': 'verifWidth()'
    }

})
export class ReportsComponent implements OnInit {
    @BlockUI() blockUI: NgBlockUI;
    public screenWidth: number;

    public reportNull: boolean;
    public ismobile: boolean;
    public current_l0: string;
    public current_l1: string;

    public reportList: any;
    public current_report: any;
    public current_urlReport: SafeResourceUrl;

    dbBusinessListNames: AngularFireObject<any>;
    dbBusinessData: AngularFireObject<any>;

    dbBusinessReportsList: AngularFireObject<any>;



    constructor(
        public db: AngularFireDatabase,
        public sanitizer: DomSanitizer
    ) {
        this.current_l0 = "";
        this.current_l1 = "";
        this.reportList = [];
        this.current_report = [];
        this.reportNull = false;

    }

    ngOnInit() {

      //if is not a trial user
        if (environment.user.provider != "facebook.com") {
            this.blockUI.start(); // Start blocking
            this.getUserCurrentProfileInfo_env();
        }
        else {
            this.blockUI.stop(); // Stop blocking
            this.current_l1 = environment.user.currentProfile.current_l1;
            this.getBusinessData(["demo"]);
         }

      
    }


    /* Firebase Current Info Onload*/
  

    getUserCurrentProfileInfo_env() {
        if (environment.user.currentProfile.current_index == '') {
            this.db.object('users/' + environment.user.uid + "/default_selection/").query.once('value').then(defaultSelection => {
                environment.user.currentProfile.current_l1 = defaultSelection.val()["l1"];
                this.current_l1 = environment.user.currentProfile.current_l1;
                this.getBusinessReportList();
            });
        } else {
            this.current_l1 = environment.user.currentProfile.current_l1;
            this.getBusinessReportList();
        }
    }



    /* Firebase Get User Data */
    getBusinessReportList() {
            this.db.object('users/' + environment.user.uid + "/business").query.once('value').then(businessNames => {

            let businessListNames = businessNames.val();
            this.getBusinessData(businessListNames);
        });


    }

    getBusinessData(businessListNames){
        for (let i = 0; i < businessListNames.length; i++) {

            this.db.object('business/' + businessListNames[i]).query.once('value').then(businessData => {
            if (businessData.val().name == this.current_l1) {
                if (businessData.val().reports != undefined) {

                    this.reportList = businessData.val().reports;
                    this.current_report = this.reportList[0];
                    this.current_urlReport = this.sanitizer.bypassSecurityTrustResourceUrl(this.current_report.link);

                    /* Google Analytics */
                    (<any>window).ga('send', 'event', {
                        eventCategory: this.current_l1,
                        eventAction: "Reports",
                        eventLabel: this.current_report.name,
                        eventValue: 1
                    });
                } else {
                    this.reportNull = true;
                }
                this.blockUI.stop();
            }
        });

    }
    }


    changeReport(item) {
        /* Google Analytics */
        (<any>window).ga('send', 'event', {
            eventCategory: this.current_l1,
            eventAction: "Reports",
            eventLabel: this.current_report.name,
            eventValue: 1
        });

        this.current_report = item;
        this.current_urlReport = this.sanitizer.bypassSecurityTrustResourceUrl(this.current_report.link);

    }

    verifWidth() {
        this.screenWidth = window.screen.width;
        if (window.screen.width <= 768) { // 768px portrait
            this.ismobile = true;
        } else {
            this.ismobile = false;
        }
    }

} 
