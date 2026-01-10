import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, of } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Employee } from "../types/Employee";

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.css'
})
export class EmployeeListComponent {
  bearer = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjBiNGE3Mjc5YjQ1NzJiMDIwMDk3MzI2MTBhNzU4NGU2IiwidHlwIjoiSldUIn0.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjkwMDAvYXBwbGljYXRpb24vby9lbXBsb3llZV9hcGkvIiwic3ViIjoiNzZlOWNmYTdiMzgwNTkzYzYwODk2MDRiMzkwMGE1YzJhYzA5YWNiMDMzNTI4YWUxMTdmMjVhNDZiMTU4MzNlYiIsImF1ZCI6ImVtcGxveWVlX2FwaV9jbGllbnQiLCJleHAiOjE3NjE3Mjk0MDksImlhdCI6MTc2MTcyNjQwOSwiYXV0aF90aW1lIjoxNzYxNzI2NDA5LCJhY3IiOiJnb2F1dGhlbnRpay5pby9wcm92aWRlcnMvb2F1dGgyL2RlZmF1bHQiLCJhenAiOiJlbXBsb3llZV9hcGlfY2xpZW50IiwidWlkIjoiODBaOGg0eTVISnVoVkFqWExZUE05blpoWTU2YnlOUGpTWk9MUUxkQyJ9.uy8uRxarKW5VKfWdj5vzdiF0DZEO84y4V2lEb-KYg2qP-Cwiotgy07tWv-djR4Pk1kHxZlalT3NrZkT5LfGJBXfpsLRuVX_gmrRBwymdyhLjkxHOotSBXQTdm_0yZDOieinJX8ruF90st37fWSTtzUgsT3zTFXhwsZNW8Tjf7lgiZOoZDNAg1mocqVHi98tJA1d2wIK2CEwE2baIbsRIU9G9vxn6vW9r_cNrgs5wIFfYsWU1WwIwrgbRIElLcS7rBVITmPq69LXtREZ-FfVYudhiryR6-HhZqaRFxKvsnlTt95kojKJ3OfSjosJvlwgjCOd0Owsj2x68zh2P_Jgtskal7mu1-tpCo5Rx_nudo74nv2n9GSWLQ1Wp91JHDIjQtmF9Ye3eTXyfseIKMj2BmxQGfSiOSXkLiNVwxEeQLqsL4R2Hm3D0CSgW-obHcarqzKzrMi9jDK1lyKJMZorOkx9maIUJBXY8QBsX0X75FhRNlIEwqawMdQDu43Bk15BsTxVzaOKY6u6rC78iE-lJm6x99O_9OERDHs4Th0wYszdhcB6GZHmW0leBBNdlWsgePjA7cFx44oT7leAVbVALcl7LrA-I3DNSWm7G8HSJuqTQ_obdux4erxN4DOI8pvHlPR4saZFoTM7fvCdUHHQTfezgusAughZZX4f_16_xhH4';
  employees$: Observable<Employee[]>;

  constructor(private http: HttpClient) {
    this.employees$ = of([]);
    this.fetchData();
  }

  fetchData() {
    this.employees$ = this.http.get<Employee[]>('http://localhost:8089/employees', {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${this.bearer}`)
    });
  }
}
