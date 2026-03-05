import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecretaryEngagementContract } from './secretary-engagement-contract';

describe('SecretaryEngagementContract', () => {
  let component: SecretaryEngagementContract;
  let fixture: ComponentFixture<SecretaryEngagementContract>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecretaryEngagementContract]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecretaryEngagementContract);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
