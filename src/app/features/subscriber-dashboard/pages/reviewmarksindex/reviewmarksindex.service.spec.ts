import { TestBed } from '@angular/core/testing';

import { ReviewmarksindexService } from './reviewmarksindex.service';

describe('ReviewmarksindexService', () => {
  let service: ReviewmarksindexService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReviewmarksindexService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
