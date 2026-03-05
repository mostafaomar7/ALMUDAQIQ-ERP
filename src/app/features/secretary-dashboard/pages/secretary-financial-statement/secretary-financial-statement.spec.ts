import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecretaryFinancialStatement } from './secretary-financial-statement';

describe('SecretaryFinancialStatement', () => {
  let component: SecretaryFinancialStatement;
  let fixture: ComponentFixture<SecretaryFinancialStatement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecretaryFinancialStatement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecretaryFinancialStatement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
