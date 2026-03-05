import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecretaryProfle } from './secretary-profle';

describe('SecretaryProfle', () => {
  let component: SecretaryProfle;
  let fixture: ComponentFixture<SecretaryProfle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecretaryProfle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecretaryProfle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
