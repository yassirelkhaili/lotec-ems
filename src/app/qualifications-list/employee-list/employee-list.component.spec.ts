import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { EmployeeListComponent } from './employee-list.component';
import { QualificationEmployeesResponse } from '../../types/QualificationEmployeeResponse';

describe('EmployeeListComponent', () => {
  let component: EmployeeListComponent;
  let fixture: ComponentFixture<EmployeeListComponent>;
  let httpMock: HttpTestingController;

  const mockResponse: QualificationEmployeesResponse = {
    qualification: { id: 1, skill: 'Java Developer' },
    employees: [
      { id: 1, firstName: 'John', lastName: 'Doe' },
      { id: 2, firstName: 'Jane', lastName: 'Smith' },
    ],
  };

  const mockAllEmployees = [
    { id: 1, firstName: 'John', lastName: 'Doe' },
    { id: 2, firstName: 'Jane', lastName: 'Smith' },
    { id: 3, firstName: 'Bob', lastName: 'Wilson' },
    { id: 4, firstName: 'Alice', lastName: 'Brown' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeListComponent, FormsModule],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeListComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    component.qualificationId = 1;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load employees and all employees on init', () => {
    component.ngOnInit();

    const req1 = httpMock.expectOne(
      'http://localhost:8089/qualifications/1/employees'
    );
    expect(req1.request.method).toBe('GET');
    expect(req1.request.headers.get('Authorization')).toContain('Bearer');
    req1.flush(mockResponse);

    const req2 = httpMock.expectOne('http://localhost:8089/employees');
    expect(req2.request.method).toBe('GET');
    expect(req2.request.headers.get('Authorization')).toContain('Bearer');
    req2.flush(mockAllEmployees);

    expect(component.employees()).toEqual(mockResponse.employees);
    expect(component.allEmployees()).toEqual(mockAllEmployees);
    expect(component.isLoading()).toBe(false);
  });

  it('should calculate available employees correctly', () => {
    component.employees.set([
      { id: 1, firstName: 'John', lastName: 'Doe' },
      { id: 2, firstName: 'Jane', lastName: 'Smith' },
    ]);
    component.allEmployees.set(mockAllEmployees);

    const available = component.availableEmployees();

    expect(available.length).toBe(2);
    expect(available.find((e) => e.id === 3)).toBeTruthy();
    expect(available.find((e) => e.id === 4)).toBeTruthy();
    expect(available.find((e) => e.id === 1)).toBeFalsy();
    expect(available.find((e) => e.id === 2)).toBeFalsy();
  });

  it('should add employee to qualification', () => {
    spyOn(component.employeesChanged, 'emit');
    spyOn(window, 'alert');

    component.qualificationName.set('Java Developer');
    component.selectedEmployeeId.set(3);

    component.addEmployeeToQualification();

    const req = httpMock.expectOne(
      'http://localhost:8089/employees/3/qualifications'
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ skill: 'Java Developer' });
    expect(req.request.headers.get('Authorization')).toContain('Bearer');
    expect(req.request.headers.get('Content-Type')).toBe('application/json');

    req.flush({});

    const reloadReq = httpMock.expectOne(
      'http://localhost:8089/qualifications/1/employees'
    );
    reloadReq.flush(mockResponse);

    expect(component.employeesChanged.emit).toHaveBeenCalled();
    expect(component.selectedEmployeeId()).toBeNull();
    expect(component.isAddingEmployee()).toBe(false);
    expect(window.alert).toHaveBeenCalledWith(
      'Mitarbeiter erfolgreich hinzugefügt!'
    );
  });

  it('should not add employee when none is selected', () => {
    spyOn(window, 'alert');

    component.selectedEmployeeId.set(null);
    component.addEmployeeToQualification();

    expect(window.alert).toHaveBeenCalledWith(
      'Bitte wählen Sie einen Mitarbeiter aus.'
    );
    httpMock.expectNone('http://localhost:8089/employees/*/qualifications');
  });

  it('should handle error when adding employee', () => {
    spyOn(console, 'error');
    spyOn(window, 'alert');

    component.qualificationName.set('Java Developer');
    component.selectedEmployeeId.set(3);

    component.addEmployeeToQualification();

    const req = httpMock.expectOne(
      'http://localhost:8089/employees/3/qualifications'
    );
    req.error(new ProgressEvent('error'), {
      status: 400,
      statusText: 'Bad Request',
    });

    expect(console.error).toHaveBeenCalled();
    expect(component.isAddingEmployee()).toBe(false);
    expect(window.alert).toHaveBeenCalledWith(
      'Fehler beim Hinzufügen des Mitarbeiters.'
    );
  });

  it('should remove employee from qualification after confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(component.employeesChanged, 'emit');
    spyOn(window, 'alert');

    component.removeEmployeeFromQualification(2);

    const req = httpMock.expectOne(
      'http://localhost:8089/employees/2/qualifications/1'
    );
    expect(req.request.method).toBe('DELETE');
    expect(req.request.headers.get('Authorization')).toContain('Bearer');

    req.flush({});

    const reloadReq = httpMock.expectOne(
      'http://localhost:8089/qualifications/1/employees'
    );
    reloadReq.flush(mockResponse);

    expect(component.employeesChanged.emit).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith(
      'Mitarbeiter erfolgreich entfernt!'
    );
  });

  it('should not remove employee if user cancels confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    component.removeEmployeeFromQualification(2);

    httpMock.expectNone('http://localhost:8089/employees/2/qualifications/1');
    expect(true).toBe(true);
  });

  it('should handle error when removing employee', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(console, 'error');
    spyOn(window, 'alert');

    component.removeEmployeeFromQualification(2);

    const req = httpMock.expectOne(
      'http://localhost:8089/employees/2/qualifications/1'
    );
    req.error(new ProgressEvent('error'), {
      status: 500,
      statusText: 'Server Error',
    });

    expect(console.error).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith(
      'Fehler beim Entfernen des Mitarbeiters.'
    );
  });

  it('should handle empty employee list', () => {
    const emptyResponse: QualificationEmployeesResponse = {
      qualification: { id: 1, skill: 'Java Developer' },
      employees: [],
    };

    component.ngOnInit();

    const req1 = httpMock.expectOne(
      'http://localhost:8089/qualifications/1/employees'
    );
    req1.flush(emptyResponse);

    const req2 = httpMock.expectOne('http://localhost:8089/employees');
    req2.flush(mockAllEmployees);

    expect(component.employees()).toEqual([]);
    expect(component.employees().length).toBe(0);
    expect(component.isLoading()).toBe(false);
  });

  it('should handle HTTP errors when loading employees', () => {
    spyOn(console, 'error');

    component.ngOnInit();

    const req1 = httpMock.expectOne(
      'http://localhost:8089/qualifications/1/employees'
    );
    req1.error(new ProgressEvent('error'), {
      status: 500,
      statusText: 'Server Error',
    });

    const req2 = httpMock.expectOne('http://localhost:8089/employees');
    req2.flush(mockAllEmployees);

    expect(console.error).toHaveBeenCalled();
    expect(component.isLoading()).toBe(false);
  });

  it('should handle HTTP errors when loading all employees', () => {
    spyOn(console, 'error');

    component.ngOnInit();

    const req1 = httpMock.expectOne(
      'http://localhost:8089/qualifications/1/employees'
    );
    req1.flush(mockResponse);

    const req2 = httpMock.expectOne('http://localhost:8089/employees');
    req2.error(new ProgressEvent('error'), {
      status: 500,
      statusText: 'Server Error',
    });

    expect(console.error).toHaveBeenCalled();
  });

  it('should display loading state initially', () => {
    component.isLoading.set(true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const loadingText = compiled.querySelector('.modal-loading');

    expect(loadingText).toBeTruthy();
    expect(loadingText.textContent).toContain('Lade Mitarbeiter');

    const req1 = httpMock.expectOne(
      'http://localhost:8089/qualifications/1/employees'
    );
    const req2 = httpMock.expectOne('http://localhost:8089/employees');
    req1.flush(mockResponse);
    req2.flush(mockAllEmployees);
  });

  it('should display empty state when no employees have qualification', () => {
    component.isLoading.set(false);
    component.employees.set([]);
    fixture.detectChanges();

    // Flush HTTP requests triggered by ngOnInit
    const req1 = httpMock.expectOne(
      'http://localhost:8089/qualifications/1/employees'
    );
    const req2 = httpMock.expectOne('http://localhost:8089/employees');
    req1.flush({ qualification: { id: 1, skill: 'Test' }, employees: [] });
    req2.flush(mockAllEmployees);

    // Update DOM with flushed data
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const emptyState = compiled.querySelector('.empty-state');

    expect(emptyState).toBeTruthy();
    expect(emptyState.textContent).toContain(
      'Keine Mitarbeiter haben diese Qualifikation'
    );
  });

  it('should display employee list when employees exist', () => {
    component.isLoading.set(false);
    component.employees.set(mockResponse.employees);
    component.allEmployees.set(mockAllEmployees);
    fixture.detectChanges();

    const req1 = httpMock.expectOne(
      'http://localhost:8089/qualifications/1/employees'
    );
    const req2 = httpMock.expectOne('http://localhost:8089/employees');
    req1.flush(mockResponse);
    req2.flush(mockAllEmployees);

    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const employeeItems = compiled.querySelectorAll('.employee-item');

    expect(employeeItems.length).toBe(2);
    expect(compiled.textContent).toContain('John Doe');
    expect(compiled.textContent).toContain('Jane Smith');
  });

  it('should display correct employee count', () => {
    component.isLoading.set(false);
    component.employees.set(mockResponse.employees);
    component.allEmployees.set(mockAllEmployees);
    fixture.detectChanges();

    const req1 = httpMock.expectOne(
      'http://localhost:8089/qualifications/1/employees'
    );
    const req2 = httpMock.expectOne('http://localhost:8089/employees');
    req1.flush(mockResponse);
    req2.flush(mockAllEmployees);

    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const countText = compiled.querySelector('.info-text');

    expect(countText).toBeTruthy();
    expect(countText.textContent).toContain('2 Mitarbeiter');
  });

  it('should set isAddingEmployee during add operation', () => {
    component.qualificationName.set('Java Developer');
    component.selectedEmployeeId.set(3);

    expect(component.isAddingEmployee()).toBe(false);

    component.addEmployeeToQualification();

    expect(component.isAddingEmployee()).toBe(true);

    const req = httpMock.expectOne(
      'http://localhost:8089/employees/3/qualifications'
    );
    req.flush({});

    const reloadReq = httpMock.expectOne(
      'http://localhost:8089/qualifications/1/employees'
    );
    reloadReq.flush(mockResponse);

    expect(component.isAddingEmployee()).toBe(false);
  });
});
