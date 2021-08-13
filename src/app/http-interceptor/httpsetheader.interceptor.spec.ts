import { TestBed } from '@angular/core/testing';

import { HttpsetheaderInterceptor } from './httpsetheader.interceptor';

describe('HttpsetheaderInterceptor', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [HttpsetheaderInterceptor],
    })
  );

  it('should be created', () => {
    const interceptor: HttpsetheaderInterceptor = TestBed.inject(HttpsetheaderInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
