import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { QualificationFormComponent } from './qualification-form.component';

describe('QualificationFormComponent', () => {
  let component: QualificationFormComponent;
  let fixture: ComponentFixture<QualificationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QualificationFormComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(QualificationFormComponent);
    component = fixture.componentInstance;

    component.form = new FormGroup({
      id: new FormControl<number>(0),
      skill: new FormControl('', {
        validators: [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
        nonNullable: true,
      }),
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit submit event when form is submitted', () => {
    spyOn(component.submit, 'emit');

    component.form.patchValue({ skill: 'Test Skill' });
    component.onSubmit();

    expect(component.submit.emit).toHaveBeenCalled();
  });

  it('should emit cancel event when cancel is clicked', () => {
    spyOn(component.cancel, 'emit');

    component.onCancel();

    expect(component.cancel.emit).toHaveBeenCalled();
  });

  it('should display correct button text for create mode', () => {
    component.isEdit = false;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const button = compiled.querySelector('button.btn-success');

    expect(button.textContent).toContain('Erstellen');
  });

  it('should display correct button text for edit mode', () => {
    component.isEdit = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const button = compiled.querySelector('button.btn-success');

    expect(button.textContent).toContain('Aktualisieren');
  });

  it('should disable submit button when form is invalid', () => {
    component.form.patchValue({ skill: '' });
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const button = compiled.querySelector('button.btn-success');

    expect(button.disabled).toBe(true);
  });

  it('should enable submit button when form is valid', () => {
    component.form.patchValue({ skill: 'Valid Skill' });
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const button = compiled.querySelector('button.btn-success');

    expect(button.disabled).toBe(false);
  });

  it('should show error message when skill is required and touched', () => {
    const skillControl = component.form.get('skill');
    skillControl?.markAsTouched();
    skillControl?.setValue('');
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const errorText = compiled.querySelector('.error-text');

    expect(errorText).toBeTruthy();
    expect(errorText.textContent).toContain('Bezeichnung ist erforderlich');
  });

  it('should show error message when skill is too short', () => {
    const skillControl = component.form.get('skill');
    skillControl?.markAsTouched();
    skillControl?.setValue('A');
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const errorText = compiled.querySelector('.error-text');

    expect(errorText).toBeTruthy();
    expect(errorText.textContent).toContain(
      'Mindestens 2 Zeichen erforderlich'
    );
  });

  it('should get skill control', () => {
    const skill = component.skill;

    expect(skill).toBe(component.form.get('skill'));
  });
});
