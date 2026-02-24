import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Reviewobjectivesguide } from './reviewobjectivesguide';

describe('Reviewobjectivesguide', () => {
  let component: Reviewobjectivesguide;
  let fixture: ComponentFixture<Reviewobjectivesguide>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Reviewobjectivesguide]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Reviewobjectivesguide);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
