import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Accountsguide } from './accountsguide';

describe('Accountsguide', () => {
  let component: Accountsguide;
  let fixture: ComponentFixture<Accountsguide>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Accountsguide]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Accountsguide);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
