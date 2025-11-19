import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Reviewmarksindex } from './reviewmarksindex';

describe('Reviewmarksindex', () => {
  let component: Reviewmarksindex;
  let fixture: ComponentFixture<Reviewmarksindex>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Reviewmarksindex]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Reviewmarksindex);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
