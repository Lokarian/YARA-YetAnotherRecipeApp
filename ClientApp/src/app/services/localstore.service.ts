import {Injectable} from '@angular/core';
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LocalstoreService {

  constructor() {
  }

  public set(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  public get<T>(key: string): T | null {
    const value = localStorage.getItem(key);
    if (value) {
      return JSON.parse(value);
    }
    return null;
  }

  public remove(key: string) {
    localStorage.removeItem(key);
  }

  /**
   * Returns an observable that emits the current value of the key and all future changes
   * @param key
   */
  public asObservable<T>(key: string) {
    return new Observable<T | null>((observer) => {
      observer.next(this.get<T>(key));
      window.addEventListener("storage", (event) => {
        if (event.key === key && event.storageArea === localStorage) {
          if (event.newValue) {
            observer.next(JSON.parse(event.newValue));
          } else {
            observer.next(null);
          }
        }
      })
    })
  }
}
