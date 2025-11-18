import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotRequest } from './forgot-request';

describe('ForgotRequest', () => {
  let component: ForgotRequest;
  let fixture: ComponentFixture<ForgotRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgotRequest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForgotRequest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
