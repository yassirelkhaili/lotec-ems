import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Qualification } from '../types/Qualification';
import { forkJoin } from 'rxjs';
import { QualificationEmployeesResponse } from '../types/QualificationEmployeeResponse';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { QualificationFormComponent } from './qualification-form/qualification-form.component';

@Component({
  selector: 'app-qualifications-list',
  standalone: true,
  imports: [CommonModule, QualificationFormComponent, EmployeeListComponent],
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

  // Signal Form State
  formSkill = signal<string>('');
  formId = signal<number>(0);
  formTouched = signal<boolean>(false);
  formError = signal<string | null>(null);

  // Computed Signals
  isModalOpen = computed(() => this.modalType() !== null);

  filteredQualifications = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    if (!search) return this.qualifications();

    return this.qualifications().filter((q) =>
      q.skill.toLowerCase().includes(search)
    );
  });

  isFormValid = computed(() => {
    const skill = this.formSkill().trim();
    return skill.length >= 2 && skill.length <= 50;
  });

  // TODO: Replace with AuthService (Marouane)
  private TEMP_TOKEN =
    'eyJhbGciOiJSUzI1NiIsImtpZCI6ImM0MDc3MzdjMTg1MzQyYTk5Y2VlYzcyMTQwM2I4NjViIiwidHlwIjoiSldUIn0.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjkwMDAvYXBwbGljYXRpb24vby9lbXBsb3llZV9hcGkvIiwic3ViIjoiYjBlMDExYmU0Y2VlYzliOTYwNzA0MDY3ODU0OWJmNzA4M2I5ZjAwNGQ2MGQ2MTU5NTAwNjIwOWYyMmY5NmY1ZCIsImF1ZCI6ImVtcGxveWVlX2FwaV9jbGllbnQiLCJleHAiOjE3NjgyMzEyNjMsImlhdCI6MTc2ODIyODI2MywiYXV0aF90aW1lIjoxNzY4MjI4MjYzLCJhY3IiOiJnb2F1dGhlbnRpay5pby9wcm92aWRlcnMvb2F1dGgyL2RlZmF1bHQiLCJhenAiOiJlbXBsb3llZV9hcGlfY2xpZW50IiwidWlkIjoickoxZk9RUjBNd1V2OHdVV2JXSXRUYmtvc0VEMEpTR0w2ZUJvVXliRiJ9.UClzkgBMTm1VUtpw5sU8F5NmKIfKjZHx688bfCyiFL4NUtLiURSlBLoUtxEievaksoMxGVqRhg9On_p60qF6_RYhR4fK6PMojys5VvUNOcjGjUPCFK4SCF5YAJRWbcbX-7Epm5-quMIiVAoVQX3aKkyDneMCJ7LOPNoMDTvMpZCuW_SyvHTxEdp3N9rU9HlDHsCDl2khaAyp-iclVBzurCbP2TqneljgT3SrcQPq9k8EzbNmY2F1jm38wKbaLdh6nkVJVMJOcHFDUChR_MRmfdfM-oeRia6yU6C4tAQRKERVR6FANmSdSCcgUh9OwrHZJoYHN8Gu3jdDYvcwKY6azZqDNxYPpXkWfIVEaKzP8RPkyeUQW7OmAG8xhqQI81l_wYGKva6_qu-3LNtPB7BL7wrrm7Ez6kQ0lAf7fr2RDFWI6Rx2JNUWU-Zymckp-XCuOLr12FffrgqNCMufb3v_OUqqXD-iUtAtcEGD9gdMPwdiYGLHVhfeJk-CQzAKmjRgblXgWu0zgMDQ8eS0gF_uqdgznBZAKzavEKg6LrCKm6Am_AiJkrS9_VzbLDC30dgeOsfsAWvyU7WO9ohAXEN4ygluyMvdHS3hDuG0AI-eVopqyrSsccvMXuZG_0WKnTlQlh3tWt9YjUjf0wt4Tga0g9RgPJMuJXPEmmK51qMESfI';

  private apiUrl = 'http://localhost:8089/qualifications';
  private employeesApiUrl = 'http://localhost:8089/employees';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadQualifications();
  }

  /**
   * Validate form
   */
  validateForm(): void {
    const skill = this.formSkill().trim();

    if (!skill) {
      this.formError.set('Bezeichnung ist erforderlich');
    } else if (skill.length < 2) {
      this.formError.set('Mindestens 2 Zeichen erforderlich');
    } else if (skill.length > 50) {
      this.formError.set('Maximal 50 Zeichen erlaubt');
    } else {
      this.formError.set(null);
    }
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
    this.formSkill.set('');
    this.formId.set(0);
    this.formTouched.set(false);
    this.formError.set(null);
    document.body.classList.add('modal-open');
  }

  /**
   * Open edit modal
   */
  openEditModal(qualification: Qualification): void {
    this.modalType.set('edit');
    this.selectedQualification.set(qualification);
    this.formSkill.set(qualification.skill);
    this.formId.set(qualification.id);
    this.formTouched.set(false);
    this.formError.set(null);
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
    this.formSkill.set('');
    this.formId.set(0);
    this.formTouched.set(false);
    this.formError.set(null);
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
    this.formTouched.set(true);
    this.validateForm();

    if (!this.isFormValid() || this.formError()) {
      return;
    }

    const newQualification = {
      skill: this.formSkill().trim(),
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

          if (
            error.status === 500 &&
            error.error?.message?.includes('duplicate key')
          ) {
            alert(
              `Die Qualifikation "${this.formSkill().trim()}" existiert bereits!`
            );
          } else {
            alert('Fehler beim Erstellen der Qualifikation.');
          }
        },
      });
  }

  /**
   * Update existing qualification
   */
  updateQualification(): void {
    this.formTouched.set(true);
    this.validateForm();

    if (!this.isFormValid() || this.formError()) {
      return;
    }

    const updatedQualification = {
      id: this.formId(),
      skill: this.formSkill().trim(),
    };

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

          if (
            error.status === 500 &&
            error.error?.message?.includes('duplicate key')
          ) {
            alert(
              `Die Qualifikation "${this.formSkill().trim()}" existiert bereits!`
            );
          } else {
            alert('Fehler beim Aktualisieren der Qualifikation.');
          }
        },
      });
  }

  /**
   * Delete qualification (called from delete modal)
   */
  confirmDelete(): void {
    const qualification = this.selectedQualification();
    if (!qualification) return;

    const employeeCount = this.getEmployeeCount(qualification.id);

    // Step 1: If employees have this qualification, remove it from them first
    if (employeeCount > 0) {
      // Get employees with this qualification
      this.http
        .get<QualificationEmployeesResponse>(
          `${this.apiUrl}/${qualification.id}/employees`,
          {
            headers: new HttpHeaders().set(
              'Authorization',
              `Bearer ${this.TEMP_TOKEN}`
            ),
          }
        )
        .subscribe({
          next: (response) => {
            // Remove qualification from each employee
            const removeRequests = response.employees.map((employee) =>
              this.http.delete(
                `${this.employeesApiUrl}/${employee.id}/qualifications/${qualification.id}`,
                {
                  headers: new HttpHeaders().set(
                    'Authorization',
                    `Bearer ${this.TEMP_TOKEN}`
                  ),
                }
              )
            );

            // Wait for all removals to complete
            forkJoin(removeRequests).subscribe({
              next: () => {
                // Step 2: Now delete the qualification itself
                this.deleteQualification(qualification.id);
              },
              error: (error) => {
                console.error(
                  'Error removing qualification from employees:',
                  error
                );
                alert(
                  'Fehler beim Entfernen der Qualifikation von Mitarbeitern.'
                );
              },
            });
          },
          error: (error) => {
            console.error('Error loading employees for deletion:', error);
            alert('Fehler beim Laden der Mitarbeiter.');
          },
        });
    } else {
      // No employees have this qualification, delete directly
      this.deleteQualification(qualification.id);
    }
  }

  /**
   * Actually delete the qualification after employees are cleaned up
   */
  private deleteQualification(id: number): void {
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

          // Better error handling
          if (error.status === 403) {
            alert(
              'Die Qualifikation ist noch in Verwendung und kann nicht gelöscht werden.'
            );
          } else if (error.status === 500) {
            alert(
              'Serverfehler beim Löschen der Qualifikation. Bitte versuchen Sie es erneut.'
            );
          } else {
            alert('Fehler beim Löschen der Qualifikation.');
          }
        },
      });
  }
}
