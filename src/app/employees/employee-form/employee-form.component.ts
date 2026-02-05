import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../employee.model';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.css'
})
export class EmployeeFormComponent implements OnInit {
  employeeForm: FormGroup;
  isEditMode = false;
  employeeId: number | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  // qualifications removed

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {
          this.employeeForm = this.fb.group({
            firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
            lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
            street: ['', Validators.required],
            postcode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
            city: ['', Validators.required],
            phone: ['', [Validators.required, Validators.pattern(/^[\+]?[0-9\s\-\(\)]+$/)]],
            // qualifications removed
          });
  }

  ngOnInit() {
    // qualifications fetch removed
    const idParam = this.route.snapshot.params['id'];
    if (idParam) {
      const parsedId = parseInt(idParam, 10);
      if (!isNaN(parsedId) && parsedId > 0) {
        this.employeeId = parsedId;
        this.isEditMode = true;
        this.loadEmployee(this.employeeId);
      } else {
        this.errorMessage = 'Invalid employee ID.';
      }
    }
  }

  loadEmployee(id: number) {
    this.employeeService.getEmployee(id).subscribe({
      next: (employee: { [key: string]: any; }) => {
        this.employeeForm.patchValue(employee);
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to load employee data.';
        console.error('Error loading employee:', error);
      }
    });
  }

  onSubmit() {
    if (this.employeeForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';


      // Create employee object with qualifications
      const formValue = this.employeeForm.value;
      let operation;
      const employee: any = {
        id: this.isEditMode && this.employeeId ? this.employeeId : 0,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        street: formValue.street,
        postcode: formValue.postcode,
        city: formValue.city,
        phone: formValue.phone
      };
      if (this.isEditMode && this.employeeId) {
        operation = this.employeeService.updateEmployee(this.employeeId, employee);
      } else {
        operation = this.employeeService.createEmployee(employee);
      }

      operation.subscribe({
        next: (result) => {
          this.isLoading = false;
          this.successMessage = this.isEditMode ? 'Employee updated successfully!' : 'Employee created successfully!';
          setTimeout(() => {
            this.router.navigate(['/employees']);
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Failed to save employee. Please try again.';
          console.error('Error saving employee:', error);
        }
      });
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
      // Mark all fields as touched to show validation errors
      Object.keys(this.employeeForm.controls).forEach(key => {
        this.employeeForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel() {
    this.router.navigate(['/employees']);
  }
}