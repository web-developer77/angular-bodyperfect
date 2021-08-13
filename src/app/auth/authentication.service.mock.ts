import { Observable, of } from 'rxjs';

import { LoginContext } from './authentication.service';
import { Credentials } from './credentials.service';

export class MockAuthenticationService {
  credentials: Credentials | null = {
    username: 'test',
    password: 'test',
    // token: '123',
  };

  login(context: LoginContext): Observable<Credentials> {
    return of({
      username: context.username,
      password: context.password,
      // token: '123456',
    });
  }

  logout(): Observable<boolean> {
    this.credentials = null;
    return of(true);
  }
}
