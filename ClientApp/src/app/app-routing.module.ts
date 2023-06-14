import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from "./pages/login/login.component";
import {RegisterComponent} from "./pages/register/register.component";
import {AuthGuard} from "./services/auth.guard";
import {DashboardComponent} from "./pages/dashboard/dashboard.component";
import {RecipeListComponent} from "./pages/recipe-list/recipe-list.component";
import {NavbarWrapperComponent} from "./components/navbar-wrapper/navbar-wrapper.component";
import {RecipeCreatePage} from "./pages/recipe-create-page/recipe-create-page.component";
import {RecipeBookCreateComponent} from "./pages/recipe-book-create/recipe-book-create.component";
import {RecipeViewComponent} from "./pages/recipe-view/recipe-view.component";

const routes: Routes = [
  {path: "login", component: LoginComponent, pathMatch: "full"},
  {path: "register", component: RegisterComponent, pathMatch: "full"},
  {
    path: "",
    canActivate: [AuthGuard],
    component: NavbarWrapperComponent,
    children: [
      {path: "", component: DashboardComponent, pathMatch: "full"},
      {path: "list/:id", component: RecipeListComponent, pathMatch: "full"},
      {path: "list", component: RecipeListComponent, pathMatch: "full"},
      {path: "create", component: RecipeCreatePage, pathMatch: "full"},
      {path: "edit/:id", component: RecipeCreatePage, pathMatch: "full"},
      {path: "recipe/:id", component: RecipeViewComponent, pathMatch: "full"},
      {path: "recipeBook/new", component: RecipeBookCreateComponent, pathMatch: "full"},
      {path: "recipeBook/:id/edit", component: RecipeBookCreateComponent, pathMatch: "full"},
      {path: "recipeBook/:id", component: RecipeListComponent, pathMatch: "full"},

    ],
  }


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
