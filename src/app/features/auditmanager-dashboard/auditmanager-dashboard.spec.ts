import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditmanagerDashboard } from './auditmanager-dashboard';

describe('AuditmanagerDashboard', () => {
  let component: AuditmanagerDashboard;
  let fixture: ComponentFixture<AuditmanagerDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditmanagerDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuditmanagerDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
