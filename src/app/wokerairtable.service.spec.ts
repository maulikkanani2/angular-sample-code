import { TestBed, inject } from '@angular/core/testing';

import { WokerairtableService } from './wokerairtable.service';

describe('WokerairtableService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WokerairtableService]
    });
  });

  it('should be created', inject([WokerairtableService], (service: WokerairtableService) => {
    expect(service).toBeTruthy();
  }));
});
