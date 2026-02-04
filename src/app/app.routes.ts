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
      { path: 'employees', loadComponent: () => import('./employees/employee-list/employee-list.component').then(m => m.EmployeeListComponent) },
      { path: 'employees/add', loadComponent: () => import('./employees/employee-form/employee-form.component').then(m => m.EmployeeFormComponent) },
      { path: 'employees/:id/edit', loadComponent: () => import('./employees/employee-form/employee-form.component').then(m => m.EmployeeFormComponent) },
      { path: 'employees/:id', loadComponent: () => import('./employees/employee-detail/employee-detail.component').then(m => m.EmployeeDetailComponent) },
    ]
  },
  { path: '**', redirectTo: '/login' }
];
