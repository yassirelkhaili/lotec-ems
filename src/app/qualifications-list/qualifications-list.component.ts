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
import { forkJoin } from 'rxjs';
import { QualificationEmployeesResponse } from '../types/QualificationEmployeeResponse';

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
  employeeCounts = signal<Map<number, number>>(new Map());

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
    'eyJhbGciOiJSUzI1NiIsImtpZCI6ImM0MDc3MzdjMTg1MzQyYTk5Y2VlYzcyMTQwM2I4NjViIiwidHlwIjoiSldUIn0.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjkwMDAvYXBwbGljYXRpb24vby9lbXBsb3llZV9hcGkvIiwic3ViIjoiYjBlMDExYmU0Y2VlYzliOTYwNzA0MDY3ODU0OWJmNzA4M2I5ZjAwNGQ2MGQ2MTU5NTAwNjIwOWYyMmY5NmY1ZCIsImF1ZCI6ImVtcGxveWVlX2FwaV9jbGllbnQiLCJleHAiOjE3NjgwOTM0NzAsImlhdCI6MTc2ODA5MDQ3MCwiYXV0aF90aW1lIjoxNzY4MDkwNDcwLCJhY3IiOiJnb2F1dGhlbnRpay5pby9wcm92aWRlcnMvb2F1dGgyL2RlZmF1bHQiLCJhenAiOiJlbXBsb3llZV9hcGlfY2xpZW50IiwidWlkIjoiR2tYa2FoNUZJMlRWcVFLdmFlSUFmYkFOS1RtV29YeDZ6aUtoMFZ5dCJ9.UgqGS92iKDdrsM2hkoildmT1yZFL2pQa-Qpi_QM3_nEjWLXXUWqUfc58Czg8wPaOL1RzkFqHHjaPC6qoPORmtkqFmhf52DQRoXbC88hgjmuMUYqKFnqgnlxsImlNu6eF4l3KRWhC-jLb0hWyKF5PJiOLPr_0YAQoD2T18UdsKL67NscC5HGJR4VDjx9PLakvpsNS2jmSdjIbXo2CZkvhJ1qffU6ZY48Ur1631qXwDaRbfBL0jG8ZxCm3Q6PEEhtP80cvYM7AT1vZS1qOH_vfr2PupFwShuLu76ztq8Ku17CJ3vtN_rtc55hC7vKGNbUKq8ZUspQfLBZmUIx4Tlh187xa3-AmduU0oUrv25NdRXttE32H5jzDRFx7Sd7RhQRgDrAxQMU0RvtYP0SErS7mSK-NlJu5qEkb7tQP2GsjlaXXSDC-WpaoHh0IxrvZOEXUZCEt-1meoKNIKkWPNOCrV4EKxa9cYErjwtSVnMcdcRCSir9luSbk8qE6m349TLrYkAE3XxvlR4OPBrX9smT4xAGtU974YQf2Vn3IfMw1yMb9JSXDVF_BMnpM61vt7Yzt73R4d07HpkcYHvHS0zmg0lunq2YncNJUNXvjPQ1GATlUNLmimvlxM6sg-hvA1W7E3-CwJNTbvqTTkqKjQ_j2Y0Jp2YIqrssknfn-uAaEmxw';

  private apiUrl = 'http://localhost:8089/qualifications';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadQualifications();
  }

  /**
   * Load all qualifications AND their employee counts
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
          this.loadEmployeeCounts(data);
        },
        error: (error) => {
          console.error('Error loading qualifications:', error);
          alert('Failed to load qualifications. Check console for details.');
        },
      });
  }

  /**
   * Load employee counts
   */
  private loadEmployeeCounts(qualifications: Qualification[]): void {
    if (qualifications.length === 0) {
      return;
    }

    const requests = qualifications.map((q) =>
      this.http.get<QualificationEmployeesResponse>(
        `${this.apiUrl}/${q.id}/employees`,
        {
          headers: new HttpHeaders().set(
            'Authorization',
            `Bearer ${this.TEMP_TOKEN}`
          ),
        }
      )
    );

    forkJoin(requests).subscribe({
      next: (results) => {
        const counts = new Map<number, number>();

        qualifications.forEach((q, index) => {
          const employeeCount = results[index].employees.length;
          counts.set(q.id, employeeCount);
        });

        this.employeeCounts.set(counts);
      },
      error: (error) => {
        console.error('Error loading employee counts:', error);
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
    const qualification = this.qualifications().find((q) => q.id === id);

    this.http
      .get<QualificationEmployeesResponse>(`${this.apiUrl}/${id}/employees`, {
        headers: new HttpHeaders().set(
          'Authorization',
          `Bearer ${this.TEMP_TOKEN}`
        ),
      })
      .subscribe({
        next: (response) => {
          const employees = response.employees;

          if (employees.length === 0) {
            alert('No employees have this qualification yet.');
          } else {
            const employeeNames = employees
              .map((e) => `${e.firstName} ${e.lastName}`)
              .join('\n');
            alert(
              `Employees with ${response.qualification.skill}:\n\n${employeeNames}`
            );
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

  /**
   * Helper Methode um Count für eine Qualifikation zu bekommen
   */
  getEmployeeCount(qualificationId: number): number {
    return this.employeeCounts().get(qualificationId) || 0;
  }
}
