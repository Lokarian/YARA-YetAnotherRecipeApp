import {Component, OnInit} from '@angular/core';
import {RequestService} from "../../services/request.service";
import {BehaviorSubject,Subject, combineLatest, debounceTime, first, map, Observable, share, switchMap, tap} from "rxjs";
import {DomSanitizer} from "@angular/platform-browser";
import {ActivatedRoute} from "@angular/router";
import {CurrentUserService} from "../../services/current-user.service";

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
  //get recipebook id from url, make backend call to get recipes for that recipebook
  public recipeBook$: Observable<any> = this.activatedRoute.params.pipe(switchMap((data) => this.requestService.get<any>(`recipeBooks/${data["id"]}/`).pipe(tap(book => this.evaluateEditable(book)))));
  public canEdit = false;
  private reload$ = new Subject<void>();

  constructor(
    private requestService: RequestService,
    private domSanitizer: DomSanitizer,
    private currentUserService: CurrentUserService,
    private activatedRoute: ActivatedRoute
  ) {
  }

  ngOnInit() {
    this.recipes$ = combineLatest([this.pageNumber$.asObservable(), this.searchTextSubject.asObservable(), this.activatedRoute.params.pipe(map(x => x["id"])),this.reload$]).pipe(
      debounceTime(300), // Add debounce time to avoid frequent API calls while typing
      switchMap(([pageNumber, searchText, recipeBookId]) => {
        return this.requestService
          .get<{
            count: number;
            next: string;
            previous: string;
            results: any[];
          }>(`recipes/?recipe_book=${recipeBookId}&page=${pageNumber}&search=${searchText}`)
          .pipe(
            tap((pagination) => {
              if (pagination.results.length === 0 && pageNumber > 1) {
                // If no results on a subsequent page, reset to page 1
                this.pageNumber$.next(1);
              }
            })
          );
      }), share()
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
    if (imageUrl.startsWith("http://") && window.location.protocol == "https:") {
      imageUrl = imageUrl.replace("http://", "https://");
    }
    return this.domSanitizer.bypassSecurityTrustUrl(imageUrl);
  }

  private evaluateEditable(book: any) {
    this.currentUserService.currentUser$.pipe(first()).subscribe(user => {
      this.canEdit = (book.users as any[]).some(userAccess => userAccess.user_id === user.id && userAccess.access_level === "Full");
    });
  }

  delete(recipe: any,event:any) {
    event.stopPropagation();
    event.preventDefault();
    this.requestService.delete(`recipes/${recipe.id}/`).subscribe(() => {
      this.reload$.next();
    });
  }
}
