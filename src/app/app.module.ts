import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule,ReactiveFormsModule } from '@angular/forms';



import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ScriptLoaderService } from "./_services/script-loader.service";

import { HttpClientModule, HttpClient } from "@angular/common/http";


//Services
import { AnychartServiceService } from './_services/anychart-service/anychart-service.service';



// Modules 
import { SectionsModule } from './_components/sections/sections.module';
import { SectionsRoutingModule } from './_components/sections/sections-routing.module';

// Firebase 
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule  } from '@angular/fire/database';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from '../environments/environment';

import { AuthGuard } from './_components/auth/core/auth.guard';
import { AuthService } from './_components/auth/core/auth.service';
import { UserService } from './_components/auth/core/user.service';
import { SplashScreenService } from './_services/ui-services/splash-screen.service';

import { AlertService } from './_components/auth/core/alert.service';
import { AlertComponent } from './_components/auth/directives/alert.component';



import { LogoutComponent } from './_components/auth/logout/logout.component';
import { LoginComponent } from './_components/auth/login/login.component';
import { UserResolver } from './_components/auth/user/user.resolver';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';





@NgModule({
    declarations: [AppComponent,
        LogoutComponent,
        LoginComponent,
        AlertComponent,

    ],
    imports: [
        //UX
        NgbModule.forRoot(),
        FormsModule,
        ReactiveFormsModule,
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        // ThemeRoutingModule, 
        
        SectionsRoutingModule,
        HttpClientModule,
 
        SectionsModule,
        // WarningsModule,

        AngularFireModule.initializeApp(environment.firebase),
        AngularFireDatabaseModule , // imports firebase/firestore, realtime database
        AngularFireAuthModule, // imports firebase/auth, only needed for auth features,
    ],
    providers: [AuthService, UserService, UserResolver, AuthGuard,AlertService,
        HttpClientModule, ScriptLoaderService,
        AnychartServiceService,SplashScreenService,
        {provide: LocationStrategy, useClass: HashLocationStrategy}
    ],
    entryComponents: [AlertComponent],
    bootstrap: [AppComponent],
    exports: []
})
export class AppModule { }