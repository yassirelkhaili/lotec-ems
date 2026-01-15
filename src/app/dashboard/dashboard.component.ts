import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  sidebarOpen = signal(true);
  username = signal<string>('Benutzer');

  constructor(private authService: AuthService) {
    // Check if authenticated, redirect to login if not
    if (!this.authService.isAuthenticated()) {
      // Router redirect handled by AuthGuard
    }
    
    // Get and display username
    const user = this.authService.getUsername();
    if (user) {
      this.username.set(user);
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(value => !value);
  }

  logout(): void {
    this.authService.logout();
  }
}
