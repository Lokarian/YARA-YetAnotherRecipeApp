import {Component} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-navbar-wrapper',
  templateUrl: './navbar-wrapper.component.html',
  styleUrls: ['./navbar-wrapper.component.css']
})
export class NavbarWrapperComponent {

  constructor(private authService: AuthService,private activatedRoute: ActivatedRoute, private router: Router) {

  }

  logout() {
    this.authService.logout()
  }

  createNewRecipe() {
    // go to / create if already on create page reload it
    if (this.router.url === '/create') {
      location.reload();
    }
    else {
      this.router.navigate(['/create']);
    }
  }
}
