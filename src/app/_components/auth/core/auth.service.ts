import { Injectable } from "@angular/core";

import { AngularFireAuth } from '@angular/fire/auth';
import { auth  } from 'firebase/app';
import { environment } from '../../../../environments/environment';

@Injectable()
export class AuthService {

    constructor(
        public afAuth: AngularFireAuth
    ) { }

 
    /*  EMAIL */

     doEmailLogin(value) {
        return new Promise<any>((resolve, reject) => {
            this.afAuth.auth.signInWithEmailAndPassword(value.email, value.password)
                .then(res => {
                    resolve(res);
                }, err => reject(err))
        })
    }


    /*Forgot Pass */

    doForgotEmail(value) {
        return new Promise<any>((resolve, reject) => {
            this.afAuth.auth.sendPasswordResetEmail(value.email)
                .then(res => {
                    resolve(res);
                }, err => reject(err))
        })
    }

    /* TEST SOCIAL */

    doFacebookLogin() {

        return new Promise<any>((resolve, reject) => {
            let provider = new auth.FacebookAuthProvider();
            provider.setCustomParameters({
                'display': 'popup'
              });
            this.afAuth.auth
                .signInWithPopup(provider)
                .then(res => {
                    resolve(res);
                }, err => {
                    console.log(err);
                    reject(err);
                })
        })
    }

    doTwitterLogin() {
        return new Promise<any>((resolve, reject) => {
            let provider = new auth.TwitterAuthProvider();
            this.afAuth.auth
                .signInWithPopup(provider)
                .then(res => {
                    resolve(res);
                }, err => {
                    console.log(err);
                    reject(err);
                })
        })
    }

    doGoogleLogin() {
        return new Promise<any>((resolve, reject) => {
            let provider = new auth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            this.afAuth.auth
                .signInWithPopup(provider)
                .then(res => {
                    resolve(res);
                }, err => {
                    console.log(err);
                    reject(err);
                })
        })
    }



 

    doLogout() {
        let user={uid:"", name:"", email:"", image:"", provider:"", phone:"", currentProfile:{ current_l0:"", current_l1:"", current_l2: "", current_l3: "", current_index:""}};
        environment.user = user;
        return new Promise<void>((resolve, reject) => {
            if (this.afAuth.auth.currentUser) {
                this.afAuth.auth.signOut()
                resolve();
            }
            else {
                reject();
            }
        });
    }


}
