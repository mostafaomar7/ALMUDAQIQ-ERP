import { TestBed } from '@angular/core/testing';

import { FilestagesguideService } from './filestagesguide.service';

describe('FilestagesguideService', () => {
  let service: FilestagesguideService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FilestagesguideService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
