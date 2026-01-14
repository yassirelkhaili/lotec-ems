import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  // Use proxy for development (routes to /keycloak -> https://keycloak.szut.dev/)
  private readonly AUTH_URL = '/keycloak/auth/realms/szut/protocol/openid-connect/token';
  private readonly CLIENT_ID = 'employee-management-service';
  
  private authState = new BehaviorSubject<boolean>(this.isAuthenticated());

  constructor(private http: HttpClient, private router: Router) {
    // Restore session on page refresh
    this.restoreSession();
  }

  /**
   * Login with username and password
   */
  login(username: string, password: string): Observable<TokenResponse> {
    const body = new URLSearchParams();
    body.set('grant_type', 'password');
    body.set('client_id', this.CLIENT_ID);
    body.set('username', username);
    body.set('password', password);

    return this.http.post<TokenResponse>(this.AUTH_URL, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).pipe(
      tap(response => {
        this.storeToken(response.access_token);
        this.authState.next(true);
      })
    );
  }

  /**
   * Logout - clear token and redirect
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.authState.next(false);
    this.router.navigate(['/login']);
  }

  /**
   * Get stored JWT token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  /**
   * Get authentication state as Observable
   */
  getAuthState(): Observable<boolean> {
    return this.authState.asObservable();
  }

  /**
   * Store token in localStorage
   */
  private storeToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Check if JWT token is expired
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = this.parseJwt(token);
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= expirationTime;
    } catch {
      return true; // If parsing fails, consider it expired
    }
  }

  /**
   * Parse JWT token payload
   */
  private parseJwt(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  }

  /**
   * Restore session on page refresh
   */
  private restoreSession(): void {
    const token = this.getToken();
    if (token && !this.isTokenExpired(token)) {
      this.authState.next(true);
    } else if (token) {
      // Token expired, log out
      this.logout();
    }
  }
}
