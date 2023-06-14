import {Component, OnInit} from '@angular/core';
import {RequestService} from "../../services/request.service";
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  first,
  map,
  Observable,
  share,
  Subject,
  switchMap,
  tap
} from "rxjs";
import {DomSanitizer} from "@angular/platform-browser";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css']
})
export class RecipeListComponent implements OnInit {
  public recipes$: Observable<{
    count: number;
    next: string;
    previous: string;
    results: any[];
  }>;
  public pageNumber$: BehaviorSubject<number> = new BehaviorSubject<number>(1);
  public searchTextSubject: BehaviorSubject<string> = new BehaviorSubject<string>("");

  constructor(
    private requestService: RequestService,
    private domSanitizer: DomSanitizer,
    private activatedRoute: ActivatedRoute
  ) {
  }

  ngOnInit() {
    this.recipes$ = combineLatest([this.pageNumber$.asObservable(), this.searchTextSubject.asObservable()]).pipe(
      debounceTime(300), // Add debounce time to avoid frequent API calls while typing
      switchMap(([pageNumber, searchText]) => {
        return this.requestService
          .get<{
            count: number;
            next: string;
            previous: string;
            results: any[];
          }>(`recipes/?page=${pageNumber}&search=${searchText}`)
          .pipe(
            tap((pagination) => {
              if (pagination.results.length === 0 && pageNumber > 1) {
                // If no results on a subsequent page, reset to page 1
                this.pageNumber$.next(1);
              }
            })
          );
      }),share()
    );
  }

  onSearchTextChange($event: Event) {
    const searchText = ($event.target as HTMLInputElement).value;
    this.searchTextSubject.next(searchText);
    this.pageNumber$.next(1); // Reset page number to 1 when search text changes
    console.log(searchText);
  }

  onScroll() {
    //´get current value if recipes and if next page exists, increment page number
    this.recipes$.pipe(first()).subscribe((recipes) => {
      console.log(recipes);
      if (recipes.next) {
        this.pageNumber$.next(this.pageNumber$.value + 1);
      }
    });
  }

  sanitizeImageUrl(imageUrl: string) {
    return this.domSanitizer.bypassSecurityTrustUrl(imageUrl);
  }

  protected readonly event = event;
}
