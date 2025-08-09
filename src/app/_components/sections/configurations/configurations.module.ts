import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

//ux 
import { AsideNavConfigurationsComponent } from './ux/aside-nav-configurations/aside-nav-configurations.component';

// Components 
import { ConfigurationsComponent } from './configurations.component';
import { ProfileComponent } from './profile/profile.component';
import { UserResolver } from '../../auth/user/user.resolver';

//route





const routes: Routes = [
    {
        "path": "",
        "component": ConfigurationsComponent,
        "children": [
            {
                "path": "configurations",
                "component": ConfigurationsComponent
            },
            {
                "path": "profile",
                "resolve": { "data": UserResolver },
                "component": ProfileComponent
            }
        ]
    }
];


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes),

    ],
    declarations: [ConfigurationsComponent,
        ProfileComponent,
        AsideNavConfigurationsComponent],
    exports: [
        ConfigurationsComponent,
        RouterModule,

    ]
})
export class ConfigurationsModule { }
