import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return authService.isRole('admin').pipe(
      map((isRole: boolean) => {
        if (isRole) {
          return true;
        } else {
          router.navigate(['/dashboard']);
          return false;
        }
      })
    );
  } else {
    router.navigate(['/login']);
    return false;
  }
};

export const catalogerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return authService.isRole('cataloger').pipe(
      map((isRole: boolean) => {
        if (isRole) {
          return true;
        } else {
          router.navigate(['/dashboard']);
          return false;
        }
      })
    );
  } else {
    router.navigate(['/login']);
    return false;
  }
};
