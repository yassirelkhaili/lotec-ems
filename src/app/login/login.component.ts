import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = signal('');
  password = signal('');
  error = signal('');
  isLoading = signal(false);

  constructor(private authService: AuthService, private router: Router) {
    // Redirect if already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onUsernameChange(value: string): void {
    this.username.set(value);
  }

  onPasswordChange(value: string): void {
    this.password.set(value);
  }

  login(): void {
    this.error.set('');
    if (!this.username() || !this.password()) {
      this.error.set('Benutzername und Passwort erforderlich');
      return;
    }

    this.isLoading.set(true);
    this.authService.login(this.username(), this.password()).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.isLoading.set(false);
        this.error.set('Authentifizierung fehlgeschlagen. Benutzername oder Passwort ist falsch.');
      }
    });
  }
}
