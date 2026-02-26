import { TestBed } from '@angular/core/testing';

import { BranchdetailsService } from './branchdetails.service';

describe('BranchdetailsService', () => {
  let service: BranchdetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BranchdetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
