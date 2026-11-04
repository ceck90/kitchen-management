import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {AppSettingsService} from './app-settings.service';
import {RequestService} from '../modules/shared/service/request.service';

describe('AppSettingsService', () => {
  let service: AppSettingsService;
  let http: HttpTestingController;
  const url = (path: string) => `${RequestService.baseUrl}/${path}`;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({providers: [provideHttpClient(), provideHttpClientTesting()]});
    service = TestBed.inject(AppSettingsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('moves the browser settings to the server when it has none, then drops them', async () => {
    localStorage.setItem('app-language', 'en');
    localStorage.setItem('delay_thresholds', JSON.stringify({warning: 5, danger: 12}));
    localStorage.setItem('plate_quickMove_p1', JSON.stringify({enabled: true, targetPlateId: 'p2'}));

    const done = service.init();
    http.expectOne(url('settings')).flush({});
    await Promise.resolve();
    const seed = http.expectOne(url('settings/seed'));
    expect(seed.request.body).toEqual({language: 'en', delayThresholds: {warning: 5, danger: 12}});
    seed.flush({language: 'en', delayThresholds: {warning: 5, danger: 12}});
    await Promise.resolve();
    http.expectOne(url('plate')).flush([{id: 'p1'}]);
    await Promise.resolve();
    const plateSeed = http.expectOne(url('plate/p1/seed-settings'));
    expect(plateSeed.request.body).toEqual({quickMoveEnabled: true, quickMoveTargetPlateId: 'p2'});
    plateSeed.flush({});
    await done;

    expect(service.settings.language).toBe('en');
    expect(localStorage.getItem('app-language')).toBeNull();
    expect(localStorage.getItem('plate_quickMove_p1')).toBeNull();
  });

  it('does not offer the browser settings for what the server already has', async () => {
    localStorage.setItem('app-language', 'en');
    localStorage.setItem('delay_thresholds', JSON.stringify({warning: 5, danger: 12}));

    const done = service.init();
    http.expectOne(url('settings')).flush({language: 'it', delayThresholds: {warning: 10, danger: 20}});
    await Promise.resolve();
    http.expectOne(url('plate')).flush([]);
    await done;

    expect(service.settings.language).toBe('it');
    expect(localStorage.getItem('app-language')).toBeNull();
  });

  it('only seeds the plate options not configured yet', async () => {
    localStorage.setItem('plate_quickMove_p1', JSON.stringify({enabled: true, targetPlateId: 'p2'}));
    localStorage.setItem('plate_expandedDoneButton_p1', JSON.stringify({enabled: true}));

    const done = service.init();
    http.expectOne(url('settings')).flush({language: 'it'});
    await Promise.resolve();
    http.expectOne(url('plate')).flush([{id: 'p1', quickMoveEnabled: false, quickMoveTargetPlateId: ''}]);
    await Promise.resolve();
    const plateSeed = http.expectOne(url('plate/p1/seed-settings'));
    expect(plateSeed.request.body).toEqual({expandedDoneButtonEnabled: true});
    plateSeed.flush({});
    await done;
  });

  it('keeps the browser settings when the server is not reachable', async () => {
    localStorage.setItem('app-language', 'en');
    const done = service.init();
    http.expectOne(url('settings')).error(new ProgressEvent('error'));
    await done;

    expect(service.settings).toEqual({});
    expect(localStorage.getItem('app-language')).toBe('en');
  });
});
