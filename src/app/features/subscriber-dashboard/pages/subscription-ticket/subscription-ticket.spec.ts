import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionTicket } from './subscription-ticket';

describe('SubscriptionTicket', () => {
  let component: SubscriptionTicket;
  let fixture: ComponentFixture<SubscriptionTicket>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionTicket]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionTicket);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
