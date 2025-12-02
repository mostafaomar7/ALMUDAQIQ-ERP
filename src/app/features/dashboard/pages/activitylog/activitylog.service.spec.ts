import { TestBed } from '@angular/core/testing';

import { ActivitylogService } from './activitylog.service';

describe('ActivitylogService', () => {
  let service: ActivitylogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActivitylogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
