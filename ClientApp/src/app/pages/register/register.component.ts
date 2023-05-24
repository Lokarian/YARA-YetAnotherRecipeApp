import { Component } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {NotificationService} from "../../services/notification.service";
import {LocalstoreService} from "../../services/localstore.service";
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  public registerForm = new FormGroup({
    userName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, /*Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)*/]),
    confirmPassword: new FormControl('', [Validators.required])
  });

  constructor(private router: Router, private notificationService: NotificationService,private localStorage: LocalstoreService, private authService: AuthService) {
  }
  register() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    if (this.registerForm.controls.password.invalid) {
      this.notificationService.add({
        severity: "error",
        message: "Password must be at least 8 characters long, contain at least 1 uppercase and lowercase letter, 1 number and 1 special character"
      });
      return;
    }
    if (this.registerForm.value.password != this.registerForm.value.confirmPassword) {
      this.notificationService.add({severity: "error", message: "Passwords do not match"});
      return;
    }
    const username = this.registerForm.value.userName!;
    const password = this.registerForm.value.password!;
    const email = this.registerForm.value.email!;
    this.authService.register(username,email, password).subscribe((success) => {
      if (success) {
        if (this.localStorage.get("redirectUrl")) {
          this.router.navigate([this.localStorage.get("redirectUrl")]);
          this.localStorage.remove("redirectUrl");
        } else {
          this.router.navigate(["/"]);
        }
      }
    })
  }


}
