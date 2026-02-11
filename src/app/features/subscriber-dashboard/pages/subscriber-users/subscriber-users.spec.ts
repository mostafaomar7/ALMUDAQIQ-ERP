import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriberUsers } from './subscriber-users';

describe('SubscriberUsers', () => {
  let component: SubscriberUsers;
  let fixture: ComponentFixture<SubscriberUsers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriberUsers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriberUsers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
