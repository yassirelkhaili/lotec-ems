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
    'eyJhbGciOiJSUzI1NiIsImtpZCI6ImM0MDc3MzdjMTg1MzQyYTk5Y2VlYzcyMTQwM2I4NjViIiwidHlwIjoiSldUIn0.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjkwMDAvYXBwbGljYXRpb24vby9lbXBsb3llZV9hcGkvIiwic3ViIjoiYjBlMDExYmU0Y2VlYzliOTYwNzA0MDY3ODU0OWJmNzA4M2I5ZjAwNGQ2MGQ2MTU5NTAwNjIwOWYyMmY5NmY1ZCIsImF1ZCI6ImVtcGxveWVlX2FwaV9jbGllbnQiLCJleHAiOjE3NjgxNjE0OTEsImlhdCI6MTc2ODE1ODQ5MSwiYXV0aF90aW1lIjoxNzY4MTU4NDkxLCJhY3IiOiJnb2F1dGhlbnRpay5pby9wcm92aWRlcnMvb2F1dGgyL2RlZmF1bHQiLCJhenAiOiJlbXBsb3llZV9hcGlfY2xpZW50IiwidWlkIjoib3VyYnNhVGFxTGpNSWFoTWt4VElESmg3b200VG5nY2VjSElxSnVOUSJ9.KRBoCpCWHkq-OI6rW8fTvNUVQ4f7dnL2q73CLLLw-Tdb397IHvX6ImzH5m6DXT4Uh2mksAykkI2Qeaky7SEdpZ4sLz1897CN7KHkDrwbgK2ErrMJyxyfPUuBWZCQsjuaEAKxFCRrE-uffpNwixZFi03Juqd8xwK_xGoO5BmRoD9MSx372-cBHIp2HbIBJPu6_NA4VVTFiKXoiHRuPibc-BCe2wBE5CeyRzlvCwVbETB0M8Bg-mmNtIPp5DfwA52QeOw_OqqEsY0eShEBpM4eqHu5bAnGEnEg2z6Zqw3IE8YepIgBS_L66nIXn4zxRDpbF1KFrwdtNXc76xLjWRhatg9eYVgqDTgfh33YKoSqlML2lNhWkJ2Fka4BJXb683PyvOb7qrUm3ehXVzM4NDvYYu57UagKgymajeM8wmAKrhN0eqmL7dmvUaCjH0Rc3qxooa6Ptaro9bf03CfGGginXOEi0O6Xasi0desxdUbvPxIgj0ng42Yu8oTGNA5LAIbovl-6k1zZXMQi2wncNpCiNQNnGwXj2gFDy5hzkbkY19fSWM4nnLM0-AQTYVT8rrR_4mpC6le-Yif2jFqWeWaNH-AwuTCkD8j5gKA72buAcpwGHZ4VlV4oZuqNb1wcQIePp-Ot7xfBkdOQTPCz5flvnyoRnELTGnvxWCLAWXA31UA';

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
