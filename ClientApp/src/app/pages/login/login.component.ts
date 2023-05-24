import {Component} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {FormBuilder, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {LocalstoreService} from "../../services/localstore.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  public form = this.formBuilder.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  constructor(private authService: AuthService, private formBuilder: FormBuilder, private activatedRoute: ActivatedRoute, private router: Router, private localStorage: LocalstoreService) {
  }

  login() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const username = this.form.get('username')?.value || "";
    const password = this.form.get('password')?.value || "";
    this.authService.login(username, password).subscribe((success) => {
      if (success) {
        if (this.localStorage.get("redirectUrl")) {
          this.router.navigate([this.localStorage.get("redirectUrl")]);
          this.localStorage.remove("redirectUrl");
        } else {
          this.router.navigate(["/"]);
        }
;
      }
    });
  }
}
