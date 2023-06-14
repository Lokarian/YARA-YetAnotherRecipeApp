import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {catchError, Observable, switchMap} from "rxjs";
import {RequestService} from "../../services/request.service";
import {NotificationService} from "../../services/notification.service";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-recipe-view',
  templateUrl: './recipe-view.component.html',
  styleUrls: ['./recipe-view.component.css']
})
export class RecipeViewComponent implements OnInit {

  public recipe$: Observable<any>;

  constructor(private activatedRoute: ActivatedRoute, private requestService: RequestService, private notificationService: NotificationService, private domSanitizer: DomSanitizer) {
  }

  ngOnInit(): void {
    this.recipe$ = this.activatedRoute.params.pipe(switchMap((data) => this.requestService.get<any>(`recipes/${data["id"]}/`)), catchError(e => {
      this.notificationService.error("Could not load recipe");
      return [];
    }));
  }
  sanitizeImageUrl(imageUrl: string) {
    return this.domSanitizer.bypassSecurityTrustUrl(imageUrl);
  }
}
