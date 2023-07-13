import { Injectable } from '@angular/core';
import {LocalstoreService} from "./localstore.service";
import {AuthService} from "./auth.service";
import {map, of, share, switchMap} from "rxjs";
import {RequestService} from "./request.service";

@Injectable({
  providedIn: 'root'
})
export class CurrentUserService {

  constructor(private localStore: LocalstoreService,private requestService: RequestService) { }

  public currentUser$=this.localStore.asObservable<string>("token").pipe(switchMap(token=> {
    // extract user_id from token
    if (token) {
      return this.requestService.get<any>(`users/current/`);
    }
    return of(null);
  }),share());
}
