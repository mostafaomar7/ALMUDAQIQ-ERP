import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecretaryEngagementContractDetails } from './secretary-engagement-contract-details';

describe('SecretaryEngagementContractDetails', () => {
  let component: SecretaryEngagementContractDetails;
  let fixture: ComponentFixture<SecretaryEngagementContractDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecretaryEngagementContractDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecretaryEngagementContractDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
