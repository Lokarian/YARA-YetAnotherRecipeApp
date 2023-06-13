import {Component, OnInit} from '@angular/core';
import {RequestService} from "../../services/request.service";
import {BehaviorSubject, map, Observable, switchMap} from "rxjs";
import {DomSanitizer} from "@angular/platform-browser";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css']
})
export class RecipeListComponent implements OnInit{

  public recipes$: Observable<{
    count: number,
    next: string,
    previous: string,
    results: any[]
  }> = new Observable();
  public searchTextSubject = new BehaviorSubject<string>('');
  public pageNumber = 1;

  constructor(private requestService: RequestService, private domSanitizer: DomSanitizer, private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    //based on if there is an id and the searchText get the recipes from the server
    this.recipes$ = this.activatedRoute.params.pipe(map(params => params['id']),
      switchMap(id => {
        //also account for the search text and page number
        return this.searchTextSubject.asObservable().pipe(switchMap(searchText => {
          return this.requestService.get<{
            count: number,
            next: string,
            previous: string,
            results: any[]
          }>(`recipes/?page=${this.pageNumber}&search=${searchText}&recipe_book=${id}`);

        }));

      }));
  }


  sanitizeImageUrl(imageUrl: string) {
    return this.domSanitizer.bypassSecurityTrustUrl(imageUrl);
  }

}
