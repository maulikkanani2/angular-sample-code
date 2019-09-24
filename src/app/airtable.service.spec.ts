import { TestBed, inject } from '@angular/core/testing';

import { AirtableService } from './airtable.service';

describe('AirtableService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AirtableService]
    });
  });

  it('should be created', inject([AirtableService], (service: AirtableService) => {
    expect(service).toBeTruthy();
  }));
});
