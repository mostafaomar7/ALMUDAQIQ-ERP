import { TestBed } from '@angular/core/testing';

import { ReviewobjectivesguideService } from './reviewobjectivesguide.service';

describe('ReviewobjectivesguideService', () => {
  let service: ReviewobjectivesguideService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReviewobjectivesguideService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
