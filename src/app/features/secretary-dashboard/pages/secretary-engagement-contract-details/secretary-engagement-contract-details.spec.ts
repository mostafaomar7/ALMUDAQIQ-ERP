import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecretaryEngagementContractDetailsComponent } from './secretary-engagement-contract-details';

describe('SecretaryEngagementContractDetailsComponent', () => {
  let component: SecretaryEngagementContractDetailsComponent;
  let fixture: ComponentFixture<SecretaryEngagementContractDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecretaryEngagementContractDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecretaryEngagementContractDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
