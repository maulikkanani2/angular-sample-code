import { TestBed, inject } from '@angular/core/testing';

import { ClockifyService } from './clockify.service';

describe('ClockifyService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClockifyService]
    });
  });

  it('should be created', inject([ClockifyService], (service: ClockifyService) => {
    expect(service).toBeTruthy();
  }));
});
