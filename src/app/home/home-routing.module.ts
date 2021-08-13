import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

import { HomeComponent } from './home.component';
import { Shell } from '@app/shell/shell.service';
import { ProfileComponent } from './profile/profile.component';
import { ProgramComponent } from './program/program.component';
import { RecommendationsComponent } from './recommendations/recommendations.component';
import { FormsComponent } from './forms/forms.component';

const routes: Routes = [
  Shell.childRoutes([
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent, data: { title: marker('Home') } },
    { path: 'home/employees', component: ProfileComponent, data: { title: marker('Employees') } },
    { path: 'home/program', component: ProgramComponent, data: { title: marker('Program') } },
    { path: 'home/recommendations', component: RecommendationsComponent, data: { title: marker('Recommendations') } },
    { path: 'home/forms', component: FormsComponent, data: { title: marker('Forms') } },
  ]),
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class HomeRoutingModule {}
