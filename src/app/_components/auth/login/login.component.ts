import {
    Component,
    ComponentFactoryResolver,
    OnInit,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation,

} from '@angular/core';
import { ScriptLoaderService } from '../../../_services/script-loader.service';

import { AuthService } from '../core/auth.service'
import { AlertService } from '../core/alert.service';
import { AlertComponent } from '../directives/alert.component';

import { Router, Params } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginCustom } from './../helper/login-custom';
import { Helpers } from '../../../helpers';

@Component({
    selector: '.m-grid.m-grid--hor.m-grid--root.m-page',
    templateUrl: 'login.component.html',
    styleUrls: ['login.scss']


})
export class LoginComponent  implements OnInit {



    model: any = {};
    loading = false;

    loginForm: FormGroup;
    errorMessage: string = '';

    @ViewChild('alertSignin',
        { read: ViewContainerRef }) alertSignin: ViewContainerRef;
    @ViewChild('alertSignup',
        { read: ViewContainerRef }) alertSignup: ViewContainerRef;
    @ViewChild('alertForgotPass',
        { read: ViewContainerRef }) alertForgotPass: ViewContainerRef;

 
    constructor(
        private _script: ScriptLoaderService,
        public authService: AuthService,
        private router: Router,
        private fb: FormBuilder,
        private _router: Router,
        private _alertService: AlertService,
        private cfr: ComponentFactoryResolver
    ) {
      /*  this.createForm();*/
    }


    ngOnInit() {

        this._script.loadScripts('body', [
            'assets/vendors/base/vendors.bundle.js',
            'assets/template/base/scripts.bundle.js'], true).then(() => {
                Helpers.setLoading(false);
                LoginCustom.init();
            });


    }


  
 
    showAlert(target) {
        this[target].clear();
        let factory = this.cfr.resolveComponentFactory(AlertComponent);
        let ref = this[target].createComponent(factory);
        ref.changeDetectorRef.detectChanges();
    }





    /* EMAIL */
    tryEmailLogin(value) {
        this.loading = true;
        this.authService.doEmailLogin(value)
            .then(res => {
                this.loading = false;
                this.router.navigate(['/home']);
            }, err => {
                console.log(err);
                this.showAlert('alertSignin');
                this._alertService.error(err);
                this.loading = false;
                this.errorMessage = err.message;
            })
    }

    signup() {
        this.loading = true;
     
    }

    forgotPass(value) {
        this.loading = true;
        this.authService.doForgotEmail(value)
        .then(res => {
                this.showAlert('alertSignin');
                this._alertService.success('Las instrucciones de recuperación de contraseña han sido enviadas a su correo',true);
                this.loading = false;
                LoginCustom.displaySignInForm();
                this.model = {};
       
        }, err => {
            console.log(err);
            this.showAlert('alertForgotPass');
            this._alertService.error(err);
            this.loading = false;
            this.errorMessage = err.message;
        })
    }



    /* TEST Social*/


    createForm() {
        this.loginForm = this.fb.group({
            email: ['', Validators.required],
            password: ['', Validators.required]
        });
    }

    tryFacebookLogin() {
        this.authService.doFacebookLogin()
            .then(res => {
                this.router.navigate(['/home']);
            })
    }

    tryTwitterLogin() {
        this.authService.doTwitterLogin()
            .then(res => {
                this.router.navigate(['/home']);
            })
    }

    tryGoogleLogin() {
        this.authService.doGoogleLogin()
            .then(res => {
                this.router.navigate(['/home']);
            })
    }


}
