import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { QualificationEmployeesResponse } from '../../types/QualificationEmployeeResponse';

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
}

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.css',
})
export class EmployeeListComponent implements OnInit {
  @Input() qualificationId!: number;

  employees = signal<Employee[]>([]);
  qualificationName = signal<string>('');
  isLoading = signal<boolean>(true);

  // TODO: Replace with AuthService
  private TEMP_TOKEN =
    'eyJhbGciOiJSUzI1NiIsImtpZCI6ImM0MDc3MzdjMTg1MzQyYTk5Y2VlYzcyMTQwM2I4NjViIiwidHlwIjoiSldUIn0.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjkwMDAvYXBwbGljYXRpb24vby9lbXBsb3llZV9hcGkvIiwic3ViIjoiYjBlMDExYmU0Y2VlYzliOTYwNzA0MDY3ODU0OWJmNzA4M2I5ZjAwNGQ2MGQ2MTU5NTAwNjIwOWYyMmY5NmY1ZCIsImF1ZCI6ImVtcGxveWVlX2FwaV9jbGllbnQiLCJleHAiOjE3NjgxMzUwNzgsImlhdCI6MTc2ODEzMjA3OCwiYXV0aF90aW1lIjoxNzY4MTMyMDc4LCJhY3IiOiJnb2F1dGhlbnRpay5pby9wcm92aWRlcnMvb2F1dGgyL2RlZmF1bHQiLCJhenAiOiJlbXBsb3llZV9hcGlfY2xpZW50IiwidWlkIjoiTW5vWHdQRERDWmthNHh6VVpCeWMyOWI4bTdkUGNONzJkMllrWnREMiJ9.H88B5l10cmBJzdbWBL5CQQyZDSqOZSgWloFQMwzDW1A5_9pZxrJEGkHEp1C1l-2lrvTt4PmkZyOtTAuJY0gEE-FyEhEEqvGVUKxR9PrpqmluIZHkNl85dvmtfZAhaUZc1oW91qBG8FXILQEWJFlmlAUXtD9HVJgEkzO390OwSUF6-UIgAeFzEelrh84dmEClQQrEmBTSRYmxBPhXH5FzxnCiRESoyTqTHO6J__1yS4ZdZG04f1B2ryqDXA1iUTBiVMfKOzaB8H-yFsGNW6M-CqITpEO2J_z_lg7IAIi1U55VGRGp0wUqShq7Oiuk-ixw2iqFjrWdbre8qhRJjmYXI_eN9pRPWjfcMw9AGwpUUuDuzIMtt1HWz88vYtTii1DXzT1-rGf0m8uyYCwv6KtLO7RIbuL45I8Co8N7oc5Nje92ptQPkceprJ7-Uypt4DAp-fF4gXVp6MFzfpsmlQx3mjpANsNf7fuoMKWcJbYT2HEG0W54QxsNbl0oJMW0Gne7nRh9A--oGglSZynSIXUyylUmM01TH60Ier2-vd5A_kiklNKZrVnxdTOvEyIOg-7mCG2EEhr88gT3EHiKuOvt_14Tg7Z_9EIwtEEH0IT5xPYRiFrGGhVf32Dc2SdgRGobfeFuK9BIk9dRKk1d8wUpOg1z5WrBhkzy7k1dHCELIzs';

  private apiUrl = 'http://localhost:8089/qualifications';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  private loadEmployees(): void {
    this.http
      .get<QualificationEmployeesResponse>(
        `${this.apiUrl}/${this.qualificationId}/employees`,
        {
          headers: new HttpHeaders().set(
            'Authorization',
            `Bearer ${this.TEMP_TOKEN}`
          ),
        }
      )
      .subscribe({
        next: (response) => {
          this.employees.set(response.employees);
          this.qualificationName.set(response.qualification.skill);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading employees:', error);
          this.isLoading.set(false);
        },
      });
  }
}
