import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Filestagesguide } from './filestagesguide';

describe('Filestagesguide', () => {
  let component: Filestagesguide;
  let fixture: ComponentFixture<Filestagesguide>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Filestagesguide]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Filestagesguide);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
