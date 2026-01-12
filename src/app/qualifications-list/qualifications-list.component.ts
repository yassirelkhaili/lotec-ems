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
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { QualificationFormComponent } from './qualification-form/qualification-form.component';

@Component({
  selector: 'app-qualifications-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    QualificationFormComponent,
    EmployeeListComponent,
  ],
  templateUrl: './qualifications-list.component.html',
  styleUrls: ['./qualifications-list.component.css'],
})
export class QualificationsListComponent implements OnInit {
  // Signals
  qualifications = signal<Qualification[]>([]);
  searchTerm = signal<string>('');
  modalType = signal<'create' | 'edit' | 'delete' | 'view' | null>(null);
  selectedQualification = signal<Qualification | null>(null);
  employeeCounts = signal<Map<number, number>>(new Map());

  // Computed Signals
  isModalOpen = computed(() => this.modalType() !== null);

  filteredQualifications = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    if (!search) return this.qualifications();

    return this.qualifications().filter((q) =>
      q.skill.toLowerCase().includes(search)
    );
  });

  // Form
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

  // TODO: Replace with AuthService (Marouane)
  private TEMP_TOKEN =
    'eyJhbGciOiJSUzI1NiIsImtpZCI6ImM0MDc3MzdjMTg1MzQyYTk5Y2VlYzcyMTQwM2I4NjViIiwidHlwIjoiSldUIn0.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjkwMDAvYXBwbGljYXRpb24vby9lbXBsb3llZV9hcGkvIiwic3ViIjoiYjBlMDExYmU0Y2VlYzliOTYwNzA0MDY3ODU0OWJmNzA4M2I5ZjAwNGQ2MGQ2MTU5NTAwNjIwOWYyMmY5NmY1ZCIsImF1ZCI6ImVtcGxveWVlX2FwaV9jbGllbnQiLCJleHAiOjE3NjgyMjAzNTUsImlhdCI6MTc2ODIxNzM1NSwiYXV0aF90aW1lIjoxNzY4MjE3MzU1LCJhY3IiOiJnb2F1dGhlbnRpay5pby9wcm92aWRlcnMvb2F1dGgyL2RlZmF1bHQiLCJhenAiOiJlbXBsb3llZV9hcGlfY2xpZW50IiwidWlkIjoienBQYmVwelpoVmZ0b3NzSnNWcVczU2wzQ0lucnNSb3N1RUlpTmpQdCJ9.P0eyahVs8UJAk5RZ062UanY1QokXUS2eRHOWH6KWHU06kUI45aYprmdo5hBOINpnXdYhfqBCHDpgSCCI0BCxkb2juQdHSAfl_VkrGDfZmxXCAecd6It-VCGpHd6r_8EKC_sSn9NgIbUU8pNZ-ZrwliZc9zlZJHFu9MyPmsl5X4yPS_RSttQl5k_UVOw4OQVJboF-Ea0uvli-kaJX-vr_ACrJgaLxpPrS5F3rsnsdm5hdOV6PEg_ZpLLwzwPmevAOM9RogIrn4exqE2mtDZ91-KdtJSrDyZAzPDa1pGJWvPkAYI7_db15O-X6qwAp4AMbU71tnXH7o8nPN4zf87E3aLrQsshOHtutuVBXN8B8zZvPNvLpWQBumH6219BZQwnwweMe5Qf2TpPzblT4OK-QbnSR85qDnJM2AwMhbgDo-HPHySEqzMi4F1xAfY7jv8UYGThBWEZKsNzv8vtzeAJ8jfJYRRvIqNtvNBObb6jNBWnnNytGBqHeGOGoaT4B1_Kk9cjyDzHLi4qiwFdeieZrAkqCetO0GC4zRcDD1TTzq4CatxmViyHXsLTkQUibI60vSsmxPX6E7U7K63LU4a8NMja4RpCnvKnzFVGnuF9YYVnGFXGoG2VJo0ib-lvn3XEvdg5_5wJGUsS7YVqfeVYE3E5wJm6rnJwfGT0uK2SJzD4';

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
   * Load employee counts for all qualifications
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
   * Get employee count for a qualification
   */
  getEmployeeCount(qualificationId: number): number {
    return this.employeeCounts().get(qualificationId) || 0;
  }

  /**
   * Search change handler
   */
  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  // ========== MODAL FUNCTIONS ==========

  /**
   * Open create modal
   */
  openCreateModal(): void {
    this.modalType.set('create');
    this.qualificationForm.reset();
    document.body.classList.add('modal-open');
  }

  /**
   * Open edit modal
   */
  openEditModal(qualification: Qualification): void {
    this.modalType.set('edit');
    this.selectedQualification.set(qualification);
    this.qualificationForm.patchValue({
      id: qualification.id,
      skill: qualification.skill,
    });
    document.body.classList.add('modal-open');
  }

  /**
   * Open delete confirmation modal
   */
  openDeleteModal(qualification: Qualification): void {
    this.modalType.set('delete');
    this.selectedQualification.set(qualification);
    document.body.classList.add('modal-open');
  }

  /**
   * Open view employees modal
   */
  openViewModal(qualification: Qualification): void {
    this.modalType.set('view');
    this.selectedQualification.set(qualification);
    document.body.classList.add('modal-open');
  }

  /**
   * Close modal
   */
  closeModal(): void {
    this.modalType.set(null);
    this.selectedQualification.set(null);
    this.qualificationForm.reset();
    document.body.classList.remove('modal-open');
  }

  /**
   * Handle backdrop click (click outside modal)
   */
  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal();
    }
  }

  // ========== CRUD OPERATIONS ==========

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
          this.closeModal();
          alert('Qualifikation erfolgreich erstellt!');
        },
        error: (error) => {
          console.error('Error creating qualification:', error);
          alert('Fehler beim Erstellen der Qualifikation.');
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
          this.closeModal();
          alert('Qualifikation erfolgreich aktualisiert!');
        },
        error: (error) => {
          console.error('Error updating qualification:', error);
          alert('Fehler beim Aktualisieren der Qualifikation.');
        },
      });
  }

  /**
   * Delete qualification (called from delete modal)
   */
  confirmDelete(): void {
    const id = this.selectedQualification()?.id;
    if (!id) return;

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
          this.closeModal();
          alert('Qualifikation erfolgreich gelöscht!');
        },
        error: (error) => {
          console.error('Error deleting qualification:', error);
          alert('Fehler beim Löschen der Qualifikation.');
        },
      });
  }

  /**
   * Submit form (create or update based on modal type)
   */
  onSubmit(): void {
    if (this.modalType() === 'edit') {
      this.updateQualification();
    } else if (this.modalType() === 'create') {
      this.createQualification();
    }
  }

  /**
   * Form control getter for template
   */
  get skill() {
    return this.qualificationForm.controls.skill;
  }
}
