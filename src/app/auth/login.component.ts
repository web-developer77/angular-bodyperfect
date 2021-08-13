import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { map, catchError } from 'rxjs/operators';
import { environment } from '@env/environment';
import { Logger, UntilDestroy, untilDestroyed } from '@core';
import { AuthenticationService } from './authentication.service';
import { QuoteService } from '@app/home/quote.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { JwtHelperService } from '@auth0/angular-jwt';
import { trigger, transition, style, animate, group, state } from '@angular/animations';

const log = new Logger('Login');

const authEndPoints = {
  login: 'https://diet.bodysperfect.com/api/v1/employee/login',
};

@UntilDestroy()
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [style({ opacity: 0 }), animate('.7s ease-out', style({ opacity: '1' }))]),
      transition(':leave', [style({ opacity: 1 }), animate('.7s ease-out', style({ opacity: '0' }))]),
    ]),
  ],
})
export class LoginComponent implements OnInit {
  version: string | null = environment.version;
  hide = true;
  error: string | undefined;
  loginForm!: FormGroup;
  registerForm: FormGroup;
  isLoading = false;
  durationInSeconds = 5;
  tokenExpiry = 3600000;
  registerSession = false;
  loginSession = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private quoteService: QuoteService,
    private httpClient: HttpClient,
    private _snackBar: MatSnackBar
  ) {
    this.createForm();
    this.createRegisterForm();
  }

  ngOnInit() {}

  login() {
    const helper = new JwtHelperService();

    // const Headers = new HttpHeaders({
    //   'Content-Type': 'application/json',
    // });
    // return this.httpClient
    //   .post(authEndPoints.login, this.loginForm.value)
    //   .pipe(
    //     map((res: any) => {
    //       console.log(res.accessToken);
    //       catchError(() => 'Error in logging in.');
    //     })
    //   );

    this.quoteService
      .login(this.loginForm.value)
      .pipe(
        finalize(() => {
          this.loginForm.markAsPristine();
          this.isLoading = false;
        }),
        untilDestroyed(this)
      )
      .subscribe(
        (res: any) => {
          /* todo: if the api returns 403 unauthorized, do not let user sign in. just notify. */
          localStorage.setItem('token', res);
          const decodedToken = helper.decodeToken(res);
          console.log('decode token', decodedToken);

          localStorage.setItem('userStatus', decodedToken.userStatus);
          localStorage.setItem('uuid', decodedToken.id);
          this.authenticationService.autoLogOut(this.tokenExpiry);
          this.authenticationService.login(this.loginForm.value);
          this._snackBar.open('Login Successful.', '', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['blue-snackbar'],
          });
          this.router.navigate([this.route.snapshot.queryParams.redirect || '/'], { replaceUrl: true });
          this.isLoading = false;
        },
        (error) => {
          this.isLoading = false;
          if (error.status === 404 || error.status === 401) {
            this._snackBar.open('Login failed. Check your credentials.', '', {
              duration: 3000,
              panelClass: ['blue-snackbar'],
            });
          }
        }
      );

    // const xx = this.authenticationService.login(this.loginForm.value);
    // console.log(xx);

    // const login$ = this.authenticationService.login(this.loginForm.value);
    // login$
    //   .pipe(
    //     finalize(() => {
    //       this.loginForm.markAsPristine();
    //       this.isLoading = false;
    //     }),
    //     untilDestroyed(this)
    //   )
    //   .subscribe(
    //     (credentials) => {
    //       log.debug(`${credentials.username} successfully logged in`);
    //       this.router.navigate([this.route.snapshot.queryParams.redirect || '/'], { replaceUrl: true });
    //     },
    //     (error) => {
    //       log.debug(`Login error: ${error}`);
    //       this.error = error;
    //     }
    //   );
  }

  register() {
    this.quoteService
      .registerEmployee(this.registerForm.value)
      .pipe(
        finalize(() => {
          this.registerForm.markAsPristine();
          this.isLoading = false;
        }),
        untilDestroyed(this)
      )
      .subscribe(
        (res: any) => {
          console.log(res);

          this._snackBar.open(
            'Registration Successful! Your account is being verified and it will be activated soon.',
            '',
            {
              duration: 10000,
              verticalPosition: 'top',
              panelClass: ['blue-snackbar'],
            }
          );
          this.loginSession = !this.loginSession;
          this.registerSession = !this.registerSession;
        },
        (error: any) => {
          this.isLoading = false;
          if (error.status === 404 || error.status === 401) {
            this._snackBar.open('Registration failed.', '', {
              duration: 3000,
              panelClass: ['blue-snackbar'],
            });
          }
        }
      );
  }

  private createForm() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      // remember: true,
    });
  }

  private createRegisterForm() {
    this.registerForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }
}
