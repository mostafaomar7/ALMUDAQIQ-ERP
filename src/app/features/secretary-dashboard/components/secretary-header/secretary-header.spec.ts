import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecretaryHeader } from './secretary-header';

describe('SecretaryHeader', () => {
  let component: SecretaryHeader;
  let fixture: ComponentFixture<SecretaryHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecretaryHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecretaryHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
