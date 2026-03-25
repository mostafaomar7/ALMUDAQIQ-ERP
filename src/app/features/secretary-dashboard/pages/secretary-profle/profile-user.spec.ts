import { TestBed } from '@angular/core/testing';

import { ProfileUser } from './profile-user';

describe('ProfileUser', () => {
  let service: ProfileUser;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProfileUser);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
