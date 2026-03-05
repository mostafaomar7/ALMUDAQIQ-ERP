import { TestBed } from '@angular/core/testing';

import { SeretaryEngagementContract } from './seretary-engagement-contract';

describe('SeretaryEngagementContract', () => {
  let service: SeretaryEngagementContract;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeretaryEngagementContract);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
