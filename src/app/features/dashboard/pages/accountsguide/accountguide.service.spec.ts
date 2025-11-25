import { TestBed } from '@angular/core/testing';

import { AccountguideService } from './accountguide.service';

describe('AccountguideService', () => {
  let service: AccountguideService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccountguideService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
