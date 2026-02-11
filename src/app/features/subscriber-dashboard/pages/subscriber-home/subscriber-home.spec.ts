import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriberHome } from './subscriber-home';

describe('SubscriberHome', () => {
  let component: SubscriberHome;
  let fixture: ComponentFixture<SubscriberHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriberHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriberHome);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
