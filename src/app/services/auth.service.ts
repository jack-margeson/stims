import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { User } from '../classes/user';
import { tap, catchError } from 'rxjs';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private base_url = 'http://localhost:3000/';

  constructor(private router: Router, private httpClient: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.httpClient
      .post(`${this.base_url}login`, { username, password })
      .pipe(
        tap((response) => {
          // Save the token to local storage
          localStorage.setItem('stims_user_token', JSON.stringify(response));
        })
      );
  }

  register(user: User): Observable<any> {
    return this.httpClient.post(`${this.base_url}register`, {
      username: user.getUsername(),
      email: user.getEmail(),
      first_name: user.getFirstName(),
      last_name: user.getLastName(),
      password: user.getPassword(),
    });
  }

  logout() {
    // Remove saved token from local storage
    localStorage.removeItem('stims_user_token');
    // Redirect to login page
    this.router.navigate(['/login']);
  }

  isAuthenticated() {
    // Check if token exists in local storage
    return localStorage.getItem('stims_user_token') !== null;
  }

  getUser() {
    // Get the user from the token
    if (this.isAuthenticated()) {
      return JSON.parse(localStorage.getItem('stims_user_token')!);
    }
    return null;
  }
}
