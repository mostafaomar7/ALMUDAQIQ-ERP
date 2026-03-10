import { TestBed } from '@angular/core/testing';

import { EngagemenDetails } from './engagemen-details';

describe('EngagemenDetails', () => {
  let service: EngagemenDetails;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EngagemenDetails);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
