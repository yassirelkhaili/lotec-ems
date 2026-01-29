import {Component, inject, TemplateRef, viewChild} from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [],
  templateUrl: './navigation.component.html',
  styleUrl: '../employee-overview/employee-overview.component.css'
})
export class NavigationComponent {
  private router: Router = inject(Router);
  navigate(path: string){
    this.router.navigate([path])
  }
}
