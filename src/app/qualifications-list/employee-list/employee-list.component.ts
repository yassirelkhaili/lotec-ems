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
    'eyJhbGciOiJSUzI1NiIsImtpZCI6ImM0MDc3MzdjMTg1MzQyYTk5Y2VlYzcyMTQwM2I4NjViIiwidHlwIjoiSldUIn0.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjkwMDAvYXBwbGljYXRpb24vby9lbXBsb3llZV9hcGkvIiwic3ViIjoiYjBlMDExYmU0Y2VlYzliOTYwNzA0MDY3ODU0OWJmNzA4M2I5ZjAwNGQ2MGQ2MTU5NTAwNjIwOWYyMmY5NmY1ZCIsImF1ZCI6ImVtcGxveWVlX2FwaV9jbGllbnQiLCJleHAiOjE3NjgyMjAzNTUsImlhdCI6MTc2ODIxNzM1NSwiYXV0aF90aW1lIjoxNzY4MjE3MzU1LCJhY3IiOiJnb2F1dGhlbnRpay5pby9wcm92aWRlcnMvb2F1dGgyL2RlZmF1bHQiLCJhenAiOiJlbXBsb3llZV9hcGlfY2xpZW50IiwidWlkIjoienBQYmVwelpoVmZ0b3NzSnNWcVczU2wzQ0lucnNSb3N1RUlpTmpQdCJ9.P0eyahVs8UJAk5RZ062UanY1QokXUS2eRHOWH6KWHU06kUI45aYprmdo5hBOINpnXdYhfqBCHDpgSCCI0BCxkb2juQdHSAfl_VkrGDfZmxXCAecd6It-VCGpHd6r_8EKC_sSn9NgIbUU8pNZ-ZrwliZc9zlZJHFu9MyPmsl5X4yPS_RSttQl5k_UVOw4OQVJboF-Ea0uvli-kaJX-vr_ACrJgaLxpPrS5F3rsnsdm5hdOV6PEg_ZpLLwzwPmevAOM9RogIrn4exqE2mtDZ91-KdtJSrDyZAzPDa1pGJWvPkAYI7_db15O-X6qwAp4AMbU71tnXH7o8nPN4zf87E3aLrQsshOHtutuVBXN8B8zZvPNvLpWQBumH6219BZQwnwweMe5Qf2TpPzblT4OK-QbnSR85qDnJM2AwMhbgDo-HPHySEqzMi4F1xAfY7jv8UYGThBWEZKsNzv8vtzeAJ8jfJYRRvIqNtvNBObb6jNBWnnNytGBqHeGOGoaT4B1_Kk9cjyDzHLi4qiwFdeieZrAkqCetO0GC4zRcDD1TTzq4CatxmViyHXsLTkQUibI60vSsmxPX6E7U7K63LU4a8NMja4RpCnvKnzFVGnuF9YYVnGFXGoG2VJo0ib-lvn3XEvdg5_5wJGUsS7YVqfeVYE3E5wJm6rnJwfGT0uK2SJzD4';
  private qualificationsApiUrl = 'http://localhost:8089/qualifications';
  private employeesApiUrl = 'http://localhost:8089/employees';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.loadAllEmployees();
  }

  /**
   * load employees with qualification
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
   * load available employees
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
   * add employee to qualification
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
   * Delete employee from qualification
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
