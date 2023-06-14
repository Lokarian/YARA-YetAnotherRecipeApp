import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {firstValueFrom, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  // get backendUrl from environment file
  private backendUrl = environment.backendUrl;

  constructor(private http: HttpClient) {

  }
  //wrap all http requests
  public get<T>(url: string, params?: any): Observable<T> {
    return this.http.get<T>(this.backendUrl + url, {params});
  }

  public getBlob(url: string, params?: any): Observable<Blob> {
    return this.http.get(this.backendUrl + url, {params, responseType: "blob"});
  }

  public post<T>(url: string, body: any): Observable<T> {
    return this.http.post<T>(this.backendUrl + url, body);
  }

  public put<T>(url: string, body: any): Observable<T> {
    return this.http.put<T>(this.backendUrl + url, body);
  }

  public delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(this.backendUrl + url);
  }
}
