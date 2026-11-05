import {Injectable} from '@angular/core';
import {I18N as i18nIta} from "../../assets/i18n-ita";
import {I18N_ENG as i18nEng} from "../../assets/i18n-eng";
import {BehaviorSubject, Observable} from 'rxjs';
import {AppSettingsService} from './app-settings.service';

export type SupportedLanguage = 'it' | 'en';

@Injectable()
export class I18nService {

  private _i18n: any;
  private _currentLanguage$ = new BehaviorSubject<SupportedLanguage>('it');

  constructor(private _appSettings: AppSettingsService) {
    const storedLang = this._appSettings.settings.language;
    const initialLang = (storedLang === 'it' || storedLang === 'en') ? storedLang : this._getBrowserLanguage();

    this._applyLanguage(initialLang);
  }

  public get instance(): any {
    return this._i18n;
  }

  public get currentLanguage$(): Observable<SupportedLanguage> {
    return this._currentLanguage$.asObservable();
  }

  public get currentLanguage(): SupportedLanguage {
    return this._currentLanguage$.value;
  }

  public setLanguage(lang: SupportedLanguage): void {
    this._applyLanguage(lang);
    this._appSettings.update({language: lang});
  }

  private _applyLanguage(lang: SupportedLanguage): void {
    this._currentLanguage$.next(lang);
    
    if (lang === 'en') {
      this._i18n = i18nEng;
    } else {
      this._i18n = i18nIta;
    }
  }

  public getAvailableLanguages(): Array<{code: SupportedLanguage, label: string, flag: string}> {
    return [
      { code: 'it', label: 'Italiano', flag: '🇮🇹' },
      { code: 'en', label: 'English', flag: '🇬🇧' }
    ];
  }

  private _getBrowserLanguage(): SupportedLanguage {
    const lang = navigator.language.toLowerCase();
    
    if (lang.startsWith('it')) {
      return 'it';
    } else if (lang.startsWith('en')) {
      return 'en';
    }
    
    return 'it'; // Default
  }
}
