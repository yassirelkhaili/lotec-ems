import {
  Component,
  Input,
  OnInit,
  signal,
  computed,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.css',
})
export class EmployeeListComponent implements OnInit {
  @Input() qualificationId!: number;
  @Output() employeesChanged = new EventEmitter<void>();
  @Output() closeRequested = new EventEmitter<void>();

  employees = signal<Employee[]>([]);
  allEmployees = signal<Employee[]>([]);
  selectedEmployeeId = signal<number | null>(null);
  qualificationName = signal<string>('');
  isLoading = signal<boolean>(true);
  isAddingEmployee = signal<boolean>(false);

  availableEmployees = computed(() => {
    const currentEmployeeIds = this.employees().map((e) => e.id);
    return this.allEmployees().filter(
      (e) => !currentEmployeeIds.includes(e.id)
    );
  });

  // TODO: Replace with AuthService (Marouane)
  private TEMP_TOKEN =
    'eyJhbGciOiJSUzI1NiIsImtpZCI6ImM0MDc3MzdjMTg1MzQyYTk5Y2VlYzcyMTQwM2I4NjViIiwidHlwIjoiSldUIn0.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjkwMDAvYXBwbGljYXRpb24vby9lbXBsb3llZV9hcGkvIiwic3ViIjoiYjBlMDExYmU0Y2VlYzliOTYwNzA0MDY3ODU0OWJmNzA4M2I5ZjAwNGQ2MGQ2MTU5NTAwNjIwOWYyMmY5NmY1ZCIsImF1ZCI6ImVtcGxveWVlX2FwaV9jbGllbnQiLCJleHAiOjE3NjgxNjYyNTEsImlhdCI6MTc2ODE2MzI1MSwiYXV0aF90aW1lIjoxNzY4MTYzMjUxLCJhY3IiOiJnb2F1dGhlbnRpay5pby9wcm92aWRlcnMvb2F1dGgyL2RlZmF1bHQiLCJhenAiOiJlbXBsb3llZV9hcGlfY2xpZW50IiwidWlkIjoiRVg3em84UGJLSTZmZW1wN01VUDg3QzQyanduWWRkRHRUc0VKMXV2VyJ9.XlvibOz_B8IKqb2USQLYOOoZPuBvO7-hFzfVNPsydLnperwqXqtDj3r_VJCbdR9o1w4fczqzJJvZ-2xgwvj1unaVJqY11nyHss-hUko333mxbQTXuHlkL8Kpq6sYsMiE8-XH2rGdp--cmlqZARXdpowqFPIxf51e8sKm0ygeFdEcSv6lMluP1vSojc_0UEyHxOOsFKfB8NLZ5XokBnt2TO8BHhw48l6b2xEcfd5n5R9fz9O0xNiD4MF8o3GWQwbwKmBZ12FNz4j9jvuP0Y1Ghjj9OgTh4Midf3pYX0ICoTIytRx9Fi0VDXJLNorQZG2rb2K7ldpnEvsVyYhVc-GYih9KYXtSmoS8pUMnbDqt_OmaYUFblIPI8d5q82QMTjFDEYIVVox9lGZ3gy8jx5kueCYdGmVMjHmXQEQORcuW1VJTi10WXx3hw_zm-XJiS_mpRFDcxrrZpaNMFCHHaapFkMs-JkfjmMi_6lK3J3RvFI9VvsUVbbKCXUbXJ-oD0HcbJFvmQ8BslEGHPNyvDVu_jYvycFFDDWY2Sm1ipQ6IteA-MA9rybIrpsK9c3ELMDn9liQpwN66vdVOzD9WnJ0wtaNnNGw0fapjECRYG2dRfV2QzkhXN-klyWkHr5u4h942uykLmDo38s6WPytV3r_xv8xji_bzFrR4o2ejQBBPppY';
  private qualificationsApiUrl = 'http://localhost:8089/qualifications';
  private employeesApiUrl = 'http://localhost:8089/employees';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.loadAllEmployees();
  }

  /**
   * Lade Employees mit dieser Qualifikation
   */
  private loadEmployees(): void {
    this.isLoading.set(true);

    this.http
      .get<QualificationEmployeesResponse>(
        `${this.qualificationsApiUrl}/${this.qualificationId}/employees`,
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

  /**
   * Lade alle verfügbaren Employees
   */
  private loadAllEmployees(): void {
    this.http
      .get<Employee[]>(this.employeesApiUrl, {
        headers: new HttpHeaders().set(
          'Authorization',
          `Bearer ${this.TEMP_TOKEN}`
        ),
      })
      .subscribe({
        next: (employees) => {
          this.allEmployees.set(employees);
        },
        error: (error) => {
          console.error('Error loading all employees:', error);
        },
      });
  }

  /**
   * Füge Employee zur Qualifikation hinzu
   */
  addEmployeeToQualification(): void {
    const employeeId = this.selectedEmployeeId();

    if (!employeeId) {
      alert('Bitte wählen Sie einen Mitarbeiter aus.');
      return;
    }

    this.isAddingEmployee.set(true);

    // POST /employees/{id}/qualifications
    this.http
      .post(
        `${this.employeesApiUrl}/${employeeId}/qualifications`,
        { skill: this.qualificationName() },
        {
          headers: new HttpHeaders()
            .set('Authorization', `Bearer ${this.TEMP_TOKEN}`)
            .set('Content-Type', 'application/json'),
        }
      )
      .subscribe({
        next: () => {
          this.loadEmployees();
          this.selectedEmployeeId.set(null);
          this.isAddingEmployee.set(false);
          this.employeesChanged.emit();
          alert('Mitarbeiter erfolgreich hinzugefügt!');
        },
        error: (error) => {
          console.error('Error adding employee:', error);
          this.isAddingEmployee.set(false);
          alert('Fehler beim Hinzufügen des Mitarbeiters.');
        },
      });
  }

  /**
   * Entferne Employee von Qualifikation
   */
  removeEmployeeFromQualification(employeeId: number): void {
    if (
      !confirm(
        'Möchten Sie diesen Mitarbeiter wirklich von der Qualifikation entfernen?'
      )
    ) {
      return;
    }

    // DELETE /employees/{eid}/qualifications/{qid}
    this.http
      .delete(
        `${this.employeesApiUrl}/${employeeId}/qualifications/${this.qualificationId}`,
        {
          headers: new HttpHeaders().set(
            'Authorization',
            `Bearer ${this.TEMP_TOKEN}`
          ),
        }
      )
      .subscribe({
        next: () => {
          this.loadEmployees();
          this.employeesChanged.emit();
          alert('Mitarbeiter erfolgreich entfernt!');
        },
        error: (error) => {
          console.error('Error removing employee:', error);
          alert('Fehler beim Entfernen des Mitarbeiters.');
        },
      });
  }

  closeModal(): void {
    this.closeRequested.emit();
  }
}
