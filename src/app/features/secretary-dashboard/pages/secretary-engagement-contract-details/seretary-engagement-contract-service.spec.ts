import { TestBed } from '@angular/core/testing';

import { SeretaryEngagementContractService } from './seretary-engagement-contract-service';

describe('SeretaryEngagementContractService', () => {
  let service: SeretaryEngagementContractService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeretaryEngagementContractService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
