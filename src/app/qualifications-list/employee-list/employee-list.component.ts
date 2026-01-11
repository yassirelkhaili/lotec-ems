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
    'eyJhbGciOiJSUzI1NiIsImtpZCI6ImM0MDc3MzdjMTg1MzQyYTk5Y2VlYzcyMTQwM2I4NjViIiwidHlwIjoiSldUIn0.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjkwMDAvYXBwbGljYXRpb24vby9lbXBsb3llZV9hcGkvIiwic3ViIjoiYjBlMDExYmU0Y2VlYzliOTYwNzA0MDY3ODU0OWJmNzA4M2I5ZjAwNGQ2MGQ2MTU5NTAwNjIwOWYyMmY5NmY1ZCIsImF1ZCI6ImVtcGxveWVlX2FwaV9jbGllbnQiLCJleHAiOjE3NjgxMzgyMTMsImlhdCI6MTc2ODEzNTIxMywiYXV0aF90aW1lIjoxNzY4MTM1MjEzLCJhY3IiOiJnb2F1dGhlbnRpay5pby9wcm92aWRlcnMvb2F1dGgyL2RlZmF1bHQiLCJhenAiOiJlbXBsb3llZV9hcGlfY2xpZW50IiwidWlkIjoiU1JYWHhndGwxZzM4UTdleDZ5M25ndERnN1VnZUlMeVgzZDYxRlBEaiJ9.f067LLzxBohRuicV_YaGdemT-mWQVTbHnL2Fit1XVYvMNE_KdYfzT5voWtlNAoebS7YwzpLfyesGn6rBFE_-x-MWJsOVg3u1Vv9c6eCrikRmT6Ump9XDYGarqf7tetSWlCwWNh8NSKzi1np2fPCQ90FSRxu_gKQPcLoGUHVyUjPmmcFeWTdgkmKvQd58NhMOYPs4SV-TqUAvlspj094As9gtv7PsdXm3l9k9LYJRLJ4pkNarELo0P9v8vMLySWNf67tczwfBXXBPY9rT15SPEDvlurOEFmD-uFDnSb2WCLz4MH0otTCEQz1IyjH8LT6ezbJcHzj17vP8FJ47ri3JeJQ1PQ3xn0vwxK6SaPDoGm9qtzecUhHP-D26t2bwEJ-PxlZXhfMexNO4xZL7-JibAw534k_IUErSqe845U9__3wjecNoASutKWGqJ8djFLwjOaxORDFPbIiU2olnt-vUQ1Sc5JLXf1h7QeNq46kbjVrMBZfayF5pTZzK_Uubsw8D-K0FX74gQXdYU-20diVDqfbFGt0WYIWFo2Uxpl-eKkuP_xiDJYx_0yBKjp2liUnLxkcMsagSL34M7BK4FVKRQdtKWVlJxqKs2SzJs9K_jLN4P1_LalwLehA1ZzqTtUEcsYPEOvvps9STW33KIGh0GvkXd4NOTokDtlYgt3HDmVQ';

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
