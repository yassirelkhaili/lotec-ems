import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../types/Employee';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.css'
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];

  searchTerm = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.filteredEmployees = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load employees';
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredEmployees = this.employees.filter(emp =>
      (emp.firstName ?? '').toLowerCase().includes(term) ||
      (emp.lastName ?? '').toLowerCase().includes(term) ||
      (emp.city ?? '').toLowerCase().includes(term)
    );
  }

  onAddEmployee(): void {
    this.router.navigate(['dashboard', 'employees', 'add']);
  }

  onViewEmployee(employee: Employee): void {
    this.router.navigate(['dashboard', 'employees', employee.id]);
  }

  onEditEmployee(employee: Employee): void {
    this.router.navigate(['dashboard', 'employees', employee.id, 'edit']);
  }

  onDeleteEmployee(employee: Employee): void {
    if (!confirm(`Are you sure you want to delete ${employee.firstName} ${employee.lastName}?`)) {
      return;
    }
    if (typeof employee.id !== 'number') {
      this.errorMessage = 'Invalid employee ID.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.employeeService.deleteEmployee(employee.id).subscribe({
      next: () => {
        this.successMessage = 'Employee deleted successfully.';
        this.fetchData();
      },
      error: () => {
        this.errorMessage = 'Failed to delete employee.';
        this.isLoading = false;
      }
    });
  }
}