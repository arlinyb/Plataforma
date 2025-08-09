import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, ViewChild,  ViewEncapsulation } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { Helpers } from "./helpers";
import { SplashScreenService } from './_services/ui-services/splash-screen.service';

/* ngx-translate*/
//import { TranslateService } from "@ngx-translate/core";



@Component({
    selector: "body",
    templateUrl: "./app.component.html",
    encapsulation: ViewEncapsulation.None,
    styleUrls: [
        'app.component.css',
        '../../node_modules/anychart/dist/css/anychart-ui.css',
        '../../node_modules/anychart/dist/fonts/css/anychart-font.min.css'
    ]
})
export class AppComponent implements OnInit {
    public languaje_global: string = "es";

    title = "app";
    globalBodyClass = "m-page--loading-non-block m-page--fluid m--skin- m-content--skin-light2 m-header--fixed m-header--fixed-mobile m-aside-left--enabled m-aside-left--skin-light m-aside-left--fixed m-aside-left--offcanvas m-aside-left--minimize m-brand--minimize m-footer--push m-aside--offcanvas-default";


	@ViewChild('splashScreen', {read: ElementRef})
	splashScreen: ElementRef;
	splashScreenImage: string;

    constructor(
        private _router: Router,
        private splashScreenService: SplashScreenService,

        ) { 
            this._router.events.subscribe(event => {
                if (event instanceof NavigationEnd) {
                  (<any>window).ga('set', 'page', event.urlAfterRedirects);
                  (<any>window).ga('send', 'pageview');
                }
              });
        }

    ngOnInit() {
      //  this._translate.setDefaultLang("es");
      //  this._translate.use("es");

        this._router.events.subscribe(route => {
            if (route instanceof NavigationStart) {
                Helpers.setLoading(true);
                Helpers.bodyClass(this.globalBodyClass);
            }
            if (route instanceof NavigationEnd) {
                Helpers.setLoading(false);
            }
        });


    }


    ngAfterViewInit(): void {
		if (this.splashScreen) {
			this.splashScreenService.init(this.splashScreen.nativeElement);
		}
	}



}