import { Injectable } from "@angular/core";

import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase,AngularFireObject } from '@angular/fire/database';


@Injectable()
export class UserService {

    constructor(
        public afAuth: AngularFireAuth,
        public db: AngularFireDatabase,

    ) {
    }



    

    /* Get user info*/
      
    getCurrentUser() {
    return new Promise<any>((resolve, reject) => {
        
            var user = this.afAuth.auth.onAuthStateChanged(function(user) {
                if (user) {
                    resolve(user);
                } else {
                    reject('No user logged in');
                }
            })
        })
    }

    /*Update profile info*/

    updateCurrentUser(value) {
        return new Promise((resolve, reject) => {
            var user = this.afAuth.auth.currentUser;
            user.updateProfile({
                displayName: value.name,
                photoURL: user.photoURL,

            }).then(res => {
                resolve();
            }, err => reject(err));
        });
    }


    updateCurrentUserPassword(value) {
        return new Promise((resolve, reject) => {
            var user = this.afAuth.auth.currentUser;
            user.updatePassword(value).then(res => {
                resolve();
            }, err => reject(err));
        });
    }


    

    /*Delete User*/

    deleteCurrentUser() {
        return new Promise((resolve, reject) => {
            var user = this.afAuth.auth.currentUser;
            user.delete().then(res => {
                resolve();
            }, err => reject(err));
        });

    }




}
