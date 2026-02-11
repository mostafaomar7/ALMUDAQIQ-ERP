import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriberHeader } from './subscriber-header';

describe('SubscriberHeader', () => {
  let component: SubscriberHeader;
  let fixture: ComponentFixture<SubscriberHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriberHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriberHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
