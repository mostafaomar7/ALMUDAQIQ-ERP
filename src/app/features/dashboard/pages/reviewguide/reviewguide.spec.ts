import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Reviewguide } from './reviewguide';

describe('Reviewguide', () => {
  let component: Reviewguide;
  let fixture: ComponentFixture<Reviewguide>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Reviewguide]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Reviewguide);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
