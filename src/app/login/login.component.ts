import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    // Check if the user is already authenticated--if so, just redirect to the dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(e: Event) {
    // Handle login logic here
    e.preventDefault();
    const username = (document.getElementById('username') as HTMLInputElement)
      .value;
    const password = (document.getElementById('password') as HTMLInputElement)
      .value;

    this.authService.login(username, password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        if (err.status == 404) {
          this.notificationService.showNotification(
            'User not found. Please check the username and try again.'
          );
        } else if (err.status == 401) {
          this.notificationService.showNotification(
            'Incorrect password. Please try again.'
          );
        } else if (err.status == 400) {
          this.notificationService.showNotification(
            'Please provide both a username and password for login.'
          );
        } else if (err.status == 500) {
          this.notificationService.showNotification(
            'Please fill out all required information and try again.'
          );
        }
      },
    });
  }
}
