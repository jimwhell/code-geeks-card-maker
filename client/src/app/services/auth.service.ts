import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, shareReplay, tap } from 'rxjs';
import moment, { Moment } from 'moment';
import { AccessTokenResponse } from '../interfaces/access-token-response';
import { LogoutTokenResponse } from '../interfaces/logout-token-response';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private apiService: ApiService) {}

  baseUrl: string = '/api/sessions';

  //method to login admin
  login(email: string, password: string): Observable<AccessTokenResponse> {
    return this.apiService
      .post<AccessTokenResponse, { email: string; password: string }>(
        `${this.baseUrl}/login`,
        { email, password }
      )
      .pipe(
        tap((res) => {
          this.setSession(res);
        }),
        shareReplay(1)
      );
  }

  private setSession(authResult: AccessTokenResponse) {
    const expiresAt = this.convertToSeconds(authResult.expiresIn);
    //set token id and expiration in local storage
    localStorage.setItem('access_token', authResult.token);
    localStorage.setItem('at_expires_at', expiresAt);
  }

  deleteSession() {
    //remove access token data from local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('at_expires_at');
  }

  //method to logout admin
  logout(): Observable<LogoutTokenResponse> {
    return this.apiService
      .delete<LogoutTokenResponse>(this.baseUrl)
      .pipe(tap(() => this.deleteSession())); // Clear client session after logout
  }

  //determine if admin is logged in by comparing current time
  //and access token time of expiration
  public isLoggedIn() {
    const expiration = this.getExpiration();
    if (!expiration) {
      return false;
    }
    const now = moment();
    return moment().isBefore(expiration);
  }

  //determine if admin is logged out
  isLoggedOut(): boolean {
    return !this.isLoggedIn();
  }

  //returns the access token expiration as a moment object for
  //comparison
  getExpiration() {
    const expiration = localStorage.getItem('at_expires_at');
    if (expiration === null) {
      console.error('Expiration returned as null');
      return;
    }
    const expiresAt = JSON.parse(expiration);
    return moment(expiresAt);
  }

  //determine if access token is near expiration (five minutes)
  isExpiring(expiration: Moment): boolean {
    const nowMs = moment().valueOf();
    const expiresAtMs = expiration.valueOf();
    const timeLeftMs = expiresAtMs - nowMs;
    const fiveMinutesMs = 5 * 60 * 1000;

    return timeLeftMs > 0 && timeLeftMs < fiveMinutesMs;
  }

  //method to send a request for a new access token
  refreshToken(): Observable<AccessTokenResponse> {
    return this.apiService
      .get<AccessTokenResponse>(`${this.baseUrl}/refresh`)
      .pipe(
        tap((res: AccessTokenResponse) => {
          localStorage.setItem('access_token', res.token);
          const expiresAt = this.convertToSeconds(res.expiresIn);
          localStorage.setItem('at_expires_at', expiresAt);
        })
      );
  }

  //method to convert expiresAt property of accessToken response
  //to moment seconds
  convertToSeconds(expiresAt: number) {
    const convertedInSeconds = moment().add(expiresAt, 'second');
    return JSON.stringify(convertedInSeconds.valueOf());
  }
}
