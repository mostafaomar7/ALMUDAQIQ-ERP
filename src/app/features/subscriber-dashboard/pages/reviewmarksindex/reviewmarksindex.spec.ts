import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewmarksindexComponent } from './reviewmarksindex';

describe('Reviewmarksindex', () => {
  let component: ReviewmarksindexComponent;
  let fixture: ComponentFixture<ReviewmarksindexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewmarksindexComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewmarksindexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
