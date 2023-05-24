import {Component, Input} from '@angular/core';
import {RequestService} from "../../services/request.service";
import {CurrentUserService} from "../../services/current-user.service";
import {map, share, switchMap} from "rxjs";

@Component({
  selector: 'app-recipe-book-list',
  templateUrl: './recipe-book-list.component.html',
  styleUrls: ['./recipe-book-list.component.css']
})
export class RecipeBookListComponent {
  @Input() writeOnly = false;
  public books$ = this.currentUserService.currentUser$.pipe(
    switchMap(user => {
      if (user) {
        // Store the user in a variable for later use
        const userId = user.id;
        return this.requestService.get<any[]>(`recipeBooks/`).pipe(
          map(books => {
            return books.map(book => {
              return {
                ...book,
                editable: (book.users as any[]).some(userAccess => userAccess.user_id === userId&&userAccess.access_level==="Full")
              };
            });
          })
        );
      }
      return [];
    })
  );

  constructor(private requestService: RequestService, private currentUserService: CurrentUserService) {
  }

}
