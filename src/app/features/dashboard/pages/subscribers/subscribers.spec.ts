import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Subscribers } from './subscribers';

describe('Subscribers', () => {
  let component: Subscribers;
  let fixture: ComponentFixture<Subscribers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Subscribers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Subscribers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
