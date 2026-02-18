import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriberProfile } from './subscriber-profile';

describe('SubscriberProfile', () => {
  let component: SubscriberProfile;
  let fixture: ComponentFixture<SubscriberProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriberProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriberProfile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
