import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriberBranchDetails } from './subscriber-branch-details';

describe('SubscriberBranchDetails', () => {
  let component: SubscriberBranchDetails;
  let fixture: ComponentFixture<SubscriberBranchDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriberBranchDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriberBranchDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
