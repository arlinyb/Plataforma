import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from "../auth/core/auth.guard";
import { SectionsComponent } from './sections.component';
import { WarningsComponent } from './warnings/warnings.component';
import { UserResolver } from '../auth/user/user.resolver';



const routes: Routes = [
    {
        "path": "",
        "component": SectionsComponent,
        "resolve": { "data": UserResolver },
        "children": [
            {
                "path": "home",
                "loadChildren": ".\/home\/home.module#HomeModule"
            },
            {
                "path": "exploration-posts",
                "loadChildren": ".\/analytics\/exploration-posts\/exploration-posts.module#ExplorationPostsModule"
            },
            {
                "path": "exploration-comments",
                "loadChildren": ".\/analytics\/exploration-comments\/exploration-comments.module#ExplorationCommentsModule"
            },
            {
                "path": "trends",
                "loadChildren": ".\/analytics\/trends\/trends.module#TrendsModule"
            },
            {
                "path": "configurations",
                "loadChildren": ".\/configurations\/configurations.module#ConfigurationsModule"
            },
            {
                "path": "reports",
                "loadChildren": ".\/reports\/reports.module#ReportsModule"
            },
            {
                "path": "",
                "redirectTo": "home",
                "pathMatch": "full"
            }
        ]
    },
    {
        "path": "**",
        "redirectTo": "home",
        "pathMatch": "full"
    }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SectionsRoutingModule { }