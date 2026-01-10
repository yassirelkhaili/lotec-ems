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
    designation: '',
  };

  isEditMode = false;
  showForm = false;

  // TODO: Replace with AuthService when ready
  // For now: Get token from getBearerToken.http
  private TEMP_TOKEN =
    'eyJhbGciOiJSUzI1NiIsImtpZCI6ImM0MDc3MzdjMTg1MzQyYTk5Y2VlYzcyMTQwM2I4NjViIiwidHlwIjoiSldUIn0.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjkwMDAvYXBwbGljYXRpb24vby9lbXBsb3llZV9hcGkvIiwic3ViIjoiYjBlMDExYmU0Y2VlYzliOTYwNzA0MDY3ODU0OWJmNzA4M2I5ZjAwNGQ2MGQ2MTU5NTAwNjIwOWYyMmY5NmY1ZCIsImF1ZCI6ImVtcGxveWVlX2FwaV9jbGllbnQiLCJleHAiOjE3NjgwNjYxNjcsImlhdCI6MTc2ODA2MzE2NywiYXV0aF90aW1lIjoxNzY4MDYzMTY3LCJhY3IiOiJnb2F1dGhlbnRpay5pby9wcm92aWRlcnMvb2F1dGgyL2RlZmF1bHQiLCJhenAiOiJlbXBsb3llZV9hcGlfY2xpZW50IiwidWlkIjoiUnZnNFhxYVYyVW9tVEdvckhDUmhpNlRZdzhMUnNoMjJ3ZVVzQ29MRSJ9.Ls-ZMlVytkkqyZ2T-I5ddctvZ1Am_lzbqfWv3AtpdBgtE9-wOyApV-pks4rNvfups9Q5E_qlnFOUcYOjf8GfORWasa6gvvl1Bvu_EXcixomLVzvvfQUf4QubV872kJPRHZK0p7BOsm1Z5HQjFN-4VNFhRqvaBrZpY43qvn0kl1HGOJvMGawkcCIFIdiEQoJuns6rBajMs0wNyfjiZ-I2Gi9h8CCejQUS1ix0TRA8VK227XQTwDQXtYT8rSgAD7fgeOz9tY63RqnyRlbLSjEmG0bJeimjowsiLLx_0ku3Xs5J4IoqAPEmjNBR8I6QQ1SsPSKfxABBn9i4oNV8-h15owACC4_o8R0i135XCiI8wX-jzRCcWc6pDOx5dwCggRYIPw05KlYJGEFE4yPUmKtrxmAxs6tsyGrthKTEEtkrSwqt5PeabgrwFcY9-MTa5St47NjmEkaedH83oSwKKOZ_7H-f2inytDSOjCAEGak3ZlJ_xO_Sv07DqkUhy_UUYTqNzP8VpvmCIebXXAwd8BaAQbeHyuLzBKNdbLH07M0jv2IEvxumFPmGDDoZaVUWMHNFEhQGHvMQqS-bqu2fHiraJXO0pqjgdKVLX_-zsGs0ObxRfKjngZBsF_1e-uvm2y9ev7XNYx-V4yGhH8d9bOcJiFO7wz30-bnYeqZw5BZRxyg';

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
      designation: '',
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
      designation: qualification.designation,
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
      designation: '',
    };
  }

  /**
   * Create new qualification
   */
  createQualification(): void {
    if (!this.qualificationForm.designation.trim()) {
      alert('Please enter a designation');
      return;
    }

    const newQualification = {
      designation: this.qualificationForm.designation,
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
    if (!this.qualificationForm.designation.trim()) {
      alert('Please enter a designation');
      return;
    }

    if (!this.selectedQualification) {
      return;
    }

    const updatedQualification = {
      id: this.qualificationForm.id,
      designation: this.qualificationForm.designation,
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
