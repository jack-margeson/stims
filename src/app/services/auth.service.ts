import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private base_url = 'http://localhost:3000/';

  constructor(private router: Router, private httpClient: HttpClient) {}

  login(username: string, password: string) {
    return this.httpClient
      .post(`${this.base_url}login`, { username, password })
      .pipe(
        tap((response) => {
          // Save the token to local storage
          localStorage.setItem('stims_user_token', JSON.stringify(response));
        })
      );
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
}
