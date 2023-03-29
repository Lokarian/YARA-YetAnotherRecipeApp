import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from "./pages/login/login.component";
import {RegisterComponent} from "./pages/register/register.component";
import {AuthGuard} from "./services/auth.guard";
import {DashboardComponent} from "./pages/dashboard/dashboard.component";

const routes: Routes = [
  {path: "login", component: LoginComponent, pathMatch: "full"},
  {path: "register", component: RegisterComponent, pathMatch: "full"},
  {
    path: "",
    canActivate: [AuthGuard],
    children: [
      {path: "", component:DashboardComponent, pathMatch: "full"},
    ],
  }


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
