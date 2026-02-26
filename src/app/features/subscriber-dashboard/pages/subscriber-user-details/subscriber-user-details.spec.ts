import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriberUserDetails } from './subscriber-user-details';

describe('SubscriberUserDetails', () => {
  let component: SubscriberUserDetails;
  let fixture: ComponentFixture<SubscriberUserDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriberUserDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriberUserDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
