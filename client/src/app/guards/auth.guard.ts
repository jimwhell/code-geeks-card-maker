import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import moment from 'moment';

export const authGuard: CanActivateFn = (route, state) => {
  //inject auth service
  const authService = inject(AuthService);
  const router = inject(Router);

  //get current token expiration
  const expiration: moment.Moment | undefined = authService.getExpiration();

  if (!expiration) {
    router.navigate(['/login']);
    return false;
  }

  //determine if token is still valid
  const isStillValid: boolean = expiration.isAfter(moment());

  if (!isStillValid) {
    router.navigate(['/login']);
    return false;
  }

  //determine if token is near expiration
  const isExpiring: boolean = authService.isExpiring(expiration);

  //if token is near expiration, refresh the token
  if (isExpiring) {
    console.log('Malapit na mag expire!');
    authService.refreshToken().subscribe({
      next: () => {
        console.log('Token refreshed!');
      },
      error: (err) => {
        console.error('Error refreshing token: ', err);
        router.navigate(['/login']);
        return false;
      },
    });
  }

  return authService.isLoggedIn();
};
