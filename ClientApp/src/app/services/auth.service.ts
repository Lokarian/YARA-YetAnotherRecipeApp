import {Injectable} from '@angular/core';
import {RequestService} from "./request.service";
import {LocalstoreService} from "./localstore.service";
import {Router} from "@angular/router";
import {Observable, tap} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private requestService: RequestService, private localStore: LocalstoreService, private router: Router) {
    this.handleTokenChange();
  }


  public login(username: string, password: string): Observable<boolean> {
    return this.requestService.post("login/", {username, password}).pipe(tap((response: any) => {
      this.localStore.set("token", response.token);
    }));
  }

  public register(username: string, email: string, password: string): Observable<boolean> {
    return this.requestService.post("register/", {
      username,
      email,
      password: password,
    }).pipe(tap((response: any) => {
      this.localStore.set("token", response.token);
    }));
  }

  public async logout(): Promise<void> {
    this.localStore.remove("token");
  }

  public isLoggedIn() {
    return !!this.localStore.get("token");
  }

  private handleTokenChange() {
    this.localStore.asObservable("token").subscribe((token) => {
      if (!token) {
        //add current url to redirect to after login if the current url is not login
        if (this.router.url !== "/login" && this.router.url !== "/register") {
          this.localStore.set("redirectUrl", this.router.url);
        }
        this.router.navigate(["/login"]);
      }
    });
  }
}
