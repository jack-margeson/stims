import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../classes/user';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  submitDisabled: boolean = false;
  user: User;

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.user = new User({});
  }

  onSubmit(e: Event) {
    e.preventDefault();
    // Disable the form to prevent multiple submissions
    this.submitDisabled = true;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    this.user.first_name = formData.get('firstName') as string;
    this.user.last_name = formData.get('lastName') as string;
    this.user.username = formData.get('username') as string;
    this.user.email = formData.get('email') as string;
    this.user.password = formData.get('password') as string;

    this.authService.register(this.user).subscribe({
      next: () => {
        this.notificationService.showNotification(
          'Registration successful! Redirecting to login...'
        );
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        console.log(err);

        if (err.status == 409) {
          this.notificationService.showNotification(
            'That username or email is already in use.'
          );
          this.submitDisabled = false;
        } else if (err.status == 500 || err.status == 0) {
          this.notificationService.showNotification(
            'Internal server error. Please try again later.'
          );
          this.submitDisabled = false;
        } else if (err.status == 400) {
          this.notificationService.showNotification(
            'Please fill out all required information and try again.'
          );
          this.submitDisabled = false;
        }
      },
    });
  }
}
