import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Qualification } from '../types/Qualification';

@Component({
  selector: 'app-qualifications-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './qualifications-list.component.html',
  styleUrls: ['./qualifications-list.component.css'],
})
export class QualificationsListComponent implements OnInit {
  qualifications = signal<Qualification[]>([]);
  searchTerm = signal<string>('');
  showForm = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  selectedQualification = signal<Qualification | null>(null);

  filteredQualifications = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    if (!search) return this.qualifications();

    return this.qualifications().filter((q) =>
      q.skill.toLowerCase().includes(search)
    );
  });

  qualificationForm = new FormGroup({
    id: new FormControl<number>(0),
    skill: new FormControl('', {
      validators: [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
      ],
      nonNullable: true,
    }),
  });

  private TEMP_TOKEN =
    'eyJhbGciOiJSUzI1NiIsImtpZCI6ImM0MDc3MzdjMTg1MzQyYTk5Y2VlYzcyMTQwM2I4NjViIiwidHlwIjoiSldUIn0.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjkwMDAvYXBwbGljYXRpb24vby9lbXBsb3llZV9hcGkvIiwic3ViIjoiYjBlMDExYmU0Y2VlYzliOTYwNzA0MDY3ODU0OWJmNzA4M2I5ZjAwNGQ2MGQ2MTU5NTAwNjIwOWYyMmY5NmY1ZCIsImF1ZCI6ImVtcGxveWVlX2FwaV9jbGllbnQiLCJleHAiOjE3NjgwOTAzNjUsImlhdCI6MTc2ODA4NzM2NSwiYXV0aF90aW1lIjoxNzY4MDg3MzY1LCJhY3IiOiJnb2F1dGhlbnRpay5pby9wcm92aWRlcnMvb2F1dGgyL2RlZmF1bHQiLCJhenAiOiJlbXBsb3llZV9hcGlfY2xpZW50IiwidWlkIjoiYWdaWXJ4dHFwUTR5OHZ0R2RSaXZGN0cyZHFJeXV0TUc2WGVXd3dzNiJ9.gI-OEl5Odhp7d-C_ZJwR8c2gbQ-1YNoasbJFdsuHQ6Cs4pYVSVdc9nRdV7uyhBHRqSfcsAb0FyKv2pMyaBsu0aDjkE1W17buoaPAXPtGI1ICd3O0zv4cjgq1tC3Xx7qHrRQ9DEhFxg0JnaER30zFQWhPjr85JtekfQn6cLb7uO8G9T6ItQEHZHOVNCb70m20uw-cnrKaP8x1NRvuOJRoMmu7svMHPBt9buIqrZW04_xBUzw9cnwK39dY25JiA_3kY6j5MTuT3HAlDVncd1vbXwUjCalBt8Pz0iMTJGHciy-S-yqe3vhnUcGw8MZeQbpBY83hN67mUEucnb2voiqJvD_f9YcffqohL_z6Txdj1Q13KHDA9cAdXgxRkd4unoWNnVK80iXRShxVDwUp6wDSuTeDqvIiIvCxD4UkJuw4s_ncB_Q_v_dcfZzB7oliLH-_ATfdL8ErD2CTAtpGa54I5_a_FV_CakjO6GvCvSUAbGc-GiS4-86XMCzTXVaD230hJ1tq9nhpbZwY7OYR6XpjfERhAxrU2lx0REYOaGzxtFJIIrPuYOrHXx4dm6ANofn4zmvppZibr0X6Kp8UATmhKLgae7fMadg-kvcvHbK8DkOlvS4tN24N91AZm45x5Quyvy14fFqcFPwUKDuko_hvocKfg4uxpj7oOvO1SaXwunI';

  private apiUrl = 'http://localhost:8089/qualifications';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadQualifications();
  }

  /**
   * Load all qualifications from API
   */
  loadQualifications(): void {
    this.http
      .get<Qualification[]>(this.apiUrl, {
        headers: new HttpHeaders().set(
          'Authorization',
          `Bearer ${this.TEMP_TOKEN}`
        ),
      })
      .subscribe({
        next: (data) => {
          this.qualifications.set(data);
        },
        error: (error) => {
          console.error('Error loading qualifications:', error);
          alert('Failed to load qualifications. Check console for details.');
        },
      });
  }

  /**
   * Search change handler
   */
  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  /**
   * Show create form
   */
  showCreateForm(): void {
    this.isEditMode.set(false);
    this.showForm.set(true);
    this.qualificationForm.reset();
  }

  /**
   * Show edit form with selected qualification
   */
  editQualification(qualification: Qualification): void {
    this.isEditMode.set(true);
    this.showForm.set(true);
    this.selectedQualification.set(qualification);
    this.qualificationForm.patchValue({
      id: qualification.id,
      skill: qualification.skill,
    });
  }

  /**
   * Cancel form and hide it
   */
  cancelForm(): void {
    this.showForm.set(false);
    this.selectedQualification.set(null);
    this.qualificationForm.reset();
  }

  /**
   * Create new qualification
   */
  createQualification(): void {
    this.qualificationForm.markAllAsTouched();

    if (this.qualificationForm.invalid) {
      return;
    }

    const newQualification = {
      skill: this.qualificationForm.value.skill!,
    };

    this.http
      .post<Qualification>(this.apiUrl, newQualification, {
        headers: new HttpHeaders()
          .set('Authorization', `Bearer ${this.TEMP_TOKEN}`)
          .set('Content-Type', 'application/json'),
      })
      .subscribe({
        next: () => {
          this.loadQualifications();
          this.cancelForm();
          alert('Qualification created successfully!');
        },
        error: (error) => {
          console.error('Error creating qualification:', error);
          alert('Failed to create qualification. Check console for details.');
        },
      });
  }

  /**
   * Update existing qualification
   */
  updateQualification(): void {
    this.qualificationForm.markAllAsTouched();

    if (this.qualificationForm.invalid) {
      return;
    }

    const updatedQualification = this.qualificationForm.getRawValue();

    this.http
      .put<Qualification>(
        `${this.apiUrl}/${updatedQualification.id}`,
        updatedQualification,
        {
          headers: new HttpHeaders()
            .set('Authorization', `Bearer ${this.TEMP_TOKEN}`)
            .set('Content-Type', 'application/json'),
        }
      )
      .subscribe({
        next: () => {
          this.loadQualifications();
          this.cancelForm();
          alert('Qualification updated successfully!');
        },
        error: (error) => {
          console.error('Error updating qualification:', error);
          alert('Failed to update qualification. Check console for details.');
        },
      });
  }

  /**
   * Delete qualification by ID
   */
  deleteQualification(id: number): void {
    if (!confirm('Are you sure you want to delete this qualification?')) {
      return;
    }

    this.http
      .delete(`${this.apiUrl}/${id}`, {
        headers: new HttpHeaders().set(
          'Authorization',
          `Bearer ${this.TEMP_TOKEN}`
        ),
      })
      .subscribe({
        next: () => {
          this.loadQualifications();
          alert('Qualification deleted successfully!');
        },
        error: (error) => {
          console.error('Error deleting qualification:', error);
          alert('Failed to delete qualification. Check console for details.');
        },
      });
  }

  /**
   * View employees with this qualification
   */
  viewEmployees(id: number): void {
    this.http
      .get<any[]>(`${this.apiUrl}/${id}/employees`, {
        headers: new HttpHeaders().set(
          'Authorization',
          `Bearer ${this.TEMP_TOKEN}`
        ),
      })
      .subscribe({
        next: (employees) => {
          console.log('Employees with this qualification:', employees);
          if (employees.length === 0) {
            alert('No employees have this qualification yet.');
          } else {
            const employeeNames = employees
              .map((e: any) => e.name || e.firstName + ' ' + e.lastName)
              .join('\n');
            alert(`Employees with this qualification:\n\n${employeeNames}`);
          }
        },
        error: (error) => {
          console.error('Error loading employees:', error);
          alert('Failed to load employees. Check console for details.');
        },
      });
  }

  /**
   * Submit form (create or update)
   */
  onSubmit(): void {
    if (this.isEditMode()) {
      this.updateQualification();
    } else {
      this.createQualification();
    }
  }

  get skill() {
    return this.qualificationForm.controls.skill;
  }
}
