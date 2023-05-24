import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { RecipeListComponent } from './pages/recipe-list/recipe-list.component';
import { NavbarWrapperComponent } from './components/navbar-wrapper/navbar-wrapper.component';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from "@angular/common/http";
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import {ReactiveFormsModule} from "@angular/forms";
import {NotificationComponent} from "./components/notification/notification.component";
import {ErrorInterceptor} from "./services/error-interceptor.service";
import { RecipeCreatePage } from './pages/recipe-create-page/recipe-create-page.component';
import {AuthInterceptor} from "./services/auth.interceptor";
import { RecipeBookListComponent } from './components/recipe-book-list/recipe-book-list.component';
import { RecipeBookCreateComponent } from './pages/recipe-book-create/recipe-book-create.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    RecipeListComponent,
    NavbarWrapperComponent,
    NotificationComponent,
    DashboardComponent,
    RecipeCreatePage,
    RecipeBookListComponent,
    RecipeBookCreateComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
