import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpgradePlan } from './upgrade-plan';

describe('UpgradePlan', () => {
  let component: UpgradePlan;
  let fixture: ComponentFixture<UpgradePlan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpgradePlan]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpgradePlan);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
