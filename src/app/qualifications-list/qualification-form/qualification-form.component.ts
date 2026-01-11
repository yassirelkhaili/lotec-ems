import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-qualification-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './qualification-form.component.html',
  styleUrl: './qualification-form.component.css',
})
export class QualificationFormComponent {
  @Input() form!: FormGroup;
  @Input() isEdit: boolean = false;

  @Output() submit = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onSubmit(): void {
    this.submit.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  get skill() {
    return this.form.get('skill');
  }
}
