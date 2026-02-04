import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from '../employees/employee.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = '/backend/employees';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getEmployee(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee, { headers: this.getHeaders() });
  }

  updateEmployee(id: number, employee: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${id}`, employee, { headers: this.getHeaders() });
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getEmployeeQualifications(employeeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${employeeId}/qualifications`, { headers: this.getHeaders() });
  }
}