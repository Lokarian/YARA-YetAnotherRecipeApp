import { Component } from '@angular/core';
import {RequestService} from "../../services/request.service";
import {Observable} from "rxjs";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css']
})
export class RecipeListComponent {

    public recipes$:Observable<any[]> = this.requestService.get("recipes");
    constructor(private requestService: RequestService,private domSanitizer: DomSanitizer) {
    }

    sanitizeImageUrl(imageUrl: string) {
        return this.domSanitizer.bypassSecurityTrustUrl(imageUrl);
    }
}
