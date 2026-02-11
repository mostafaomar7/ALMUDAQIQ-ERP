import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriberBranches } from './subscriber-branches';

describe('SubscriberBranches', () => {
  let component: SubscriberBranches;
  let fixture: ComponentFixture<SubscriberBranches>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriberBranches]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriberBranches);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
