import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Plansmanagement } from './plansmanagement';

describe('Plansmanagement', () => {
  let component: Plansmanagement;
  let fixture: ComponentFixture<Plansmanagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Plansmanagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Plansmanagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
