import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Domainsettings } from './domainsettings';

describe('Domainsettings', () => {
  let component: Domainsettings;
  let fixture: ComponentFixture<Domainsettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Domainsettings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Domainsettings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
