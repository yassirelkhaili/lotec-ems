import { Component, OnInit } from '@angular/core';
import { Employee } from '../../types/Employee';
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
  employee: any = null;
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
      next: (employee: any) => {
        this.employee = employee;
        this.qualifications = employee && employee.skillSet ? employee.skillSet : [];
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to load employee data.';
        this.isLoading = false;
        console.error('Error loading employee:', error);
      }
    });
  }

  onEdit() {
    if (this.employee && this.employee.id) {
      this.router.navigate(['/dashboard/employees', this.employee.id, 'edit']);
    }
  }

  onDelete() {
    if (this.employee && this.employee.id) {
      if (confirm('Are you sure you want to delete this employee?')) {
        this.employeeService.deleteEmployee(this.employee.id).subscribe({
          next: () => {
            this.router.navigate(['/employees']);
          },
          error: () => {
            alert('Failed to delete employee.');
          }
        });
      }
    }
  }

  onBack() {
    this.router.navigate(['/employees']);
  }
}