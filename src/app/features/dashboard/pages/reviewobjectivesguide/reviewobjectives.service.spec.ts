import { TestBed } from '@angular/core/testing';

import { ReviewobjectivesService } from './reviewobjectives.service';

describe('ReviewobjectivesService', () => {
  let service: ReviewobjectivesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReviewobjectivesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
