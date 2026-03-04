import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecretarySidebar } from './secretary-sidebar';

describe('SecretarySidebar', () => {
  let component: SecretarySidebar;
  let fixture: ComponentFixture<SecretarySidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecretarySidebar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecretarySidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
