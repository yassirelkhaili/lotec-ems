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
    'eyJhbGciOiJSUzI1NiIsImtpZCI6ImM0MDc3MzdjMTg1MzQyYTk5Y2VlYzcyMTQwM2I4NjViIiwidHlwIjoiSldUIn0.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjkwMDAvYXBwbGljYXRpb24vby9lbXBsb3llZV9hcGkvIiwic3ViIjoiYjBlMDExYmU0Y2VlYzliOTYwNzA0MDY3ODU0OWJmNzA4M2I5ZjAwNGQ2MGQ2MTU5NTAwNjIwOWYyMmY5NmY1ZCIsImF1ZCI6ImVtcGxveWVlX2FwaV9jbGllbnQiLCJleHAiOjE3NjgwNTgwNjgsImlhdCI6MTc2ODA1NTA2OCwiYXV0aF90aW1lIjoxNzY4MDU1MDY4LCJhY3IiOiJnb2F1dGhlbnRpay5pby9wcm92aWRlcnMvb2F1dGgyL2RlZmF1bHQiLCJhenAiOiJlbXBsb3llZV9hcGlfY2xpZW50IiwidWlkIjoiRHZuRWxLSzBvR3VkS2VwMnhkVVFlMTFaVkZDZ1V2N0hidXRUWk5rMiJ9.URmwqf7WCY_xv6omrihoFspwyeAk-wIfeYZVBgwdrWHr0DqS51fjCObm_ugcZkoaWzGoJVOlUXtj1Y6Q_QurFG3BLbZJ9FrQ7QRRE1sJPk1roI_fPjcqkLq88ZC9eiQ4qLYCOGNrz-09QD54e9-Sw_TEihmXytL6xbqAfUUg8-3z4AUg3xcR9huL8BcTaJg_KQjoogrHUlUAX-IK5lI0qePhfZj9TymbYviq0vEcVsatRqi9uHNHMDzXe5iu-tOpSimDQ25vXrdHki4WosNGRPyb9vu3oL4aWfiJnesCzxYk376APYpu5mAo2thc6STr_QLXVpSMsO0dW_BfqKLZB0VLpxhfK7St8Nxo1h7gqu-BBGCtwMy_CqtyDM5x4bnviO66WsqyrRYcCGEN4sXlxVa2ATW3K_dItD7lZRVDTQkVRsTAJbIafChyZ_6qe0U5_DGiQUd-uRGFpUA6Lj-Tq7j7dwwYlCnP-EI6GsYcqYQSDOKcKZ1Y_91WIKJ0RTlABfQUj5Po4TIhAIPZEyGHI4msrIUvLEmr6wOOM5_CeWAz4QWMqyISbzR-_pHZhhsudejZE84HD_OKcSTeWBqXYI4PI75JRUeqD4X6TkKvD6S7PN2KGqFVI-tcrgZe4qmE1QYyc7WECd4VaXqQCbdAEXDl14hr6f20RI2Ib7LMFMk'; // <-- REPLACE THIS WITH YOUR TOKEN

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
