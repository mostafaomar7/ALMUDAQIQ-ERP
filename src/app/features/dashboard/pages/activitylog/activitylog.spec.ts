import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Activitylog } from './activitylog';

describe('Activitylog', () => {
  let component: Activitylog;
  let fixture: ComponentFixture<Activitylog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Activitylog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Activitylog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
