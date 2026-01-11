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
    'eyJhbGciOiJSUzI1NiIsImtpZCI6ImM0MDc3MzdjMTg1MzQyYTk5Y2VlYzcyMTQwM2I4NjViIiwidHlwIjoiSldUIn0.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjkwMDAvYXBwbGljYXRpb24vby9lbXBsb3llZV9hcGkvIiwic3ViIjoiYjBlMDExYmU0Y2VlYzliOTYwNzA0MDY3ODU0OWJmNzA4M2I5ZjAwNGQ2MGQ2MTU5NTAwNjIwOWYyMmY5NmY1ZCIsImF1ZCI6ImVtcGxveWVlX2FwaV9jbGllbnQiLCJleHAiOjE3NjgxNjE0OTEsImlhdCI6MTc2ODE1ODQ5MSwiYXV0aF90aW1lIjoxNzY4MTU4NDkxLCJhY3IiOiJnb2F1dGhlbnRpay5pby9wcm92aWRlcnMvb2F1dGgyL2RlZmF1bHQiLCJhenAiOiJlbXBsb3llZV9hcGlfY2xpZW50IiwidWlkIjoib3VyYnNhVGFxTGpNSWFoTWt4VElESmg3b200VG5nY2VjSElxSnVOUSJ9.KRBoCpCWHkq-OI6rW8fTvNUVQ4f7dnL2q73CLLLw-Tdb397IHvX6ImzH5m6DXT4Uh2mksAykkI2Qeaky7SEdpZ4sLz1897CN7KHkDrwbgK2ErrMJyxyfPUuBWZCQsjuaEAKxFCRrE-uffpNwixZFi03Juqd8xwK_xGoO5BmRoD9MSx372-cBHIp2HbIBJPu6_NA4VVTFiKXoiHRuPibc-BCe2wBE5CeyRzlvCwVbETB0M8Bg-mmNtIPp5DfwA52QeOw_OqqEsY0eShEBpM4eqHu5bAnGEnEg2z6Zqw3IE8YepIgBS_L66nIXn4zxRDpbF1KFrwdtNXc76xLjWRhatg9eYVgqDTgfh33YKoSqlML2lNhWkJ2Fka4BJXb683PyvOb7qrUm3ehXVzM4NDvYYu57UagKgymajeM8wmAKrhN0eqmL7dmvUaCjH0Rc3qxooa6Ptaro9bf03CfGGginXOEi0O6Xasi0desxdUbvPxIgj0ng42Yu8oTGNA5LAIbovl-6k1zZXMQi2wncNpCiNQNnGwXj2gFDy5hzkbkY19fSWM4nnLM0-AQTYVT8rrR_4mpC6le-Yif2jFqWeWaNH-AwuTCkD8j5gKA72buAcpwGHZ4VlV4oZuqNb1wcQIePp-Ot7xfBkdOQTPCz5flvnyoRnELTGnvxWCLAWXA31UA';
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

    // POST /employees/{id}/qualifications mit Body: { qualificationId: X }
    this.http
      .post(
        `${this.employeesApiUrl}/${employeeId}/qualifications`,
        { qualificationId: this.qualificationId },
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
