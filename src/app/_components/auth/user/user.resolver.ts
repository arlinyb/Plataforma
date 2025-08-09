import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from "@angular/router";
import { UserService } from '../core/user.service';
import { FirebaseUserModel } from '../core/user.model';

import { AngularFireDatabase,AngularFireObject } from '@angular/fire/database';

@Injectable()
export class UserResolver implements Resolve<FirebaseUserModel> {

    userRef: AngularFireObject<any>;


    constructor(
            public userService: UserService,
            private router: Router,
            public db: AngularFireDatabase,

            ) {


             }

    resolve(route: ActivatedRouteSnapshot): Promise<FirebaseUserModel> {

        let user = new FirebaseUserModel();

        return new Promise((resolve, reject) => {
            this.userService.getCurrentUser()
                .then(res => {  

                    if(res.providerData[0].displayName != null)
                        user.name =  res.providerData[0].displayName;
                    else{
                        this.userRef = this.db.object('users/'+res.uid+"/profile/name");
                            this.userRef.snapshotChanges().subscribe(userData => {
                                user.name = userData.payload.val();
                        });
                    }
             
                    if (res.providerData[0].photoURL == null)
                        user.image = 'https://firebasestorage.googleapis.com/v0/b/nairu-d4893.appspot.com/o/NAIRU%2Fassets%2Fuser%2Favatar.png?alt=media&token=c2690d5c-0643-428a-9a79-246abe740489';
                    else
                        user.image = res.providerData[0].photoURL;
                    user.phone = res.providerData[0].phoneNumber;
                    user.provider = res.providerData[0].providerId;
                    user.email = res.providerData[0].email;
                    user.uid = res.uid;
                    (<any>window).ga('set', 'userId', user.uid);

                    return resolve(user);

                }, err => {
                    this.router.navigate(['/login']);
                    return reject(err);
                })
        })
    }


}
