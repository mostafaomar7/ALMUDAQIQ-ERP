import { TestBed } from '@angular/core/testing';

import { PlansmanagementService } from './plansmanagement.service';

describe('PlansmanagementService', () => {
  let service: PlansmanagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlansmanagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
