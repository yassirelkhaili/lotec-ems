import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Qualification } from '../types/Qualification';
import { forkJoin } from 'rxjs';
import { QualificationEmployeesResponse } from '../types/QualificationEmployeeResponse';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { QualificationFormComponent } from './qualification-form/qualification-form.component';
import { AuthService } from '../services/auth.service';

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

  private apiUrl = 'http://localhost:8089/qualifications';

  constructor(private http: HttpClient, private authService: AuthService) {}

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
    const token = this.authService.getToken();
    if (!token) {
      console.error('No authentication token available');
      return;
    }

    this.http
      .get<Qualification[]>(this.apiUrl, {
        headers: new HttpHeaders().set(
          'Authorization',
          `Bearer ${token}`
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

    const token = this.authService.getToken();
    if (!token) {
      console.error('No authentication token available');
      return;
    }

    const requests = qualifications.map((q) =>
      this.http.get<QualificationEmployeesResponse>(
        `${this.apiUrl}/${q.id}/employees`,
        {
          headers: new HttpHeaders().set(
            'Authorization',
            `Bearer ${token}`
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

    const token = this.authService.getToken();
    if (!token) {
      alert('Authentifizierungstoken nicht verfügbar');
      return;
    }

    this.http
      .post<Qualification>(this.apiUrl, newQualification, {
        headers: new HttpHeaders()
          .set('Authorization', `Bearer ${token}`)
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
    this.formTouched.set(true);
    this.validateForm();

    if (!this.isFormValid() || this.formError()) {
      return;
    }

    const updatedQualification = {
      id: this.formId(),
      skill: this.formSkill().trim(),
    };

    const token = this.authService.getToken();
    if (!token) {
      alert('Authentifizierungstoken nicht verfügbar');
      return;
    }

    this.http
      .put<Qualification>(
        `${this.apiUrl}/${updatedQualification.id}`,
        updatedQualification,
        {
          headers: new HttpHeaders()
            .set('Authorization', `Bearer ${token}`)
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

    const token = this.authService.getToken();
    if (!token) {
      alert('Authentifizierungstoken nicht verfügbar');
      return;
    }

    this.http
      .delete(`${this.apiUrl}/${id}`, {
        headers: new HttpHeaders().set(
          'Authorization',
          `Bearer ${token}`
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
}
