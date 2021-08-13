import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Credentials, CredentialsService } from './credentials.service';

export interface LoginContext {
  username: string;
  password: string;
  remember?: boolean;
}

/**
 * Provides a base for authentication workflow.
 * The login/logout methods should be replaced with proper implementation.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(private credentialsService: CredentialsService, private router: Router, private _snackBar: MatSnackBar) {}

  /**
   * Authenticates the user.
   * @param context The login parameters.
   * @return The user credentials.
   */
  login(context: LoginContext): Observable<Credentials> {
    // Replace by proper authentication call
    const data = {
      username: context.username,
      password: context.password,
      token: '123456',
    };
    this.credentialsService.setCredentials(data, context.remember);
    return of(data);
  }

  /**
   * Logs out the user and clear credentials.
   * @return True if the user was logged out successfully.
   */
  logout(): Observable<boolean> {
    // Customize credentials invalidation here
    this.credentialsService.setCredentials();
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userStatus');
    localStorage.removeItem('uuid');
    this._snackBar.open('Token Expired.', '', { duration: 3000, panelClass: ['blue-snackbar'] });
    this.router.navigate(['/login']);
    return of(true);
  }

  autoLogOut(expDate: number) {
    setTimeout(() => {
      this.logout();
    }, expDate);
  }

  getToken() {
    return localStorage.getItem('token');
  }
}
