import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { QualificationsListComponent } from './qualifications-list.component';
import { Qualification } from '../types/Qualification';

describe('QualificationsListComponent', () => {
  let component: QualificationsListComponent;
  let fixture: ComponentFixture<QualificationsListComponent>;
  let httpMock: HttpTestingController;

  const mockQualifications: Qualification[] = [
    { id: 1, designation: 'Java Developer' },
    { id: 2, designation: 'Project Manager' },
    { id: 3, designation: 'Scrum Master' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        QualificationsListComponent,
        HttpClientTestingModule,
        FormsModule,
      ],
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

    component.qualifications$.subscribe((qualifications) => {
      expect(qualifications.length).toBe(3);
      expect(qualifications).toEqual(mockQualifications);
    });
  });

  it('should show create form when showCreateForm is called', () => {
    component.showCreateForm();

    expect(component.showForm).toBe(true);
    expect(component.isEditMode).toBe(false);
    expect(component.qualificationForm.designation).toBe('');
  });

  it('should show edit form with qualification data when editQualification is called', () => {
    const qualification = mockQualifications[0];

    component.editQualification(qualification);

    expect(component.showForm).toBe(true);
    expect(component.isEditMode).toBe(true);
    expect(component.selectedQualification).toEqual(qualification);
    expect(component.qualificationForm.designation).toBe(
      qualification.designation
    );
  });

  it('should cancel form and reset data when cancelForm is called', () => {
    component.showForm = true;
    component.isEditMode = true;
    component.qualificationForm.designation = 'Test';

    component.cancelForm();

    expect(component.showForm).toBe(false);
    expect(component.selectedQualification).toBeNull();
    expect(component.qualificationForm.designation).toBe('');
  });

  it('should create a new qualification', () => {
    component.qualificationForm.designation = 'Backend Developer';
    component.createQualification();

    const req = httpMock.expectOne('http://localhost:8089/qualifications');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ designation: 'Backend Developer' });
    expect(req.request.headers.get('Authorization')).toContain('Bearer');
    expect(req.request.headers.get('Content-Type')).toBe('application/json');

    req.flush({ id: 4, designation: 'Backend Developer' });

    // Should reload qualifications after creation
    const getReq = httpMock.expectOne('http://localhost:8089/qualifications');
    expect(getReq.request.method).toBe('GET');
    getReq.flush(mockQualifications);
  });

  it('should not create qualification with empty designation', () => {
    spyOn(window, 'alert');
    component.qualificationForm.designation = '   ';

    component.createQualification();

    expect(window.alert).toHaveBeenCalledWith('Please enter a designation');
    httpMock.expectNone('http://localhost:8089/qualifications');
  });

  it('should update an existing qualification', () => {
    component.selectedQualification = mockQualifications[0];
    component.qualificationForm = {
      id: 1,
      designation: 'Senior Java Developer',
    };
    component.isEditMode = true;

    component.updateQualification();

    const req = httpMock.expectOne('http://localhost:8089/qualifications/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({
      id: 1,
      designation: 'Senior Java Developer',
    });
    expect(req.request.headers.get('Authorization')).toContain('Bearer');

    req.flush({ id: 1, designation: 'Senior Java Developer' });

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
    const mockEmployees = [
      { id: 1, firstName: 'John', lastName: 'Doe' },
      { id: 2, firstName: 'Jane', lastName: 'Smith' },
    ];

    component.viewEmployees(1);

    const req = httpMock.expectOne(
      'http://localhost:8089/qualifications/1/employees'
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toContain('Bearer');

    req.flush(mockEmployees);
  });

  it('should submit form in create mode', () => {
    component.isEditMode = false;
    component.qualificationForm.designation = 'Test Qualification';

    spyOn(component, 'createQualification');
    component.onSubmit();

    expect(component.createQualification).toHaveBeenCalled();
  });

  it('should submit form in edit mode', () => {
    component.isEditMode = true;
    component.selectedQualification = mockQualifications[0];
    component.qualificationForm = {
      id: 1,
      designation: 'Updated Qualification',
    };

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

    component.qualificationForm.designation = 'Test';
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
});
