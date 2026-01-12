import { Component, Input, Output, EventEmitter, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WritableSignal } from '@angular/core';

@Component({
  selector: 'app-qualification-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './qualification-form.component.html',
  styleUrl: './qualification-form.component.css',
})
export class QualificationFormComponent {
  @Input() skill!: WritableSignal<string>;
  @Input() error!: WritableSignal<string | null>;
  @Input() touched!: WritableSignal<boolean>;
  @Input() isValid!: () => boolean;
  @Input() isEdit: boolean = false;

  @Output() submit = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() validate = new EventEmitter<void>();

  constructor() {
    // Validate when skill changes
    effect(() => {
      if (this.touched()) {
        this.skill();
        this.validate.emit();
      }
    });
  }

  onSkillChange(value: string): void {
    this.skill.set(value);
    if (this.touched()) {
      this.validate.emit();
    }
  }

  onSkillBlur(): void {
    this.touched.set(true);
    this.validate.emit();
  }

  onSubmit(): void {
    this.touched.set(true);
    this.validate.emit();
    this.submit.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
