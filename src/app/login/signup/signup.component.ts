import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl, ValidatorFn, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

export class PasswordValidation {

  static MatchPassword(AC: AbstractControl) {
     let password = AC.get('password').value; // to get value in input tag
     let confirmPassword = AC.get('passwordVerify').value; // to get value in input tag
      if(password != confirmPassword) {
          AC.get('passwordVerify').setErrors( {MatchPassword: true} )
      } else {
          return null
      }
  }
}

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  form:FormGroup;
  passwordCheck:boolean = false;

  constructor(private authService: AuthService, 
    private router: Router) {
    

  }

  ngOnInit() {
    this.form = new FormGroup({
      email: new FormControl('', [
        Validators.required,
        Validators.email
      ]),
      password: new FormControl('', [Validators.required]),
      passwordVerify : new FormControl('', Validators.required)
    }, PasswordValidation.MatchPassword);
  }

  signup() {

    if ( this.form.valid) {
      const val = this.form.value;
      this.authService.signup(val.email, val.password)
          .subscribe(
              res => {
                  this.router.navigateByUrl('/login');
              },
              error => {
                console.log(error);
              }
          );
    }
  }

get email() { return this.form.get('email'); }
get password() { return this.form.get('password');}

}
