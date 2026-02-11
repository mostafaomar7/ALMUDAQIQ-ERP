import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriberDashboard } from './subscriber-dashboard';

describe('SubscriberDashboard', () => {
  let component: SubscriberDashboard;
  let fixture: ComponentFixture<SubscriberDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriberDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriberDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
