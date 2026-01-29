import {Component, inject} from '@angular/core';
import {Router} from "@angular/router";
import {NavigationComponent} from "../navigation/navigation.component";

@Component({
  selector: 'app-employee-overview',
  standalone: true,
  imports: [
    NavigationComponent
  ],
  templateUrl: './employee-overview.component.html',
  styleUrl: './employee-overview.component.css'
})

export class EmployeeOverviewComponent {

  items: Employee[] = [
    new Employee("1","2","3"),
    new Employee("3","2","1"),
    new Employee("111","222","333")
  ]

  private router: Router = inject(Router);

  applyFilter() {

  }

  addEmployee() {

  }

  navigate(path: string){
    this.router.navigate([path])
  }

}

export class Employee {
  private _lastname: string;
  private _firstname: string;
  private _location: string;


  constructor(lastname: string, firstname: string, location: string) {
    this._lastname = lastname;
    this._firstname = firstname;
    this._location = location;
  }


  get lastname(): string {
    return this._lastname;
  }

  set lastname(value: string) {
    this._lastname = value;
  }

  get firstname(): string {
    return this._firstname;
  }

  set firstname(value: string) {
    this._firstname = value;
  }

  get location(): string {
    return this._location;
  }

  set location(value: string) {
    this._location = value;
  }
}
