import { Component, OnInit, ViewEncapsulation, AfterViewInit } from '@angular/core';

import { AnychartServiceService } from "../../../_services/anychart-service/anychart-service.service";

import { ToastrService } from 'ngx-toastr';

import { environment } from '../../../../environments/environment';



declare let mLayout: any;
@Component({
    selector: "app-header-nav",
    templateUrl: "./header-nav.component.html",
    styleUrls: ["./header-nav.component.css"],
    encapsulation: ViewEncapsulation.None,
    host: {
        '(window:resize)': 'onResize()'
     }
  
})
export class HeaderNavComponent implements OnInit, AfterViewInit {
    user: any;
    ismobile:boolean;

    currentValue = 'data1';

    menuMoreActivated:boolean;

    currentLoginProvider:string;


    constructor(
        private toastr: ToastrService,
        private anyChartService_: AnychartServiceService) {
        
        this.ismobile = false;

        this.user = [];    

        this.menuMoreActivated = false;


        this.currentLoginProvider = environment.user.provider; 

    }

    valuesListMap: Array<string> = this.anyChartService_.getDataList();
    ngOnInit() {
       this.user = {"name":environment.user.name,"email":environment.user.email,"image":environment.user.image}

        /*if is mobile*/
      if (window.screen.width <= 992) { // 768px portrait
            this.ismobile = true;
      }

      this.currentLoginProvider = environment.user.provider; 

    }

    ngAfterViewInit() {

        mLayout.initHeader();

    }

    onChange($event) {
        this.anyChartService_.setCurrentDataSet(this.currentValue);

    }

    onResize(){
          /*if is mobile*/
      if (window.screen.width <= 992) { // 768px portrait
        this.ismobile = true;
      }else{
        this.ismobile = false;
        }
    }



    activateMenuMore(){
        this.menuMoreActivated = !this.menuMoreActivated;
    }


    showMessage(){
        setTimeout(function(){
            $("#header-menu-id").click();
        }, 50);
        this.toastr.info('Proximamente Disponible','Acceso a Feature');

    }


}