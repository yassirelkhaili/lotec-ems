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
import { AuthService } from '../../services/auth.service';

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

  private qualificationsApiUrl = 'http://localhost:8089/qualifications';
  private employeesApiUrl = 'http://localhost:8089/employees';

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.loadAllEmployees();
  }

  /**
   * load employees with qualification
   */
  private loadEmployees(): void {
    this.isLoading.set(true);

    const token = this.authService.getToken();
    if (!token) {
      console.error('No authentication token available');
      this.isLoading.set(false);
      return;
    }

    this.http
      .get<QualificationEmployeesResponse>(
        `${this.qualificationsApiUrl}/${this.qualificationId}/employees`,
        {
          headers: new HttpHeaders().set(
            'Authorization',
            `Bearer ${token}`
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
    const token = this.authService.getToken();
    if (!token) {
      console.error('No authentication token available');
      return;
    }

    this.http
      .get<Employee[]>(this.employeesApiUrl, {
        headers: new HttpHeaders().set(
          'Authorization',
          `Bearer ${token}`
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

    const token = this.authService.getToken();
    if (!token) {
      alert('Authentifizierungstoken nicht verfügbar');
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
            .set('Authorization', `Bearer ${token}`)
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

    const token = this.authService.getToken();
    if (!token) {
      alert('Authentifizierungstoken nicht verfügbar');
      return;
    }

    // DELETE /employees/{eid}/qualifications/{qid}
    this.http
      .delete(
        `${this.employeesApiUrl}/${employeeId}/qualifications/${this.qualificationId}`,
        {
          headers: new HttpHeaders().set(
            'Authorization',
            `Bearer ${token}`
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
