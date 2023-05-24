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
    window.dispatchEvent(new StorageEvent("storage", {
      key,
      newValue: JSON.stringify(value),
      storageArea: localStorage
    }));

  }

  public get<T>(key: string): T | null {
    const value = localStorage.getItem(key);
    if (value !== null) {
      try {
        return JSON.parse(value) as T;
      } catch (e) {
        return value as unknown as T;
      }
    }
    return null;
  }

  public remove(key: string) {
    localStorage.removeItem(key);
    window.dispatchEvent(new StorageEvent("storage", {
      key,
      newValue: null,
      storageArea: localStorage
    }));
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
