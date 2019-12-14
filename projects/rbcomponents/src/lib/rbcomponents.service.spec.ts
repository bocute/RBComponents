import { TestBed } from '@angular/core/testing';

import { RBComponentsService } from './rbcomponents.service';

describe('RBComponentsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RBComponentsService = TestBed.get(RBComponentsService);
    expect(service).toBeTruthy();
  });
});
