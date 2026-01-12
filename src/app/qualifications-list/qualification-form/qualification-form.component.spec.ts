import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QualificationFormComponent } from './qualification-form.component';

describe('QualificationFormComponent', () => {
  let component: QualificationFormComponent;
  let fixture: ComponentFixture<QualificationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QualificationFormComponent, FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(QualificationFormComponent);
    component = fixture.componentInstance;

    // Set up signal inputs
    component.skill = signal('');
    component.error = signal(null);
    component.touched = signal(false);
    component.isValid = () => {
      const skill = component.skill().trim();
      return skill.length >= 2 && skill.length <= 50;
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit submit event when form is submitted', () => {
    spyOn(component.submit, 'emit');

    component.skill.set('Test Skill');
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
    component.skill.set('');
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const button = compiled.querySelector('button.btn-success');

    expect(button.disabled).toBe(true);
  });

  it('should enable submit button when form is valid', () => {
    component.skill.set('Valid Skill');
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const button = compiled.querySelector('button.btn-success');

    expect(button.disabled).toBe(false);
  });

  it('should show error message when touched and has error', () => {
    component.touched.set(true);
    component.error.set('Bezeichnung ist erforderlich');
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const errorText = compiled.querySelector('.error-text');

    expect(errorText).toBeTruthy();
    expect(errorText.textContent).toContain('Bezeichnung ist erforderlich');
  });

  it('should emit validate event on blur', () => {
    spyOn(component.validate, 'emit');

    component.onSkillBlur();

    expect(component.validate.emit).toHaveBeenCalled();
    expect(component.touched()).toBe(true);
  });

  it('should update skill value on input change', () => {
    component.onSkillChange('New Skill');

    expect(component.skill()).toBe('New Skill');
  });
});
