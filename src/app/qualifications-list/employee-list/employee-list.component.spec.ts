import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeListComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeListComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load employees on init', () => {
    component.qualificationId = 1;

    component.ngOnInit();

    const req = httpMock.expectOne(
      'http://localhost:8089/qualifications/1/employees'
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toContain('Bearer');

    req.flush(mockResponse);

    expect(component.employees()).toEqual(mockResponse.employees);
    expect(component.qualificationName()).toBe('Java Developer');
    expect(component.isLoading()).toBe(false);
  });

  it('should handle empty employee list', () => {
    component.qualificationId = 1;

    const emptyResponse: QualificationEmployeesResponse = {
      qualification: { id: 1, skill: 'Java Developer' },
      employees: [],
    };

    component.ngOnInit();

    const req = httpMock.expectOne(
      'http://localhost:8089/qualifications/1/employees'
    );
    req.flush(emptyResponse);

    expect(component.employees()).toEqual([]);
    expect(component.employees().length).toBe(0);
    expect(component.isLoading()).toBe(false);
  });

  it('should handle HTTP errors', () => {
    spyOn(console, 'error');
    component.qualificationId = 1;

    component.ngOnInit();

    const req = httpMock.expectOne(
      'http://localhost:8089/qualifications/1/employees'
    );
    req.error(new ProgressEvent('error'), {
      status: 500,
      statusText: 'Server Error',
    });

    expect(console.error).toHaveBeenCalled();
    expect(component.isLoading()).toBe(false);
  });

  it('should display loading state initially', () => {
    component.qualificationId = 1;
    component.isLoading.set(true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const loadingText = compiled.querySelector('.modal-loading');

    expect(loadingText).toBeTruthy();
    expect(loadingText.textContent).toContain('Lade Mitarbeiter');
  });

  it('should display empty state when no employees', () => {
    component.isLoading.set(false);
    component.employees.set([]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const emptyState = compiled.querySelector('.empty-state');

    expect(emptyState).toBeTruthy();
    expect(emptyState.textContent).toContain('Keine Mitarbeiter');
  });

  it('should display employee list when employees exist', () => {
    component.isLoading.set(false);
    component.employees.set(mockResponse.employees);
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
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const countText = compiled.querySelector('.employee-count');

    expect(countText.textContent).toContain('2 Mitarbeiter');
  });
});
