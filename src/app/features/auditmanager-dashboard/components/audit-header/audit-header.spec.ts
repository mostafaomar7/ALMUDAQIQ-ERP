import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditHeader } from './audit-header';

describe('AuditHeader', () => {
  let component: AuditHeader;
  let fixture: ComponentFixture<AuditHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuditHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
