import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Qualification } from '../types/Qualification';

@Component({
  selector: 'app-qualifications-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './qualifications-list.component.html',
  styleUrls: ['./qualifications-list.component.css'],
})
export class QualificationsListComponent implements OnInit {
  qualifications$: Observable<Qualification[]>;
  qualifications: Qualification[] = [];

  // Form data for create/update
  selectedQualification: Qualification | null = null;
  qualificationForm = {
    id: 0,
    skill: '',
  };

  isEditMode = false;
  showForm = false;

  // TODO: Replace with AuthService when ready
  // For now: Get token from getBearerToken.http
  private TEMP_TOKEN =
    'eyJhbGciOiJSUzI1NiIsImtpZCI6ImM0MDc3MzdjMTg1MzQyYTk5Y2VlYzcyMTQwM2I4NjViIiwidHlwIjoiSldUIn0.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjkwMDAvYXBwbGljYXRpb24vby9lbXBsb3llZV9hcGkvIiwic3ViIjoiYjBlMDExYmU0Y2VlYzliOTYwNzA0MDY3ODU0OWJmNzA4M2I5ZjAwNGQ2MGQ2MTU5NTAwNjIwOWYyMmY5NmY1ZCIsImF1ZCI6ImVtcGxveWVlX2FwaV9jbGllbnQiLCJleHAiOjE3NjgwODM1MDYsImlhdCI6MTc2ODA4MDUwNiwiYXV0aF90aW1lIjoxNzY4MDgwNTA2LCJhY3IiOiJnb2F1dGhlbnRpay5pby9wcm92aWRlcnMvb2F1dGgyL2RlZmF1bHQiLCJhenAiOiJlbXBsb3llZV9hcGlfY2xpZW50IiwidWlkIjoiOHU3NGd1SDBjbkthWHhCbVBXaGNxcktnWFpMaDE3SWR4N1V2dzlkMiJ9.OGM5cOBEiiLLR4qp0D2FTGbfhKjo30dZFfxIhoG9DlCaJRWvD7hLZMhV7reRMC0iddi_YzraZqHzoYYqB3OWujvFmbPzeUZ_U24qtkdC0dA9AvFc6DmB-4sOuk0RPHpRky44h2KccquenkYbKRR4M2XIDcOD4mnIkAa573-Lzhupci1GpqaFoa7_As4JaMfp8ddpyU-mlUX-Sv7CUQfq-XJT9Q9PbqYpFXTa-CkD_pZBXU2lT9hnVlNgEHMBNhO9_GqlAhOs6MMjeR6hBktytPhZqd3jeF3CJxyzx3lGeqmPyutvkzjvmOFNUjgh5lDhuQnaengLn5atZiAFcUs7N38hvhGKPSZow0CIcpgad7dvh3OVzogEiIRAyu-_QWYkZTfF9mgWdf5qJjLyAD4CWRSRUo9HyotL-bjIsJMeDXZcVRq4nWkrX34cY00GDrYbfav1vISSZbIAjsWNASIMlhmCEzPqTPv0_EF3wA89tTBF7T9od03GTBc_GdugttziQx57NpUhoUoUobLx8T_4nt_XsWEIOHvnUVrjy4oPp1Osul9TRvsDhZm8fprorM_w_AU1EDi2sU-ZH-VehuIl0rvd6ZC6grV7Dirjyi-isw-Bny4Q1-CPxFFWfJkmaMOkCbd-akw8eSsKvxl3q5jMAJlHbv2sj4FDm2uue_yPIb8';

  private apiUrl = 'http://localhost:8089/qualifications';

  constructor(private http: HttpClient) {
    this.qualifications$ = new Observable<Qualification[]>();
  }

  ngOnInit(): void {
    this.loadQualifications();
  }

  /**
   * Load all qualifications from API
   */
  loadQualifications(): void {
    this.qualifications$ = this.http.get<Qualification[]>(this.apiUrl, {
      headers: new HttpHeaders().set(
        'Authorization',
        `Bearer ${this.TEMP_TOKEN}`
      ),
    });

    // Subscribe to update local array for filtering/sorting if needed
    this.qualifications$.subscribe({
      next: (data) => {
        this.qualifications = data;
      },
      error: (error) => {
        console.error('Error loading qualifications:', error);
        alert('Failed to load qualifications. Check console for details.');
      },
    });
  }

  /**
   * Show create form
   */
  showCreateForm(): void {
    this.isEditMode = false;
    this.showForm = true;
    this.qualificationForm = {
      id: 0,
      skill: '',
    };
  }

  /**
   * Show edit form with selected qualification
   */
  editQualification(qualification: Qualification): void {
    this.isEditMode = true;
    this.showForm = true;
    this.selectedQualification = qualification;
    this.qualificationForm = {
      id: qualification.id,
      skill: qualification.skill,
    };
  }

  /**
   * Cancel form and hide it
   */
  cancelForm(): void {
    this.showForm = false;
    this.selectedQualification = null;
    this.qualificationForm = {
      id: 0,
      skill: '',
    };
  }

  /**
   * Create new qualification
   */
  createQualification(): void {
    if (!this.qualificationForm.skill.trim()) {
      alert('Please enter a skill');
      return;
    }

    const newQualification = {
      skill: this.qualificationForm.skill,
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
    if (!this.qualificationForm.skill.trim()) {
      alert('Please enter a skill');
      return;
    }

    if (!this.selectedQualification) {
      return;
    }

    const updatedQualification = {
      id: this.qualificationForm.id,
      skill: this.qualificationForm.skill,
    };

    this.http
      .put<Qualification>(
        `${this.apiUrl}/${this.qualificationForm.id}`,
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
    if (this.isEditMode) {
      this.updateQualification();
    } else {
      this.createQualification();
    }
  }
}
