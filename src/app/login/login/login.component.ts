import { Component } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../auth.service";

@Component({
  selector: 'login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
    form:FormGroup;

    constructor(private fb:FormBuilder, 
                 private authService: AuthService, 
                 private router: Router) {

        this.form = this.fb.group({
            email: ['',Validators.required],
            password: ['',Validators.required]
        });
    }

    login() {
        const val = this.form.value;

        if (val.email && val.password) {
            this.authService.login(val.email, val.password)
                .subscribe(
                    res => {
                        console.log("User is logged in");
                        localStorage.setItem("token", res["token"])
                        this.router.navigateByUrl('/');
                    }
                );
        }
    }
}
