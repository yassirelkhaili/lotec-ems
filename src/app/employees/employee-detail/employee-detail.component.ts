import { Component, OnInit } from '@angular/core';
import { Employee } from '../../types/Employee'; // Fixed: Use the correct path to the Employee type
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../../services/employee.service';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-detail.component.html',
  styleUrl: './employee-detail.component.css'
})
export class EmployeeDetailComponent implements OnInit {
  employee: Employee | null = null;
  qualifications: any[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private employeeService: EmployeeService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.params['id'];
    if (idParam) {
      const parsedId = parseInt(idParam, 10);
      if (!isNaN(parsedId) && parsedId > 0) {
        this.loadEmployee(parsedId);
      } else {
        this.errorMessage = 'Invalid employee ID.';
        this.isLoading = false;
      }
    } else {
      this.errorMessage = 'No employee ID provided.';
      this.isLoading = false;
    }
  }

  loadEmployee(id: number) {
    this.employeeService.getEmployee(id).subscribe({
      next: (employee: Employee | null) => {
        this.employee = employee;
        this.loadQualifications(id);
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to load employee data.';
        this.isLoading = false;
        console.error('Error loading employee:', error);
      }
    });
  }

  loadQualifications(employeeId: number) {
    this.employeeService.getEmployeeQualifications(employeeId).subscribe({
      next: (qualifications: any[]) => {
        this.qualifications = qualifications;
        this.isLoading = false;
      },
      error: (error: any) => {
        // Don't overwrite employee error message if it exists
        if (!this.errorMessage) {
          this.errorMessage = 'Failed to load qualifications.';
        }
        this.isLoading = false;
        console.error('Error loading qualifications:', error);
      }
    });
  }

  onEdit() {
    if (this.employee && this.employee.id) {
      this.router.navigate(['/employees', this.employee.id, 'edit']);
    }
  }

  onDelete() {
    if (this.employee && this.employee.id && confirm('Are you sure you want to delete this employee?')) {
      this.employeeService.deleteEmployee(this.employee.id).subscribe({
        next: () => {
          alert('Employee deleted successfully!');
          this.router.navigate(['/employees']);
        },
        error: (error: any) => {
          this.errorMessage = 'Failed to delete employee.';
          console.error('Error deleting employee:', error);
        }
      });
    }
  }

  onBack() {
    this.router.navigate(['/employees']);
  }
}