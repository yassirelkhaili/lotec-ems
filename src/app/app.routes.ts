import { Routes } from '@angular/router';
import { QualificationsListComponent } from './qualifications-list/qualifications-list.component';
import { EmployeeListComponent } from './qualifications-list/employee-list/employee-list.component';
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
      { path: '', redirectTo: 'employees', pathMatch: 'full' },
      { path: 'employees', component: EmployeeListComponent },
      { path: 'qualifications', component: QualificationsListComponent },
    ]
  },
  { path: '**', redirectTo: '/login' }
];
