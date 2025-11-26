import { TestBed } from '@angular/core/testing';

import { ReviewguideService } from './reviewguide.service';

describe('ReviewguideService', () => {
  let service: ReviewguideService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReviewguideService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
