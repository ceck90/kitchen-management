import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom, Observable, timeout} from 'rxjs';
import {RequestService} from '../modules/shared/service/request.service';

export interface AppDelayThresholds {
  warning: number;
  danger: number;
}

export interface AppPlatePair {
  id: string;
  name: string;
  plateId1: string;
  plateId2: string;
  plateName1?: string;
  plateName2?: string;
}

/**
 * Settings shared by all the clients. A section is null until someone configures it.
 */
export interface AppSettings {
  delayThresholds?: AppDelayThresholds | null;
  platePairs?: AppPlatePair[] | null;
  language?: string | null;
}

/** Keys the settings used to be kept under in the browser local storage */
const LEGACY_KEYS = {
  language: 'app-language',
  delayThresholds: 'delay_thresholds',
  platePairs: 'plate_pairs_config',
  plateQuickMove: (plateId: string) => `plate_quickMove_${plateId}`,
  plateExpandedDoneButton: (plateId: string) => `plate_expandedDoneButton_${plateId}`
};

/**
 * Loads the settings stored on the server before the app starts and keeps them in memory.
 *
 * The first time a browser opens the app after the update, the settings it still has in its local storage are
 * offered to the server, which stores them only where nobody configured them yet: with several browsers opening
 * the app together the first one wins, the others find the stored values. The old local values are then dropped.
 */
@Injectable({
  providedIn: 'root'
})
export class AppSettingsService {

  private static readonly REQUEST_TIMEOUT_MS = 4000;

  private _settings: AppSettings = {};

  constructor(private _http: HttpClient) {
  }

  public get settings(): AppSettings {
    return this._settings;
  }

  public async init(): Promise<void> {
    try {
      this._settings = await this._request(this._http.get<AppSettings>(this._url(), RequestService.baseHttpOptions));

      const seed = this._legacySettings();
      if (this._hasMissingSection(seed)) {
        this._settings = await this._request(this._http.post<AppSettings>(`${this._url()}/seed`, this._onlyMissing(seed), RequestService.baseHttpOptions));
      }

      await this._migratePlateOptions();
      this._dropLegacySettings();
    } catch (e) {
      // server not reachable: the app starts with the defaults, the old local values stay where they are
      console.error('Unable to load the settings from the server', e);
    }
  }

  public update(settings: AppSettings): void {
    this._settings = {...this._settings, ...settings};
    this._http.put<AppSettings>(this._url(), settings, RequestService.baseHttpOptions)
      .subscribe({error: e => console.error('Unable to save the settings on the server', e)});
  }

  private async _migratePlateOptions(): Promise<void> {
    const plates = await this._request(this._http.get<any[]>(`${RequestService.baseUrl}/plate`, RequestService.baseHttpOptions));
    for (const plate of plates) {
      const quickMove = this._readJson(LEGACY_KEYS.plateQuickMove(plate.id));
      const expandedDone = this._readJson(LEGACY_KEYS.plateExpandedDoneButton(plate.id));
      const seed: any = {};
      if (plate.quickMoveEnabled == null && quickMove) {
        seed.quickMoveEnabled = !!quickMove.enabled;
        seed.quickMoveTargetPlateId = quickMove.targetPlateId || '';
      }
      if (plate.expandedDoneButtonEnabled == null && expandedDone) {
        seed.expandedDoneButtonEnabled = !!expandedDone.enabled;
      }
      if (Object.keys(seed).length) {
        await this._request(this._http.post(`${RequestService.baseUrl}/plate/${plate.id}/seed-settings`, seed, RequestService.baseHttpOptions));
      }
    }
  }

  private _legacySettings(): AppSettings {
    const seed: AppSettings = {};
    const language = this._read(LEGACY_KEYS.language);
    if (language === 'it' || language === 'en') {
      seed.language = language;
    }
    const thresholds = this._readJson(LEGACY_KEYS.delayThresholds);
    if (thresholds && typeof thresholds.warning === 'number' && typeof thresholds.danger === 'number') {
      seed.delayThresholds = thresholds;
    }
    const pairs = this._readJson(LEGACY_KEYS.platePairs);
    if (Array.isArray(pairs)) {
      seed.platePairs = pairs;
    }
    return seed;
  }

  private _onlyMissing(seed: AppSettings): AppSettings {
    const result: AppSettings = {};
    (Object.keys(seed) as (keyof AppSettings)[]).forEach(section => {
      if (this._settings[section] == null) {
        (result as any)[section] = seed[section];
      }
    });
    return result;
  }

  private _hasMissingSection(seed: AppSettings): boolean {
    return Object.keys(this._onlyMissing(seed)).length > 0;
  }

  private _dropLegacySettings(): void {
    try {
      localStorage.removeItem(LEGACY_KEYS.language);
      localStorage.removeItem(LEGACY_KEYS.delayThresholds);
      localStorage.removeItem(LEGACY_KEYS.platePairs);
      Object.keys(localStorage)
        .filter(key => key.startsWith('plate_quickMove_') || key.startsWith('plate_expandedDoneButton_'))
        .forEach(key => localStorage.removeItem(key));
    } catch (e) {
      // local storage not available
    }
  }

  private _read(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  private _readJson(key: string): any {
    const value = this._read(key);
    if (!value) {
      return null;
    }
    try {
      return JSON.parse(value);
    } catch (e) {
      return null;
    }
  }

  private _request<T>(request$: Observable<T>): Promise<T> {
    return firstValueFrom(request$.pipe(timeout(AppSettingsService.REQUEST_TIMEOUT_MS)));
  }

  private _url(): string {
    return `${RequestService.baseUrl}/settings`;
  }
}
