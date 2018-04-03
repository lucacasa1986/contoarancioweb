import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import 'rxjs/add/operator/shareReplay';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable()
export class AuthService {


  constructor(private http: HttpClient, private jwtHelper:JwtHelperService) {
  }
    
  login(email:string, password:string ) {
      const endpoint = '/api/login';
      const formData: FormData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      return this.http.post(endpoint, formData)
          // this is just the HTTP call, 
          // we still need to handle the reception of the token
          .shareReplay();
  }

  signup(email:string, password:string ) {
    const endpoint = '/api/register';
    const formData: FormData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    return this.http.post(endpoint, formData, {responseType: 'text'})
        // this is just the HTTP call, 
        // we still need to handle the reception of the token
        .shareReplay();
}

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    // Check whether the token is expired and return
    // true or false
    return !this.jwtHelper.isTokenExpired(token);
  }

}
