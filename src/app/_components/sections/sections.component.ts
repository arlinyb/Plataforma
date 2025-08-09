import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { Helpers } from '../../helpers';
import { ScriptLoaderService } from '../../_services/script-loader.service';

import { UserService } from '../auth/core/user.service';
import { AuthService } from '../auth/core/auth.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseUserModel } from '../auth/core/user.model';


import { environment } from '../../../environments/environment';

declare let mApp: any;
declare let mUtil: any;
declare let mLayout: any;


@Component({
    selector: 'app-sections',
    templateUrl: "./sections.component.html",
    styleUrls: ["./sections.component.css"]
})
export class SectionsComponent implements OnInit {


    user: FirebaseUserModel = new FirebaseUserModel();
    

    constructor(
        private _script: ScriptLoaderService,
        public userService: UserService,
        public authService: AuthService,
        private route: ActivatedRoute,
        private _router: Router,
        private location: Location,
        private fb: FormBuilder
    ) { }


    ngOnInit() {
        this._script.loadScripts('body', ['assets/vendors/base/vendors.bundle.js', 'assets/template/base/scripts.bundle.js'], true)
            .then(result => {
                Helpers.setLoading(false);
            });
        this.route.data.subscribe(routeData => {
            let data = routeData['data'];
            if (data) {
                this.user = data;
                environment.user.uid = this.user.uid;
                environment.user.name = this.user.name;
                environment.user.email = this.user.email;
                environment.user.image = this.user.image;
                environment.user.provider = this.user.provider              
            }
        })

        this._router.events.subscribe((route) => {
            if (route instanceof NavigationStart) {
                (<any>mLayout).closeMobileAsideMenuOffcanvas();
                (<any>mLayout).closeMobileHorMenuOffcanvas();
                (<any>mApp).scrollTop();
                Helpers.setLoading(true);
                // hide visible popover
                (<any>$('[data-toggle="m-popover"]')).popover('hide');
            }
            if (route instanceof NavigationEnd) {
                // init required js
                (<any>mApp).init();
                (<any>mUtil).init();
                Helpers.setLoading(false);
                // content m-wrapper animation
                let animation = 'm-animate-fade-in-up';
                $('.m-wrapper').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(e) {
                    $('.m-wrapper').removeClass(animation);
                }).removeClass(animation).addClass(animation);
            }
        });


    }




    logout() {
        this.authService.doLogout()
            .then((res) => {
                this.location.back();
            }, (error) => {
                console.log("Logout error", error);
            });
    }

} 