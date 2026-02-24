import { TestBed } from '@angular/core/testing';

import { Accountguide } from './accountguide';

describe('Accountguide', () => {
  let service: Accountguide;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Accountguide);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
