import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriberSidebar } from './subscriber-sidebar';

describe('SubscriberSidebar', () => {
  let component: SubscriberSidebar;
  let fixture: ComponentFixture<SubscriberSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriberSidebar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriberSidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
