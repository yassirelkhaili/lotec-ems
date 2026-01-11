import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { QualificationsListComponent } from './qualifications-list.component';
import { Qualification } from '../types/Qualification';
import { QualificationEmployeesResponse } from '../types/QualificationEmployeeResponse';

describe('QualificationsListComponent', () => {
  let component: QualificationsListComponent;
  let fixture: ComponentFixture<QualificationsListComponent>;
  let httpMock: HttpTestingController;

  const mockQualifications: Qualification[] = [
    { id: 1, skill: 'Java Developer' },
    { id: 2, skill: 'Project Manager' },
    { id: 3, skill: 'Scrum Master' },
  ];

  const mockEmployeesResponse: QualificationEmployeesResponse = {
    qualification: { id: 1, skill: 'Java Developer' },
    employees: [
      { id: 1, firstName: 'John', lastName: 'Doe' },
      { id: 2, firstName: 'Jane', lastName: 'Smith' },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QualificationsListComponent, ReactiveFormsModule],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(QualificationsListComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load qualifications on init', () => {
    component.ngOnInit();

    const req = httpMock.expectOne('http://localhost:8089/qualifications');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toContain('Bearer');

    req.flush(mockQualifications);

    expect(component.qualifications()).toEqual(mockQualifications);
  });

  it('should show create form when showCreateForm is called', () => {
    component.showCreateForm();

    expect(component.showForm()).toBe(true);
    expect(component.isEditMode()).toBe(false);
    expect(component.qualificationForm.value.skill).toBe('');
  });

  it('should show edit form with qualification data when editQualification is called', () => {
    const qualification = mockQualifications[0];

    component.editQualification(qualification);

    expect(component.showForm()).toBe(true);
    expect(component.isEditMode()).toBe(true);
    expect(component.selectedQualification()).toEqual(qualification);
    expect(component.qualificationForm.value.skill).toBe(qualification.skill);
  });

  it('should cancel form and reset data when cancelForm is called', () => {
    component.showForm.set(true);
    component.isEditMode.set(true);
    component.qualificationForm.patchValue({ skill: 'Test' });

    component.cancelForm();

    expect(component.showForm()).toBe(false);
    expect(component.selectedQualification()).toBeNull();
    expect(component.qualificationForm.value.skill).toBe('');
  });

  it('should create a new qualification', () => {
    component.qualificationForm.patchValue({ skill: 'Backend Developer' });
    component.createQualification();

    const req = httpMock.expectOne('http://localhost:8089/qualifications');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ skill: 'Backend Developer' });
    expect(req.request.headers.get('Authorization')).toContain('Bearer');
    expect(req.request.headers.get('Content-Type')).toBe('application/json');

    req.flush({ id: 4, skill: 'Backend Developer' });

    // Should reload qualifications after creation
    const getReq = httpMock.expectOne('http://localhost:8089/qualifications');
    expect(getReq.request.method).toBe('GET');
    getReq.flush(mockQualifications);
  });

  it('should not create qualification with empty skill', () => {
    component.qualificationForm.patchValue({ skill: '' });

    component.createQualification();

    // Form is invalid, so no HTTP request should be made
    httpMock.expectNone('http://localhost:8089/qualifications');
  });

  it('should update an existing qualification', () => {
    component.selectedQualification.set(mockQualifications[0]);
    component.qualificationForm.patchValue({
      id: 1,
      skill: 'Senior Java Developer',
    });
    component.isEditMode.set(true);

    component.updateQualification();

    const req = httpMock.expectOne('http://localhost:8089/qualifications/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.skill).toBe('Senior Java Developer');
    expect(req.request.headers.get('Authorization')).toContain('Bearer');

    req.flush({ id: 1, skill: 'Senior Java Developer' });

    // Should reload qualifications after update
    const getReq = httpMock.expectOne('http://localhost:8089/qualifications');
    expect(getReq.request.method).toBe('GET');
    getReq.flush(mockQualifications);
  });

  it('should delete a qualification after confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);

    component.deleteQualification(1);

    const req = httpMock.expectOne('http://localhost:8089/qualifications/1');
    expect(req.request.method).toBe('DELETE');
    expect(req.request.headers.get('Authorization')).toContain('Bearer');

    req.flush({});

    // Should reload qualifications after deletion
    const getReq = httpMock.expectOne('http://localhost:8089/qualifications');
    expect(getReq.request.method).toBe('GET');
    getReq.flush(mockQualifications);
  });

  it('should not delete qualification if user cancels confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    component.deleteQualification(1);

    httpMock.expectNone('http://localhost:8089/qualifications/1');
  });

  it('should load employees for a qualification', () => {
    component.viewEmployees(1);

    const req = httpMock.expectOne(
      'http://localhost:8089/qualifications/1/employees'
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toContain('Bearer');

    req.flush(mockEmployeesResponse);
  });

  it('should submit form in create mode', () => {
    component.isEditMode.set(false);
    component.qualificationForm.patchValue({ skill: 'Test Qualification' });

    spyOn(component, 'createQualification');
    component.onSubmit();

    expect(component.createQualification).toHaveBeenCalled();
  });

  it('should submit form in edit mode', () => {
    component.isEditMode.set(true);
    component.selectedQualification.set(mockQualifications[0]);
    component.qualificationForm.patchValue({
      id: 1,
      skill: 'Updated Qualification',
    });

    spyOn(component, 'updateQualification');
    component.onSubmit();

    expect(component.updateQualification).toHaveBeenCalled();
  });

  it('should handle HTTP errors when loading qualifications', () => {
    spyOn(console, 'error');
    spyOn(window, 'alert');

    component.loadQualifications();

    const req = httpMock.expectOne('http://localhost:8089/qualifications');
    req.error(new ProgressEvent('error'), {
      status: 500,
      statusText: 'Server Error',
    });

    expect(console.error).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith(
      'Failed to load qualifications. Check console for details.'
    );
  });

  it('should handle HTTP errors when creating qualifications', () => {
    spyOn(console, 'error');
    spyOn(window, 'alert');

    component.qualificationForm.patchValue({ skill: 'Test' });
    component.createQualification();

    const req = httpMock.expectOne('http://localhost:8089/qualifications');
    req.error(new ProgressEvent('error'), {
      status: 400,
      statusText: 'Bad Request',
    });

    expect(console.error).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith(
      'Failed to create qualification. Check console for details.'
    );
  });

  it('should filter qualifications based on search term', () => {
    component.qualifications.set(mockQualifications);

    component.onSearchChange('Java');

    expect(component.filteredQualifications().length).toBe(1);
    expect(component.filteredQualifications()[0].skill).toBe('Java Developer');
  });

  it('should return all qualifications when search term is empty', () => {
    component.qualifications.set(mockQualifications);

    component.onSearchChange('');

    expect(component.filteredQualifications().length).toBe(3);
  });

  it('should load employee counts for qualifications', () => {
    component.qualifications.set(mockQualifications);

    component['loadEmployeeCounts'](mockQualifications);

    const req1 = httpMock.expectOne(
      'http://localhost:8089/qualifications/1/employees'
    );
    const req2 = httpMock.expectOne(
      'http://localhost:8089/qualifications/2/employees'
    );
    const req3 = httpMock.expectOne(
      'http://localhost:8089/qualifications/3/employees'
    );

    req1.flush(mockEmployeesResponse);
    req2.flush({ qualification: mockQualifications[1], employees: [] });
    req3.flush({
      qualification: mockQualifications[2],
      employees: [{ id: 3, firstName: 'Bob', lastName: 'Smith' }],
    });

    expect(component.getEmployeeCount(1)).toBe(2);
    expect(component.getEmployeeCount(2)).toBe(0);
    expect(component.getEmployeeCount(3)).toBe(1);
  });

  it('should return 0 for unknown qualification id', () => {
    expect(component.getEmployeeCount(999)).toBe(0);
  });
});
