import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


import { LogoutComponent } from "./_components/auth/logout/logout.component";

import { AuthGuard } from './_components/auth/core/auth.guard';


import { LoginComponent } from './_components/auth/login/login.component';


const routes: Routes = [
    { path: 'login', component: LoginComponent, canActivate: [AuthGuard] },
    { path: 'logout', component: LogoutComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    providers: [AuthGuard]
})
export class AppRoutingModule { }