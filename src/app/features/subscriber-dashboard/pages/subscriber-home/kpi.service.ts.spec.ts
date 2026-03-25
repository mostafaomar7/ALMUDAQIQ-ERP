import { TestBed } from '@angular/core/testing';

import { KpiServiceTs } from './kpi.service.ts';

describe('KpiServiceTs', () => {
  let service: KpiServiceTs;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KpiServiceTs);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
