import {Injectable} from '@angular/core';
import {RequestService} from "./request.service";
import {LocalstoreService} from "./localstore.service";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private requestService: RequestService, private localStore: LocalstoreService, private router: Router) {
    this.handleTokenChange();
  }


  public async login(username: string, password: string): Promise<boolean> {
    try {
      const token = this.requestService.post("login", {username, password});
      this.localStore.set("token", token);
      return true;
    } catch (e) {
      return false;
    }
  }

  public async logout(): Promise<void> {
    this.localStore.remove("token");
  }

  public isLoggedIn() {
    return !!this.localStore.get("token");
  }

  private handleTokenChange() {
    this.localStore.asObservable("token").subscribe((token) => {
      if (token) {
        this.router.navigate([""]);
      } else {
        this.router.navigate(["login"]);
      }
    });
  }
}
