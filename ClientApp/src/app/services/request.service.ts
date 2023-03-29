import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {firstValueFrom} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  // get backendUrl from environment file
  private backendUrl = environment.backendUrl;

  constructor(private http: HttpClient) {

  }

  public async get<T>(endpoint: string): Promise<T> {
    return firstValueFrom(this.http.get<T>(this.backendUrl + endpoint));
  }
  public async post<T>(endpoint: string, data: any): Promise<T> {
    return firstValueFrom(this.http.post<T>(this.backendUrl + endpoint, data));
  }
  public async put<T>(endpoint: string, data: any): Promise<T> {
    return firstValueFrom(this.http.put<T>(this.backendUrl + endpoint, data));
  }
  public async delete<T>(endpoint: string): Promise<T> {
    return firstValueFrom(this.http.delete<T>(this.backendUrl + endpoint));
  }


}
