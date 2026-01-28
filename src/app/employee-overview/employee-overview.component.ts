import {Component, Inject, Injectable, Input} from '@angular/core';

@Component({
  selector: 'app-employee-overview',
  standalone: true,
  imports: [],
  templateUrl: './employee-overview.component.html',
  styleUrl: './employee-overview.component.css'
})

export class EmployeeOverviewComponent {
  items: Item[] = [
    new Item("1","2","3"),
    new Item("3","2","1"),
    new Item("111","222","333")
  ]
}

export class Item{
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
