import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionServices } from './subscription-services';

describe('SubscriptionServices', () => {
  let component: SubscriptionServices;
  let fixture: ComponentFixture<SubscriptionServices>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionServices]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionServices);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
