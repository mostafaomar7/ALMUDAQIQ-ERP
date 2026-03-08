import { TestBed } from '@angular/core/testing';

import { SecretaryEngagementContract } from './secretary-engagement-contract';

describe('SeretaryEngagementContract', () => {
  let service: SecretaryEngagementContract;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SecretaryEngagementContract);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
