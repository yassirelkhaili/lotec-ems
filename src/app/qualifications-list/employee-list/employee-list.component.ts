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
    'eyJhbGciOiJSUzI1NiIsImtpZCI6ImM0MDc3MzdjMTg1MzQyYTk5Y2VlYzcyMTQwM2I4NjViIiwidHlwIjoiSldUIn0.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjkwMDAvYXBwbGljYXRpb24vby9lbXBsb3llZV9hcGkvIiwic3ViIjoiYjBlMDExYmU0Y2VlYzliOTYwNzA0MDY3ODU0OWJmNzA4M2I5ZjAwNGQ2MGQ2MTU5NTAwNjIwOWYyMmY5NmY1ZCIsImF1ZCI6ImVtcGxveWVlX2FwaV9jbGllbnQiLCJleHAiOjE3NjgyMzEyNjMsImlhdCI6MTc2ODIyODI2MywiYXV0aF90aW1lIjoxNzY4MjI4MjYzLCJhY3IiOiJnb2F1dGhlbnRpay5pby9wcm92aWRlcnMvb2F1dGgyL2RlZmF1bHQiLCJhenAiOiJlbXBsb3llZV9hcGlfY2xpZW50IiwidWlkIjoickoxZk9RUjBNd1V2OHdVV2JXSXRUYmtvc0VEMEpTR0w2ZUJvVXliRiJ9.UClzkgBMTm1VUtpw5sU8F5NmKIfKjZHx688bfCyiFL4NUtLiURSlBLoUtxEievaksoMxGVqRhg9On_p60qF6_RYhR4fK6PMojys5VvUNOcjGjUPCFK4SCF5YAJRWbcbX-7Epm5-quMIiVAoVQX3aKkyDneMCJ7LOPNoMDTvMpZCuW_SyvHTxEdp3N9rU9HlDHsCDl2khaAyp-iclVBzurCbP2TqneljgT3SrcQPq9k8EzbNmY2F1jm38wKbaLdh6nkVJVMJOcHFDUChR_MRmfdfM-oeRia6yU6C4tAQRKERVR6FANmSdSCcgUh9OwrHZJoYHN8Gu3jdDYvcwKY6azZqDNxYPpXkWfIVEaKzP8RPkyeUQW7OmAG8xhqQI81l_wYGKva6_qu-3LNtPB7BL7wrrm7Ez6kQ0lAf7fr2RDFWI6Rx2JNUWU-Zymckp-XCuOLr12FffrgqNCMufb3v_OUqqXD-iUtAtcEGD9gdMPwdiYGLHVhfeJk-CQzAKmjRgblXgWu0zgMDQ8eS0gF_uqdgznBZAKzavEKg6LrCKm6Am_AiJkrS9_VzbLDC30dgeOsfsAWvyU7WO9ohAXEN4ygluyMvdHS3hDuG0AI-eVopqyrSsccvMXuZG_0WKnTlQlh3tWt9YjUjf0wt4Tga0g9RgPJMuJXPEmmK51qMESfI';
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
