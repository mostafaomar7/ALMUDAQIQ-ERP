import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditSidebar } from './audit-sidebar';

describe('AuditSidebar', () => {
  let component: AuditSidebar;
  let fixture: ComponentFixture<AuditSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditSidebar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuditSidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
