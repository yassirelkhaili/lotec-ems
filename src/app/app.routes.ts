import { Routes } from '@angular/router';
import { QualificationsListComponent } from './qualifications-list/qualifications-list.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'qualifications', pathMatch: 'full' },
      { path: 'qualifications', component: QualificationsListComponent },
      // Employee routes - to be added by team member
      // { path: 'employees', component: EmployeesListComponent },
      // { path: 'employees/:id', component: EmployeeDetailComponent },
    ]
  },
  { path: '**', redirectTo: '/login' }
];
