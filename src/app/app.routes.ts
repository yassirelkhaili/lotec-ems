import { Routes } from '@angular/router';
import { QualificationsListComponent } from './qualifications-list/qualifications-list.component';
import { EmployeeListComponent } from './qualifications-list/employee-list/employee-list.component';

export const routes: Routes = [
  {
    path: 'employees',
    component: EmployeeListComponent,
  },
  {
    path: 'qualifications',
    component: QualificationsListComponent,
  },
];
